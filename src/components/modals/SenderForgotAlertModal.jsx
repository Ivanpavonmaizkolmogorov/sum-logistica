import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';

const SenderForgotAlertModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-400 mb-4" />
        <h3 className="text-2xl font-bold mb-4 text-white">¿Olvidaste el Cobro?</h3>
        <p className="text-gray-300 mb-6">Este es un cliente de pago diario y el porte es a cargo del remitente, pero no has marcado "Cobrado al remitente".</p>
        <p className="text-gray-300 mb-6">El envío se marcará como <strong>pendiente de cobro en origen</strong>.</p>
        <div className="flex justify-center space-x-4">
          <button onClick={onCancel} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg">Continuar así</button>
        </div>
      </Card>
    </div>
  );
};

export default SenderForgotAlertModal;