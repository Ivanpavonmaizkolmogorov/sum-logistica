import React from 'react';
import Card from '../ui/Card';

const DeleteConfirmationModal = ({ shipment, onConfirm, onCancel }) => {
  if (!shipment) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <h3 className="text-2xl font-bold mb-4 text-white text-center">Confirmar Eliminación</h3>
        <p className="text-gray-300 text-center mb-6">¿Estás seguro de que quieres eliminar el albarán #{shipment.id}?</p>
        <div className="flex justify-center space-x-4"><button onClick={onCancel} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg">Cancelar</button><button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg">Sí, Eliminar</button></div>
      </Card>
    </div>
  );
};

export default DeleteConfirmationModal;