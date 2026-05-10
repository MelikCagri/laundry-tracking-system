import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSavedUser } from '../../services/auth';
import { getUserPendingTurn, skipQueue, startMachine } from '../../services/api';

interface PendingTurn {
  id: string;
  machineId: string;
  machine: { id: string; block: string; floor: number; type: string };
}

interface YourTurnBannerProps {
  onUse: (machineId: string) => void; // Opens the machine modal for the user to start
  onRefresh: () => void;
}

/**
 * Polls for a pending "your turn" notification every 30s.
 * Shows a banner with "Kullan" / "Atla" when the user's queue turn is active.
 */
const YourTurnBanner: React.FC<YourTurnBannerProps> = ({ onUse, onRefresh }) => {
  const [pendingTurn, setPendingTurn] = useState<PendingTurn | null>(null);

  const checkPendingTurn = async () => {
    const user = getSavedUser();
    if (!user) return;
    try {
      const entry = await getUserPendingTurn(user.id);
      setPendingTurn(entry || null);
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    checkPendingTurn();
    // Poll every 30 seconds so banner appears even without a page refresh
    const interval = setInterval(checkPendingTurn, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleUse = () => {
    if (!pendingTurn) return;
    onUse(pendingTurn.machineId);
    setPendingTurn(null);
  };

  const handleSkip = async () => {
    const user = getSavedUser();
    if (!user || !pendingTurn) return;
    try {
      await skipQueue(pendingTurn.machineId, user.id);
      toast.success('Sıranızı atladınız. Bir sonraki kişiye geçildi.');
      setPendingTurn(null);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || 'İşlem başarısız.');
    }
  };

  if (!pendingTurn) return null;

  const machineLabel =
    pendingTurn.machine.type === 'WASHER' ? 'Çamaşır Makinesi' : 'Kurutma Makinesi';

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        color: 'white',
        padding: '16px',
        borderRadius: '16px',
        margin: '0 0 16px 0',
        boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
        animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '28px' }}>🚀</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: '16px' }}>Sıra Sizde!</div>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>
            {pendingTurn.machine.block} Blok, Kat {pendingTurn.machine.floor} — {machineLabel} boşaldı.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleUse}
          style={{
            flex: 1,
            background: 'white',
            color: '#4f46e5',
            border: 'none',
            borderRadius: '10px',
            padding: '10px',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ✅ Kullanmak İstiyorum
        </button>
        <button
          onClick={handleSkip}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: '1.5px solid rgba(255,255,255,0.4)',
            borderRadius: '10px',
            padding: '10px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ⏭ Atla
        </button>
      </div>
    </div>
  );
};

export default YourTurnBanner;
