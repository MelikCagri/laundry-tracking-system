import React, { useState } from 'react';
import MachineCard from '../components/feature/MachineCard';
import MachineListRow from '../components/feature/MachineListRow';
import MachineModal from '../components/feature/MachineModal';
import AuthModal from '../components/feature/AuthModal';
import { Machine } from '../types';

import { getAllMachines, joinQueue, leaveQueue, getUserQueues } from '../services/api';
import { getSavedUser } from '../services/auth';

const Dashboard: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | 'All'>('All');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<((userId: string) => void) | null>(null);

  React.useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const data = await getAllMachines();
      const user = getSavedUser();
      let userQueues: string[] = [];
      
      if (user) {
        const queues = await getUserQueues(user.id);
        userQueues = queues.map((q: any) => q.machineId);
      }

      // Add a simple sequential number for display and check queue status
      const withDisplayIds = data.map((m: any, index: number) => ({
        ...m,
        displayId: (index + 1).toString(),
        isCurrentUserInQueue: userQueues.includes(m.id)
      }));
      setMachines(withDisplayIds);
    } catch (error) {
      console.error("Failed to fetch machines:", error);
    }
  };

  const filteredMachines = machines.filter(
    (m) => selectedFloor === 'All' || m.floor === selectedFloor
  );

  const executeWithAuth = (action: (userId: string) => void) => {
    const user = getSavedUser();
    if (user) {
      action(user.id);
    } else {
      setPendingAction(() => action);
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    const user = getSavedUser();
    if (user && pendingAction) {
      pendingAction(user.id);
    }
    setPendingAction(null);
  };

  const toggleQueue = (machineId: string) => {
    executeWithAuth(async (userId) => {
      try {
        const m = machines.find(mac => mac.id === machineId);
        if (!m) return;

        if (m.isCurrentUserInQueue) {
          await leaveQueue(machineId, userId);
        } else {
          await joinQueue(machineId, userId);
        }
        await fetchMachines(); // Refresh data
        
        // Update selected machine if modal is open
        if (selectedMachine?.id === machineId) {
          const updatedMachines = await getAllMachines();
          const updatedM = updatedMachines.find((mac: Machine) => mac.id === machineId);
          if (updatedM) setSelectedMachine(updatedM);
        }
      } catch (error) {
        console.error("Failed to toggle queue:", error);
        alert("Failed to update queue.");
      }
    });
  };

  // Group by type for better visualization
  const washingMachines = filteredMachines.filter(m => m.type === 'WASHER');
  const dryers = filteredMachines.filter(m => m.type === 'DRYER');

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
                    <MachineListRow 
                      key={machine.id} 
                      machine={machine} 
                      onToggleQueue={() => toggleQueue(machine.id)} 
                      executeWithAuth={executeWithAuth}
                      onActionSuccess={fetchMachines}
                    />
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
                    <MachineListRow 
                      key={machine.id} 
                      machine={machine} 
                      onToggleQueue={() => toggleQueue(machine.id)} 
                      executeWithAuth={executeWithAuth}
                      onActionSuccess={fetchMachines}
                    />
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
        executeWithAuth={executeWithAuth}
        onActionSuccess={fetchMachines}
      />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }} 
        onSuccess={handleAuthSuccess} 
      />
    </div>
  );
};

export default Dashboard;
