import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Card from '../ui/Card';

const ClientModal = ({ onSave, onCancel, clientToEdit, drivers }) => {
  const isEditing = clientToEdit && clientToEdit.id;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    billingType: 'monthly',
    password: '',
    hasAccess: false,
    defaultDriverId: '',
  });

  useEffect(() => {
    if (isEditing) {
      setFormData({
        ...clientToEdit,
        password: '', // No mostrar la contraseña actual
        defaultDriverId: clientToEdit.defaultDriverId || '',
      });
    } else {
      setFormData({ name: '', address: '', phone: '', email: '', billingType: 'monthly', password: '', hasAccess: false, defaultDriverId: '' });
    }
  }, [clientToEdit, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
            <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? "Dejar en blanco para no cambiar" : "Requerida para nuevos clientes"} required={!isEditing} className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" />
          </div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Transportista por Defecto</label>
              <select name="defaultDriverId" value={formData.defaultDriverId} onChange={handleChange} className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600">
                <option value="">Ninguno</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center space-x-2 text-white mt-6">
              <input type="checkbox" name="hasAccess" checked={formData.hasAccess} onChange={handleChange} className="h-5 w-5 rounded bg-gray-600 border-gray-500" />
              <span>Permitir acceso al portal</span>
            </label>
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