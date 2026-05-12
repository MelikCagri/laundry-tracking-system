import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeToPush } from '../../services/pushNotifications';
import { getSavedUser } from '../../services/auth';

const NotificationBell: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Check permission on mount and when it might change
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    const user = getSavedUser();
    if (!user) return;

    setIsSubscribing(true);
    try {
      const result = await subscribeToPush(user.id);
      
      if (typeof Notification !== 'undefined') {
        setPermission(Notification.permission);
      }

      if (result === 'subscribed') {
        toast.success('Bildirimler başarıyla aktifleştirildi!');
      } else if (result === 'denied') {
        toast.error('Bildirim izni reddedildi. Tarayıcı ayarlarından açabilirsiniz.');
      } else if (result === 'ios-not-pwa') {
        toast.error('iPhone\'da bildirim almak için uygulamayı ana ekrana eklemelisiniz.');
      }
    } catch (error) {
      console.error('Push subscription error:', error);
      toast.error('Bildirimler açılırken bir hata oluştu.');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (typeof Notification === 'undefined') return null;

  return (
    <button
      onClick={handleRequestPermission}
      disabled={isSubscribing || permission === 'granted'}
      className={`relative p-2 rounded-xl transition-all ${
        permission === 'granted'
          ? 'bg-green-50 text-green-600 border border-green-100'
          : permission === 'denied'
          ? 'bg-red-50 text-red-500 border border-red-100 hover:bg-red-100'
          : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 animate-pulse-subtle'
      }`}
      title={
        permission === 'granted'
          ? 'Bildirimler aktif'
          : permission === 'denied'
          ? 'Bildirimler engelli (Açmak için tıklayın)'
          : 'Bildirimleri aktifleştir'
      }
    >
      {permission === 'granted' ? (
        <Bell size={20} />
      ) : permission === 'denied' ? (
        <BellOff size={20} />
      ) : (
        <Bell size={20} />
      )}
      
      {permission !== 'granted' && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm border border-white">
          !
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
