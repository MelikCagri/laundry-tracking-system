import React from 'react';
import { Machine } from '../../types';

interface MachineModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
}

const MachineModal: React.FC<MachineModalProps> = ({ machine, isOpen, onClose }) => {
  if (!isOpen || !machine) return null;

  const getStatusBadge = (status: Machine['status']) => {
    switch (status) {
      case 'Empty': return 'bg-green-100 text-green-700 border-green-200';
      case 'Full': return 'bg-red-100 text-red-700 border-red-200';
      case 'Finished': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Broken': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isFull = machine.status === 'Full';
  const remainingTime = isFull && machine.endTime 
    ? Math.round((machine.endTime.getTime() - new Date().getTime()) / 60000)
    : 0;

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
              {machine.type === 'Laundry' ? 'Washing Machine' : 'Dryer'} #{machine.id}
            </h2>
            <p className="text-sm text-slate-500 font-medium">Floor {machine.floorNumber}</p>
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

          {machine.userNote && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">User Note</p>
              <p className="text-sm text-slate-700 italic">"{machine.userNote}"</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
          {machine.status !== 'Broken' ? (
            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm">
              {machine.status === 'Empty' ? 'Start Use' : 'View / Edit My Usage'}
            </button>
          ) : (
            <button disabled className="w-full bg-slate-200 text-slate-500 py-3 rounded-xl text-sm font-semibold cursor-not-allowed">
              Out of Order
            </button>
          )}

          {machine.status !== 'Broken' && (
            <button className="w-full py-3 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-sm font-semibold transition-colors duration-200">
              Report Issue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineModal;
