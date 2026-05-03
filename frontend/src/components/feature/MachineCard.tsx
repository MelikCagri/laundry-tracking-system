import React from 'react';
import { Machine } from '../../types';

interface MachineCardProps {
  machine: Machine;
  onClick: (machine: Machine) => void;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine, onClick }) => {
  const getTileStyles = (status: Machine['status']) => {
    switch (status) {
      case 'Empty':
        return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 hover:border-green-400';
      case 'Full':
        return 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200 hover:border-red-400';
      case 'Finished':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 hover:border-yellow-400';
      case 'Broken':
        return 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';
    }
  };

  const isFull = machine.status === 'Full';
  const remainingTime = isFull && machine.endTime 
    ? Math.round((machine.endTime.getTime() - new Date().getTime()) / 60000)
    : null;

  return (
    <button 
      onClick={() => onClick(machine)}
      className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-200 shadow-sm active:scale-95 ${getTileStyles(machine.status)}`}
    >
      {/* Icon Placeholder (W or D) */}
      <span className="text-2xl font-black opacity-80">
        {machine.type === 'Laundry' ? 'W' : 'D'}
      </span>
      
      {/* ID */}
      <span className="text-xs font-bold mt-1 opacity-90">
        #{machine.id}
      </span>

      {/* Time Badge (Only if full) */}
      {remainingTime !== null && remainingTime > 0 && (
        <div className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md animate-in zoom-in">
          {remainingTime}m
        </div>
      )}

      {/* Note indicator */}
      {machine.userNote && (
        <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
      )}
    </button>
  );
};

export default MachineCard;
