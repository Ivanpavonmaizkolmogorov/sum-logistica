import React, { useState } from 'react';
import { X } from 'lucide-react';
import Card from '../ui/Card';
import SearchableDropdown from '../ui/SearchableDropdown';

const PickupModal = ({ isOpen, onCancel, onSave, clients, currentUser }) => {
  const initialFormState = {
    clientId: null,
    clientName: '',
    address: '',
    items: 1,
    observations: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const clientOptions = clients.map(c => ({
    value: `client-${c.id}`,
    label: c.name,
    address: c.address,
    clientId: c.id
  }));

  const handleClientSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      clientId: option.clientId,
      clientName: option.label,
      address: option.address, // Auto-rellenar dirección
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientId) {
      console.error("Por favor, selecciona un cliente.");
      return;
    }

    const pickupData = {
      ...formData,
      id: undefined, // Es una nueva recogida
      items: parseInt(formData.items, 10) || 1,
      driverId: currentUser.id, // Asignar al transportista actual
      createdAt: new Date().toISOString(),
    };
    onSave(pickupData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg relative h-[90vh] overflow-y-auto">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
        <h3 className="text-2xl font-bold mb-4 text-white">Registrar Recogida</h3>
        <form onSubmit={handleSubmit} className="space-y-4">

          <SearchableDropdown
            options={clientOptions}
            value={formData.clientName}
            onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value, clientId: null }))}
            onSelect={handleClientSelect}
            placeholder="Buscar cliente..." />

          <div><label className="block text-sm font-medium text-gray-400 mb-1">Dirección de Recogida</label><input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" placeholder="Dirección de Recogida" /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Nº Bultos</label><input type="number" name="items" value={formData.items} onChange={handleChange} min="1" required className="w-full bg-gray-700 text-white p-2 rounded-lg" placeholder="Nº Bultos" /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Observaciones</label><textarea name="observations" value={formData.observations} onChange={handleChange} placeholder="Observaciones de la recogida..." className="w-full bg-gray-700 text-white p-2 rounded-lg border-gray-600 h-24"></textarea></div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg" disabled={!formData.clientId}>
              Confirmar Recogida
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PickupModal;