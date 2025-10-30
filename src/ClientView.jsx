import React, { useState, useMemo } from 'react';
import { Package, CheckCircle, Clock, Plus, User, KeyRound } from 'lucide-react';
import Card from './components/ui/Card';
import StatusBadge from './components/ui/StatusBadge';

export const ClientView = ({ client, shipments, onCreateShipment, onChangePassword }) => {
  const [view, setView] = useState('shipments'); // 'shipments' o 'account'
  const [activeShipmentView, setActiveShipmentView] = useState('active'); // 'active' o 'completed'

  const clientShipments = useMemo(() => {
    return shipments.filter(s => s.clientId === client.id);
  }, [shipments, client.id]);

  const stats = useMemo(() => ({
    active: clientShipments.filter(s => s.status === 'Pendiente' || s.status === 'En ruta' || s.status === 'Cobro Pendiente').length,
    completed: clientShipments.filter(s => s.status === 'Entregado' || s.status === 'Incidencia').length,
  }), [clientShipments]);

  const displayedShipments = useMemo(() => {
    if (activeShipmentView === 'active') {
      return clientShipments
        .filter(s => s.status === 'Pendiente' || s.status === 'En ruta' || s.status === 'Cobro Pendiente')
        .sort((a, b) => b.id - a.id);
    }
    return clientShipments
      .filter(s => s.status === 'Entregado' || s.status === 'Incidencia')
      .sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt));
  }, [activeShipmentView, clientShipments]);

  const PasswordChangeForm = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setMessage({ type: '', text: '' });

      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
        return;
      }
      if (newPassword.length < 3) {
        setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 3 caracteres.' });
        return;
      }

      const result = await onChangePassword(client.id, currentPassword, newPassword);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    };

    return (
      <Card>
        <h3 className="text-xl font-bold mb-4">Cambiar Contraseña</h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Contraseña Actual" required className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva Contraseña" required className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar Nueva Contraseña" required className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" />
          {message.text && <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg">Actualizar Contraseña</button>
        </form>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Panel de Cliente</h2>
        <p className="text-gray-400">Bienvenido, {client.name}.</p>
      </div>

      <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-lg">
        <button onClick={() => setView('shipments')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold ${view === 'shipments' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}><Package size={20} /> Mis Envíos</button>
        <button onClick={() => setView('account')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold ${view === 'account' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}><User size={20} /> Mi Cuenta</button>
      </div>

      {view === 'shipments' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card><div className="flex items-center space-x-4"><Clock size={28} className="text-yellow-400" /><div><p>Envíos Activos</p><p className="text-2xl font-bold">{stats.active}</p></div></div></Card>
            <Card><div className="flex items-center space-x-4"><CheckCircle size={28} className="text-green-400" /><div><p>Envíos Completados</p><p className="text-2xl font-bold">{stats.completed}</p></div></div></Card>
            <Card className="flex items-center justify-center">
              <button onClick={onCreateShipment} className="w-full h-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg text-lg">
                <Plus size={22} /> Nuevo Envío
              </button>
            </Card>
          </div>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Mis Envíos</h3>
              <div className="flex items-center space-x-2 bg-gray-900 p-1 rounded-lg">
                <button onClick={() => setActiveShipmentView('active')} className={`px-4 py-2 rounded-md font-semibold ${activeShipmentView === 'active' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Activos</button>
                <button onClick={() => setActiveShipmentView('completed')} className={`px-4 py-2 rounded-md font-semibold ${activeShipmentView === 'completed' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Completados</button>
              </div>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {displayedShipments.length > 0 ? (
                displayedShipments.map(shipment => (
                  <div key={shipment.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">#{shipment.id} - {shipment.recipient}</p>
                      <p className="text-sm text-gray-400 truncate">{shipment.destination}</p>
                    </div>
                    <div className="flex items-center flex-shrink-0 gap-3 ml-4">
                      <StatusBadge status={shipment.status} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No hay envíos en esta categoría.</p>
              )}
            </div>
          </Card>
        </>
      )}

      {view === 'account' && <PasswordChangeForm />}
    </div>
  );
};