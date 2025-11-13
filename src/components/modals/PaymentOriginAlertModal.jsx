import React from 'react';
import { DollarSign } from 'lucide-react';
import Card from '../ui/Card';

const PaymentOriginAlertModal = ({ clientName, shippingCost, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative text-center">
        <DollarSign size={48} className="mx-auto text-blue-400 mb-4" />
        <h3 className="text-2xl font-bold mb-4 text-white">Confirmar Cobro en Origen</h3>
        <p className="text-gray-300 mb-6">Vas a registrar un cobro de portes del remitente:</p>
        <div className="space-y-2 mb-6 text-left bg-gray-900 p-4 rounded-lg"><p className="text-lg"><span className="font-bold text-gray-400">Cliente:</span> <span className="font-bold text-white">{clientName}</span></p><p className="text-lg"><span className="font-bold text-gray-400">Portes:</span> <span className="font-bold text-blue-400">{shippingCost.toFixed(2)} €</span></p></div>
        <div className="flex justify-center space-x-4">
          <button onClick={onCancel} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg">Continuar así</button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentOriginAlertModal;