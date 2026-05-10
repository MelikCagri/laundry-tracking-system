import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Settings, RefreshCw, Trash2, Plus, LogOut } from 'lucide-react';
import { Machine } from '../types';
import { 
  getAllMachines, 
  createMachine, 
  deleteMachine, 
  forceResetMachine, 
  setMachineStatus 
} from '../services/api';
import CreateMachineModal from '../components/ui/CreateMachineModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import StatusModal from '../components/ui/StatusModal';

const AdminDashboard: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<string | null>(null);
  const [machineToReset, setMachineToReset] = useState<string | null>(null);
  const [machineToChangeStatus, setMachineToChangeStatus] = useState<{id: string, status: string} | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchMachines();
  }, [navigate]);

  const fetchMachines = async () => {
    setIsLoading(true);
    try {
      const data = await getAllMachines();
      setMachines(data);
    } catch (err) {
      console.error(err);
      if ((err as any).message?.includes('Unauthorized') || (err as any).message?.includes('403')) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      } else {
        toast.error('Makineler yüklenirken hata oluştu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const handleCreateMachine = async (floor: number, type: 'WASHER' | 'DRYER', block: 'A' | 'B') => {
    try {
      await createMachine(floor, type, block);
      toast.success('Makine başarıyla eklendi.');
      fetchMachines();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async () => {
    if (!machineToDelete) return;
    try {
      await deleteMachine(machineToDelete);
      toast.success('Makine silindi.');
      fetchMachines();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleReset = async () => {
    if (!machineToReset) return;
    try {
      await forceResetMachine(machineToReset);
      toast.success('Makine sıfırlandı.');
      fetchMachines();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleChangeStatusSubmit = async (newStatus: string) => {
    if (!machineToChangeStatus) return;
    try {
      await setMachineStatus(machineToChangeStatus.id, newStatus as 'BOS' | 'DOLU' | 'BITTI' | 'BOZUK');
      toast.success('Makine durumu güncellendi.');
      fetchMachines();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Yönetim Paneli</h1>
            <p className="text-slate-500">Sistem ve makine yönetimi</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition shadow-sm font-medium"
            >
              <Plus size={18} /> Yeni Makine
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition border border-red-200 font-medium"
            >
              <LogOut size={18} /> Çıkış Yap
            </button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-600">ID</th>
                <th className="p-4 font-semibold text-slate-600">Blok</th>
                <th className="p-4 font-semibold text-slate-600">Kat</th>
                <th className="p-4 font-semibold text-slate-600">Tip</th>
                <th className="p-4 font-semibold text-slate-600">Durum</th>
                <th className="p-4 font-semibold text-slate-600 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr key={machine.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-4 text-sm text-slate-700 font-mono">{machine.id}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-xs font-bold bg-slate-900 text-white">
                      {machine.block} Blok
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-700 font-bold">{machine.floor}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      machine.type === 'WASHER' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {machine.type === 'WASHER' ? 'Çamaşır Makinesi' : 'Kurutma Makinesi'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      machine.status === 'BOS' ? 'bg-green-100 text-green-700' :
                      machine.status === 'DOLU' ? 'bg-red-100 text-red-700' :
                      machine.status === 'BITTI' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {machine.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => setMachineToChangeStatus({id: machine.id, status: machine.status})}
                      className="p-2 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      title="Durum Değiştir"
                    >
                      <Settings size={18} />
                    </button>
                    <button 
                      onClick={() => setMachineToReset(machine.id)}
                      className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-lg transition"
                      title="Zorla Sıfırla"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <button 
                      onClick={() => setMachineToDelete(machine.id)}
                      className="p-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Yükleniyor...</td>
                </tr>
              )}
              {!isLoading && machines.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Sistemde henüz makine yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateMachineModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMachine}
      />

      <ConfirmModal 
        isOpen={!!machineToDelete}
        title="Makineyi Sil"
        description="Bu makineyi sistemden tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, Sil"
        danger={true}
        onClose={() => setMachineToDelete(null)}
        onConfirm={handleDelete}
      />

      <ConfirmModal 
        isOpen={!!machineToReset}
        title="Zorla Sıfırla"
        description="Bu makinenin durumunu zorla 'BOS' olarak güncelleyip sıfırlamak istiyor musunuz?"
        confirmText="Sıfırla"
        onClose={() => setMachineToReset(null)}
        onConfirm={handleReset}
      />

      <StatusModal
        isOpen={!!machineToChangeStatus}
        currentStatus={machineToChangeStatus?.status || ''}
        onClose={() => setMachineToChangeStatus(null)}
        onSubmit={handleChangeStatusSubmit}
      />
    </div>
  );
};

export default AdminDashboard;
