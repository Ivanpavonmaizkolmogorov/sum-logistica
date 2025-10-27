import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import Card from '../components/ui/Card';

export const AdminSettings = ({ appSettings, onUpdateSettings }) => {

  const handleToggle = (settingKey) => {
    onUpdateSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Ajustes Generales</h2>

      <Card>
        <h3 className="text-xl font-bold mb-4 text-white">Configuración de Transportistas</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
            <label htmlFor="allowManualSort" className="text-gray-300">Permitir reordenar ruta manualmente</label>
            <button onClick={() => handleToggle('allowManualSort')} className={appSettings.allowManualSort ? 'text-green-400' : 'text-gray-500'}>
              {appSettings.allowManualSort ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>
          <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
            <label htmlFor="showPendingAssignTab" className="text-gray-300">Ver pestaña 'Pendiente de Asignar'</label>
            <button onClick={() => handleToggle('showPendingAssignTab')} className={appSettings.showPendingAssignTab ? 'text-green-400' : 'text-gray-500'}>
              {appSettings.showPendingAssignTab ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>
          <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
            <label htmlFor="showPaymentAlertOnDelivery" className="text-gray-300">Mostrar alerta de cobro al entregar</label>
            <button onClick={() => handleToggle('showPaymentAlertOnDelivery')} className={appSettings.showPaymentAlertOnDelivery ? 'text-green-400' : 'text-gray-500'}>
              {appSettings.showPaymentAlertOnDelivery ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-bold mb-4 text-white">Configuración de Clientes</h3>
        <p className="text-gray-500">Actualmente no hay configuraciones específicas para clientes.</p>
      </Card>
    </div>
  );
};