const API_BASE = 'http://localhost:5000/api';

/**
 * Converts a base64 URL string to a Uint8Array — required by the Web Push API
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0))) as Uint8Array<ArrayBuffer>;
}

/**
 * Detects if the current browser is iOS Safari (requires PWA install for push)
 */
export const isIOS = (): boolean => {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

/**
 * Detects if running as an installed PWA (standalone mode)
 */
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches;
};

/**
 * Registers the service worker and subscribes the user to push notifications.
 * Saves the resulting subscription object to the backend linked to the given userId.
 *
 * Returns 'subscribed' | 'denied' | 'ios-not-pwa' | 'unsupported'
 */
export const subscribeToPush = async (userId: string): Promise<'subscribed' | 'denied' | 'ios-not-pwa' | 'unsupported'> => {
  // iOS requires the app to be installed as a PWA for push to work
  if (isIOS() && !isPWA()) {
    return 'ios-not-pwa';
  }

  // Check for browser support
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported';
  }

  // Register service worker
  const registration = await navigator.serviceWorker.register('/service-worker.js');
  await navigator.serviceWorker.ready;

  // Check current permission status
  const permissionResult = await Notification.requestPermission();
  if (permissionResult !== 'granted') {
    return 'denied';
  }

  // Fetch VAPID public key from backend
  const keyRes = await fetch(`${API_BASE}/users/vapid-public-key`);
  const { publicKey } = await keyRes.json();

  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  // Save subscription to backend
  await fetch(`${API_BASE}/users/${userId}/subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription }),
  });

  return 'subscribed';
};
