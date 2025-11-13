import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';

const PaymentAlertModal = ({ shipment, onConfirm, onCancel }) => {
  if (!shipment) return null;

  const needsReimbursement = shipment.collectedAmount > 0;
  const needsShippingCost = shipment.shippingCost > 0 && shipment.shippingPayer === 'destinatario';
  const totalToCollect = (needsReimbursement ? shipment.collectedAmount : 0) + (needsShippingCost ? shipment.shippingCost : 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-400 mb-4" />
        <h3 className="text-2xl font-bold mb-4 text-white">¡Atención! Cobro Requerido</h3>
        <p className="text-gray-300 mb-6">Este envío requiere cobrar al destinatario:</p>
        <div className="space-y-2 mb-6 text-left bg-gray-900 p-4 rounded-lg">
          {needsReimbursement && (
            <p className="text-lg"><span className="font-bold text-gray-400">Reembolso:</span> <span className="font-bold text-yellow-400">{shipment.collectedAmount.toFixed(2)} €</span></p>
          )}
          {needsShippingCost && (
            <p className="text-lg"><span className="font-bold text-gray-400">Portes:</span> <span className="font-bold text-blue-400">{shipment.shippingCost.toFixed(2)} €</span></p>
          )}
          <p className="text-xl border-t border-gray-700 pt-2 mt-2"><span className="font-bold text-gray-400">TOTAL A COBRAR:</span> <span className="font-bold text-yellow-300">{totalToCollect.toFixed(2)} €</span></p>
        </div>
        <div className="flex justify-center space-x-4">
          <button onClick={onCancel} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg">Confirmar Entrega y Cobro</button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentAlertModal;