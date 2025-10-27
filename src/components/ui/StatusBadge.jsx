import React from 'react';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Pendiente': 'bg-yellow-500/20 text-yellow-400',
    'En ruta': 'bg-blue-500/20 text-blue-400',
    'Entregado': 'bg-green-500/20 text-green-400',
    'Incidencia': 'bg-red-500/20 text-red-400',
    'Cobro Pendiente': 'bg-purple-500/20 text-purple-400',
  };
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
};

export default StatusBadge;