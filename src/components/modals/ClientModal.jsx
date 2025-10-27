import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Card from '../ui/Card';

const ClientModal = ({ onSave, onCancel, clientToEdit }) => {
  const isEditing = clientToEdit && clientToEdit.id;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    billingType: 'monthly',
  });

  useEffect(() => {
    if (isEditing) {
      setFormData(clientToEdit);
    } else {
      setFormData({ name: '', address: '', phone: '', email: '', billingType: 'monthly' });
    }
  }, [clientToEdit, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: isEditing ? clientToEdit.id : undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
        <h3 className="text-2xl font-bold mb-4 text-white">{isEditing ? 'Editar' : 'Crear'} Cliente</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Dirección</label><input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" /></div>
          <div className="flex space-x-4">
            <div className="flex-1"><label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" /></div>
            <div className="flex-1"><label className="block text-sm font-medium text-gray-400 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Facturación</label>
            <select name="billingType" value={formData.billingType} onChange={handleChange} className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600"><option value="monthly">Mensual</option><option value="daily">Diaria</option></select>
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg">{isEditing ? 'Guardar Cambios' : 'Crear Cliente'}</button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClientModal;