import React, { useState } from 'react';
import { Machine } from '../../types';
import { startMachine, clearMachine, reportMachine, getOwnerWhatsApp } from '../../services/api';

interface MachineListRowProps {
  machine: Machine;
  onToggleQueue?: () => void;
  executeWithAuth?: (action: (userId: string) => void) => void;
  onActionSuccess?: () => void;
}

const MachineListRow: React.FC<MachineListRowProps> = ({ machine, onToggleQueue, executeWithAuth, onActionSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:border-slate-300 mb-3">
      {/* Header Row (Always Visible) */}
      <button 
        className="w-full flex items-center justify-between p-4 focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg
            ${machine.type === 'WASHER' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
            {machine.type === 'WASHER' ? 'W' : 'D'}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-800">
              {machine.type === 'WASHER' ? 'Washing' : 'Dryer'} #{machine.displayId || machine.id}
            </h3>
            <p className="text-xs text-slate-500">Floor {machine.floor}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Queue Badge (Only if full and queue exists) */}
          {isFull && (machine._count?.queueEntries || 0) > 0 && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-700 border border-purple-200 px-2 py-1 rounded-full text-xs font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              {machine._count?.queueEntries}
            </div>
          )}
          
          <div className={`px-3 py-1 rounded-full text-xs font-bold border hidden sm:block ${getStatusBadge(machine.status)}`}>
            {machine.status}
          </div>
          {/* Mobile minimal status dot */}
          <div className={`w-3 h-3 rounded-full sm:hidden ${
            machine.status === 'BOS' ? 'bg-green-500' : 
            machine.status === 'DOLU' ? 'bg-red-500' : 
            machine.status === 'BITTI' ? 'bg-yellow-500' : 'bg-slate-400'
          }`}></div>
          
          <div className="text-slate-400 transform transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Left Column: Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center sm:hidden">
                 <span className="text-sm font-medium text-slate-500">Status</span>
                 <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(machine.status)}`}>
                  {machine.status}
                </div>
              </div>

              {isFull && remainingTime > 0 && (
                <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-100">
                  <span className="text-sm text-red-600 font-semibold">Remaining</span>
                  <span className="text-lg font-bold text-red-700">{remainingTime} min</span>
                </div>
              )}

              {isFull && (
                <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <span className="text-sm text-purple-600 font-semibold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Queue
                  </span>
                  <span className="text-lg font-bold text-purple-700">{machine._count?.queueEntries || 0} person(s)</span>
                </div>
              )}

              {machine.userNote && (
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">User Note</p>
                  <p className="text-sm text-slate-700 italic">"{machine.userNote}"</p>
                </div>
              )}
            </div>

            {/* Right Column: Actions */}
            <div className="flex flex-col gap-2 justify-end">
              {machine.status === 'BOS' && (
                <button onClick={handleStart} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm">
                  Start Use
                </button>
              )}
              {machine.status === 'DOLU' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleQueue?.(); }}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm ${
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
                  <button onClick={handleClear} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm">
                    I took my laundry (Clear)
                  </button>
                  <button onClick={handleWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Send WhatsApp to Owner
                  </button>
                </>
              )}
              {machine.status === 'BOZUK' && (
                <button disabled className="w-full bg-slate-200 text-slate-500 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed">
                  Out of Order
                </button>
              )}

              {machine.status !== 'BOZUK' && (
                <button onClick={handleReport} className="w-full py-2.5 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-sm font-semibold transition-colors duration-200">
                  Report Issue
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MachineListRow;
