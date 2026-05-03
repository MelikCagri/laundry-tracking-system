import React, { useState } from 'react';
import MachineCard from '../components/feature/MachineCard';
import MachineListRow from '../components/feature/MachineListRow';
import MachineModal from '../components/feature/MachineModal';
import { Machine } from '../types';

// Mock Data
const INITIAL_MACHINES: Machine[] = [
  // Floor 1 (5 Washing, 2 Dryer)
  { id: '101', type: 'Laundry', status: 'Empty', floorNumber: 1 },
  { id: '102', type: 'Laundry', status: 'Full', floorNumber: 1, endTime: new Date(Date.now() + 45 * 60000), userNote: 'Biterse üstüne koyabilirsiniz.', queueCount: 2, isCurrentUserInQueue: false },
  { id: '103', type: 'Laundry', status: 'Broken', floorNumber: 1, userNote: 'Water leaking' },
  { id: '104', type: 'Laundry', status: 'Empty', floorNumber: 1 },
  { id: '105', type: 'Laundry', status: 'Finished', floorNumber: 1, endTime: new Date(Date.now() - 10 * 60000) },
  { id: '106', type: 'Dryer', status: 'Full', floorNumber: 1, endTime: new Date(Date.now() + 20 * 60000), queueCount: 0, isCurrentUserInQueue: false },
  { id: '107', type: 'Dryer', status: 'Empty', floorNumber: 1 },
  // Floor 2 (5 Washing, 3 Dryer)
  { id: '201', type: 'Laundry', status: 'Empty', floorNumber: 2 },
  { id: '202', type: 'Laundry', status: 'Empty', floorNumber: 2 },
  { id: '203', type: 'Laundry', status: 'Full', floorNumber: 2, endTime: new Date(Date.now() + 15 * 60000), queueCount: 1, isCurrentUserInQueue: true },
  { id: '204', type: 'Laundry', status: 'Finished', floorNumber: 2, endTime: new Date(Date.now() - 5 * 60000), userNote: 'Lütfen çamaşırları sepete alın.' },
  { id: '205', type: 'Laundry', status: 'Broken', floorNumber: 2 },
  { id: '206', type: 'Dryer', status: 'Empty', floorNumber: 2 },
  { id: '207', type: 'Dryer', status: 'Broken', floorNumber: 2, userNote: 'Does not heat up' },
  { id: '208', type: 'Dryer', status: 'Full', floorNumber: 2, endTime: new Date(Date.now() + 30 * 60000) },
];

const Dashboard: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [selectedFloor, setSelectedFloor] = useState<number | 'All'>('All');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredMachines = machines.filter(
    (m) => selectedFloor === 'All' || m.floorNumber === selectedFloor
  );

  const toggleQueue = (machineId: string) => {
    setMachines(prev => prev.map(m => {
      if (m.id === machineId) {
        const inQueue = m.isCurrentUserInQueue;
        return {
          ...m,
          isCurrentUserInQueue: !inQueue,
          queueCount: Math.max(0, (m.queueCount || 0) + (inQueue ? -1 : 1))
        };
      }
      return m;
    }));
    
    if (selectedMachine?.id === machineId) {
      const m = machines.find(mac => mac.id === machineId);
      if (m) {
        const inQueue = m.isCurrentUserInQueue;
        setSelectedMachine({
          ...m,
          isCurrentUserInQueue: !inQueue,
          queueCount: Math.max(0, (m.queueCount || 0) + (inQueue ? -1 : 1))
        });
      }
    }
  };

  // Group by type for better visualization
  const washingMachines = filteredMachines.filter(m => m.type === 'Laundry');
  const dryers = filteredMachines.filter(m => m.type === 'Dryer');

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">KYK Laundry</h1>
            <p className="text-slate-500 text-lg">Real-time availability and tracking</p>
          </div>
          
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-full md:w-auto">
            {['All', 1, 2].map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor as number | 'All')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  selectedFloor === floor
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {floor === 'All' ? 'All Floors' : `Floor ${floor}`}
              </button>
            ))}
          </div>
        </header>

        <div className="mb-6 flex justify-end">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                viewMode === 'grid' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                viewMode === 'list' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              List
            </button>
          </div>
        </div>

        <main className="space-y-12">
          {washingMachines.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">W</span>
                Washing Machines
              </h2>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {washingMachines.map((machine) => (
                    <MachineCard key={machine.id} machine={machine} onClick={setSelectedMachine} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col">
                  {washingMachines.map((machine) => (
                    <MachineListRow key={machine.id} machine={machine} onToggleQueue={() => toggleQueue(machine.id)} />
                  ))}
                </div>
              )}
            </section>
          )}

          {dryers.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">D</span>
                Dryers
              </h2>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {dryers.map((machine) => (
                    <MachineCard key={machine.id} machine={machine} onClick={setSelectedMachine} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col">
                  {dryers.map((machine) => (
                    <MachineListRow key={machine.id} machine={machine} onToggleQueue={() => toggleQueue(machine.id)} />
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      <MachineModal 
        machine={selectedMachine} 
        isOpen={!!selectedMachine} 
        onClose={() => setSelectedMachine(null)} 
        onToggleQueue={toggleQueue}
      />
    </div>
  );
};

export default Dashboard;
