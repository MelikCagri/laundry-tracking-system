import webpush from 'web-push';
import prisma from '../lib/prisma';

// Configure web-push with VAPID keys from environment
webpush.setVapidDetails(
  process.env.VAPID_CONTACT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string; // URL to open when notification is clicked
  tag?: string; // Unique tag to replace duplicate notifications
}

/**
 * Returns the list of push subscriptions stored for a user.
 * Handles both legacy single-object format and the new array format.
 */
const getSubscriptions = (raw: unknown): webpush.PushSubscription[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as webpush.PushSubscription[];
  // Legacy: single subscription object stored directly
  return [raw as webpush.PushSubscription];
};

/**
 * Sends a Web Push notification to ALL devices registered for a user.
 * Silently skips if the user has no push subscription (not opted in).
 * Clears stale subscriptions from the DB if the push service rejects them (410 Gone).
 */
export const sendNotificationToUser = async (
  userId: string,
  payload: NotificationPayload
): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.pushSubscription) return false;

  const subscriptions = getSubscriptions(user.pushSubscription);
  if (subscriptions.length === 0) return false;

  let atLeastOneSent = false;
  const validSubscriptions: webpush.PushSubscription[] = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
      validSubscriptions.push(sub); // still valid
      atLeastOneSent = true;
    } catch (err: any) {
      if (err.statusCode === 410) {
        // 410 Gone = this specific subscription is stale; drop it
        console.log(`[Push] Removing stale subscription for user ${userId} (endpoint: ${sub.endpoint?.slice(-20)})`);
      } else {
        // Non-fatal error: keep the subscription but log it
        validSubscriptions.push(sub);
        console.error(`[Push] Failed to send to device for user ${userId}:`, err.message);
      }
    }
  }

  // If any subscriptions were removed, update the DB
  if (validSubscriptions.length !== subscriptions.length) {
    await prisma.user.update({
      where: { id: userId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { pushSubscription: validSubscriptions.length > 0 ? (validSubscriptions as any) : undefined },
    });
  }

  return atLeastOneSent;
};

/**
 * Add or update a device's push subscription for a user.
 * Stores an array of subscriptions — one per device endpoint.
 * If the same endpoint already exists, it is replaced (keeps the key fresh).
 */
export const saveSubscription = async (userId: string, subscription: webpush.PushSubscription) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const existing = getSubscriptions(user.pushSubscription);

  // Replace if same endpoint already registered; otherwise append
  const updated = [
    ...existing.filter((s) => s.endpoint !== subscription.endpoint),
    subscription,
  ];

  return prisma.user.update({
    where: { id: userId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { pushSubscription: updated as any },
  });
};
