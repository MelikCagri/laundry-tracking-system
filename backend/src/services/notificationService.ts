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
 * Sends a Web Push notification to a single user by their userId.
 * Silently skips if the user has no push subscription (not opted in).
 * Clears stale subscriptions from the DB if the push service rejects them (410 Gone).
 */
export const sendNotificationToUser = async (
  userId: string,
  payload: NotificationPayload
): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.pushSubscription) return false; // User has no subscription, skip silently

  try {
    await webpush.sendNotification(
      user.pushSubscription as unknown as webpush.PushSubscription,
      JSON.stringify(payload)
    );
    return true;
  } catch (err: any) {
    // 410 Gone = subscription is no longer valid (user unsubscribed or browser cleared it)
    if (err.statusCode === 410) {
      await prisma.user.update({
        where: { id: userId },
        data: { pushSubscription: undefined },
      });
    }
    console.error(`[Push] Failed to send notification to user ${userId}:`, err.message);
    return false;
  }
};

/**
 * Save or update a user's push subscription in the database.
 * Called from the /api/users/:id/subscription endpoint.
 */
export const saveSubscription = async (userId: string, subscription: object) => {
  return prisma.user.update({
    where: { id: userId },
    data: { pushSubscription: subscription },
  });
};
