import React, { useEffect, useState } from 'react';
import { subscribeToPush, isIOS, isPWA } from '../../services/pushNotifications';
import { getSavedUser } from '../../services/auth';

/**
 * Shown after login. Prompts users to enable push notifications.
 * Handles iOS PWA install instructions separately.
 */
const NotificationPermissionBanner: React.FC = () => {
  const [state, setState] = useState<'hidden' | 'prompt' | 'ios-guide' | 'subscribed' | 'denied'>('hidden');

  useEffect(() => {
    const user = getSavedUser();
    if (!user) return;

    // Already granted — no need to show banner
    if (Notification.permission === 'granted') {
      // Still subscribe in case the subscription was lost (e.g., after browser update)
      subscribeToPush(user.id);
      return;
    }

    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }

    // Show iOS-specific guide or regular prompt
    if (isIOS() && !isPWA()) {
      setState('ios-guide');
    } else if ('Notification' in window) {
      setState('prompt');
    }
  }, []);

  const handleEnable = async () => {
    const user = getSavedUser();
    if (!user) return;
    const result = await subscribeToPush(user.id);
    setState(result === 'subscribed' ? 'subscribed' : result === 'denied' ? 'denied' : 'hidden');
  };

  if (state === 'hidden' || state === 'subscribed') return null;

  if (state === 'ios-guide') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '12px',
        margin: '8px 16px',
        fontSize: '13px',
        lineHeight: '1.5',
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>📱 Bildirimleri Etkinleştir (iPhone)</div>
        <div>
          Bildirim alabilmek için uygulamayı ana ekrana ekleyin:{' '}
          <strong>Safari → Paylaş (⬆️) → Ana Ekrana Ekle</strong>. Ardından uygulamayı ana ekrandan açın.
        </div>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div style={{
        background: '#FEF3C7',
        color: '#92400E',
        padding: '10px 16px',
        borderRadius: '12px',
        margin: '8px 16px',
        fontSize: '13px',
      }}>
        ⚠️ Bildirimler engellendi. Tarayıcı ayarlarından izin vererek bildirim alabilirsiniz.
      </div>
    );
  }

  // Default: prompt state
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '12px',
      margin: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '13px',
    }}>
      <span style={{ fontSize: '24px' }}>🔔</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>Bildirim Al</div>
        <div style={{ opacity: 0.8 }}>Çamaşırınız bittiğinde veya sıranız geldiğinde haber alalım.</div>
      </div>
      <button
        onClick={handleEnable}
        style={{
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 14px',
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontSize: '12px',
        }}
      >
        İzin Ver
      </button>
    </div>
  );
};

export default NotificationPermissionBanner;
