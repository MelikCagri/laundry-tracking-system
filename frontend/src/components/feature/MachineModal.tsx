import React from 'react';
import { Machine } from '../../types';
import { startMachine, clearMachine, reportMachine, getOwnerWhatsApp } from '../../services/api';

interface MachineModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleQueue?: (machineId: string) => void;
  executeWithAuth?: (action: (userId: string) => void) => void;
  onActionSuccess?: () => void;
}

const MachineModal: React.FC<MachineModalProps> = ({ machine, isOpen, onClose, onToggleQueue, executeWithAuth, onActionSuccess }) => {
  if (!isOpen || !machine) return null;

  const getStatusBadge = (status: Machine['status']) => {
    switch (status) {
      case 'BOS': return 'bg-green-100 text-green-700 border-green-200';
      case 'DOLU': return 'bg-red-100 text-red-700 border-red-200';
      case 'BITTI': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'BOZUK': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isFull = machine.status === 'DOLU';
  const remainingTime = isFull && machine.endTime 
    ? Math.round((new Date(machine.endTime).getTime() - new Date().getTime()) / 60000)
    : 0;

  const handleStart = () => {
    if (!executeWithAuth) return;
    const minutesStr = window.prompt("Program duration in minutes?", "45");
    if (!minutesStr) return;
    const durationMinutes = parseInt(minutesStr, 10);
    const userNote = window.prompt("Any notes for the next person? (Optional)") || undefined;

    executeWithAuth(async (userId) => {
      try {
        await startMachine(machine.id, userId, durationMinutes, userNote);
        onActionSuccess?.();
        onClose();
      } catch (e: any) {
        alert(e.message);
      }
    });
  };

  const handleClear = () => {
    if (!executeWithAuth) return;
    executeWithAuth(async () => {
      try {
        await clearMachine(machine.id);
        onActionSuccess?.();
        onClose();
      } catch (e: any) {
        alert(e.message);
      }
    });
  };

  const handleReport = () => {
    if (!executeWithAuth) return;
    executeWithAuth(async (userId) => {
      try {
        await reportMachine(machine.id, userId);
        onActionSuccess?.();
        onClose();
      } catch (e: any) {
        alert(e.message);
      }
    });
  };

  const handleWhatsApp = async () => {
    try {
      const data = await getOwnerWhatsApp(machine.id);
      window.open(data.whatsappUrl, '_blank');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {machine.type === 'WASHER' ? 'Washing Machine' : 'Dryer'} #{machine.displayId || machine.id}
            </h2>
            <p className="text-sm text-slate-500 font-medium">Floor {machine.floor}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Status</span>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(machine.status)}`}>
              {machine.status}
            </div>
          </div>

          {isFull && remainingTime > 0 && (
            <div className="flex justify-between items-center bg-red-50 p-3 rounded-xl border border-red-100">
              <span className="text-red-600 font-semibold">Remaining Time</span>
              <span className="text-xl font-bold text-red-700">{remainingTime} mins</span>
            </div>
          )}

          {isFull && (
            <div className="flex justify-between items-center bg-purple-50 p-3 rounded-xl border border-purple-100">
              <span className="text-purple-600 font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Queue Line
              </span>
              <span className="text-xl font-bold text-purple-700">{machine._count?.queueEntries || 0} person(s)</span>
            </div>
          )}

          {machine.userNote && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">User Note</p>
              <p className="text-sm text-slate-700 italic">"{machine.userNote}"</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
          {machine.status === 'BOS' && (
            <button onClick={handleStart} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm">
              Start Use
            </button>
          )}
          
          {machine.status === 'DOLU' && (
            <button 
              onClick={() => onToggleQueue?.(machine.id)}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm ${
                machine.isCurrentUserInQueue 
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {machine.isCurrentUserInQueue ? 'Leave Queue' : 'Join Queue'}
            </button>
          )}
          
          {machine.status === 'BITTI' && (
            <>
              <button onClick={handleClear} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm">
                I took my laundry (Clear)
              </button>
              <button onClick={handleWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Send WhatsApp to Owner
              </button>
            </>
          )}

          {machine.status === 'BOZUK' && (
            <button disabled className="w-full bg-slate-200 text-slate-500 py-3 rounded-xl text-sm font-semibold cursor-not-allowed">
              Out of Order
            </button>
          )}

          {machine.status !== 'BOZUK' && (
            <button onClick={handleReport} className="w-full py-3 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-sm font-semibold transition-colors duration-200">
              Report Issue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineModal;
