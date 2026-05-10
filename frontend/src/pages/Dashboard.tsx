import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import MachineCard from '../components/feature/MachineCard';
import MachineListRow from '../components/feature/MachineListRow';
import MachineModal from '../components/feature/MachineModal';
import AuthModal from '../components/feature/AuthModal';
import NotificationPermissionBanner from '../components/feature/NotificationPermissionBanner';
import YourTurnBanner from '../components/feature/YourTurnBanner';
import { Machine } from '../types';

import { getAllMachines, joinQueue, leaveQueue, getUserQueues } from '../services/api';
import { getSavedUser } from '../services/auth';

const BLOCKS = ['A', 'B'] as const;
type BlockType = typeof BLOCKS[number];

const Dashboard: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('A');
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<((userId: string) => void) | null>(null);

  React.useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    setIsLoading(true);
    try {
      const data = await getAllMachines();
      const user = getSavedUser();
      // userQueues: array of { machineId, position } objects
      let userQueues: { machineId: string; position: number }[] = [];

      if (user) {
        userQueues = await getUserQueues(user.id);
      }

      // Per-block-floor display IDs (each floor starts from 1)
      const displayIdMap: Record<string, number> = {};
      // Build a map of machineId -> queue position for current user
      const queuePositionMap: Record<string, number> = {};
      userQueues.forEach((q) => {
        queuePositionMap[q.machineId] = q.position;
      });

      const withDisplayIds = data.map((m: any) => {
        const key = `${m.block}-${m.floor}-${m.type}`;
        displayIdMap[key] = (displayIdMap[key] || 0) + 1;
        return {
          ...m,
          displayId: displayIdMap[key].toString(),
          isCurrentUserInQueue: userQueues.some((q) => q.machineId === m.id),
          queuePosition: queuePositionMap[m.id] ?? null,
        };
      });
      setMachines(withDisplayIds);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
      toast.error('Makineler yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMachines = machines.filter(
    (m) => m.block === selectedBlock && m.floor === selectedFloor
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
        const m = machines.find((mac) => mac.id === machineId);
        if (!m) return;

        if (m.isCurrentUserInQueue) {
          await leaveQueue(machineId, userId);
          toast.success('Sıradan ayrıldınız.');
        } else {
          await joinQueue(machineId, userId);
          toast.success('Sıraya katıldınız!');
        }

        // Single re-fetch — update both machine list and open modal atomically
        const allData = await getAllMachines();
        const user = getSavedUser();
        let userQueues: { machineId: string; position: number }[] = [];
        if (user) {
          userQueues = await getUserQueues(user.id);
        }
        const displayIdMap2: Record<string, number> = {};
        const queuePositionMap2: Record<string, number> = {};
        userQueues.forEach((q) => {
          queuePositionMap2[q.machineId] = q.position;
        });

        const withDisplayIds = allData.map((machine: any) => {
          const key = `${machine.block}-${machine.floor}-${machine.type}`;
          displayIdMap2[key] = (displayIdMap2[key] || 0) + 1;
          return {
            ...machine,
            displayId: displayIdMap2[key].toString(),
            isCurrentUserInQueue: userQueues.some((q) => q.machineId === machine.id),
            queuePosition: queuePositionMap2[machine.id] ?? null,
          };
        });
        setMachines(withDisplayIds);

        if (selectedMachine?.id === machineId) {
          const updatedM = withDisplayIds.find((mac: Machine) => mac.id === machineId);
          if (updatedM) setSelectedMachine(updatedM);
        }
      } catch (error: any) {
        if (error.message?.includes('User not found') || error.message?.includes('re-authenticate')) {
          // Stale session: DB was reset but localStorage has old user ID
          const { clearUser } = await import('../services/auth');
          clearUser();
          toast.error('Oturum süresi dolmuş. Lütfen telefon numaranızı tekrar girin.');
          setPendingAction(() => () => toggleQueue(machineId));
          setIsAuthModalOpen(true);
        } else {
          toast.error(error.message || 'Failed to update queue.');
        }
      }
    });
  };

  const washingMachines = filteredMachines.filter((m) => m.type === 'WASHER');
  const dryers = filteredMachines.filter((m) => m.type === 'DRYER');

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">KYK Çamaşırhanesi</h1>
            <p className="text-slate-500 text-lg">Gerçek zamanlı makine durumu</p>
          </div>

          {/* View mode toggle and Auth Controls */}
          <div className="flex flex-col sm:flex-row items-end gap-3">
            {getSavedUser() && (
              <div className="flex items-center gap-3 mr-2 bg-white rounded-lg p-1.5 shadow-sm border border-slate-200">
                <span className="text-xs font-medium text-slate-500 pl-2">
                  📱 {getSavedUser()?.phone}
                </span>
                <button
                  onClick={() => {
                    import('../services/auth').then(({ clearUser }) => {
                      clearUser();
                      toast.success('Çıkış yapıldı.');
                      fetchMachines(); // Refresh UI to hide user-specific info
                    });
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md transition-colors"
                >
                  Çıkış Yap
                </button>
              </div>
            )}

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
                Liste
              </button>
            </div>
          </div>
        </header>

        {/* Push notification permission banner */}
        <NotificationPermissionBanner />

        {/* Your turn banner — shown when the user's queue turn is active */}
        <YourTurnBanner
          onUse={(machineId) => {
            const m = machines.find((mac) => mac.id === machineId);
            if (m) setSelectedMachine(m);
          }}
          onRefresh={fetchMachines}
        />
        {/* Block Selector */}
        <div className="mb-3 flex gap-2">
          {BLOCKS.map((block) => (
            <button
              key={block}
              id={`block-tab-${block}`}
              onClick={() => {
                setSelectedBlock(block);
                setSelectedFloor(1);
              }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
                selectedBlock === block
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {block} Blok
            </button>
          ))}
        </div>

        {/* Floor Selector */}
        <div className="mb-8 flex gap-2">
          {[1, 2].map((floor) => (
            <button
              key={floor}
              id={`floor-tab-${floor}`}
              onClick={() => setSelectedFloor(floor)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                selectedFloor === floor
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              Kat {floor}
            </button>
          ))}
        </div>

        {/* Location Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
            {selectedBlock} Blok &ndash; Kat {selectedFloor}
          </span>
        </div>

        {/* Machine List */}
        <main className="space-y-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium text-slate-500">Makineler Yükleniyor...</p>
            </div>
          ) : machines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">🧺</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Henüz Makine Yok</h3>
              <p className="text-slate-500 text-center max-w-sm">
                Sistemde tanımlı hiçbir makine bulunamadı. Admin panelinden makine ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            <>
              {washingMachines.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">W</span>
                    Çamaşır Makineleri
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
                    Kurutma Makineleri
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

              {filteredMachines.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-2xl">🔍</div>
                  <p className="text-slate-500 font-medium">Bu kat icin makine bulunamadi.</p>
                </div>
              )}
            </>
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
