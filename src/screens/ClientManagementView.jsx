import React from 'react';
import { UserPlus, Pencil, Trash2, MessageSquare, Mail } from 'lucide-react';
import Card from '../components/ui/Card';

export const ClientManagementView = ({ clients, onAdd, onEdit, onDelete }) => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Gestión de Clientes</h3>
        <button onClick={onAdd} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg">
          <UserPlus size={18} /> Nuevo Cliente
        </button>
      </div>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {clients.sort((a, b) => a.name.localeCompare(b.name)).map(client => (
          <div key={client.id} className="bg-gray-900 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg truncate">{client.name}</p>
              <p className="text-sm text-gray-400 truncate">{client.address}</p>
              <div className="flex gap-4 mt-2 text-sm">
                {client.phone && <p className="text-gray-300 flex items-center gap-1"><MessageSquare size={14} /> {client.phone}</p>}
                {client.email && <p className="text-gray-300 flex items-center gap-1"><Mail size={14} /> {client.email}</p>}
              </div>
            </div>
            <div className="flex items-center flex-shrink-0 gap-3 w-full sm:w-auto">
              <span className={`capitalize px-3 py-1 text-xs font-medium rounded-full ${client.billingType === 'daily' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {client.billingType === 'daily' ? 'Diaria' : 'Mensual'}
              </span>
              <button onClick={() => onEdit(client)} className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700">
                <Pencil size={18} />
              </button>
              <button onClick={() => onDelete(client)} className="text-red-500 hover:text-red-400 p-2 rounded-md hover:bg-gray-700">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {clients.length === 0 && <p className="text-center text-gray-500 py-8">No hay clientes registrados.</p>}
      </div>
    </Card>
  );
};