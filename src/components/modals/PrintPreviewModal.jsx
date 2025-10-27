import React from 'react';
import { X, Printer } from 'lucide-react';
import Card from '../ui/Card';

const PrintPreviewModal = ({ shipment, client, onConfirm, onCancel }) => {
  if (!shipment || !client) return null;

  const printDate = shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleString('es-ES') : new Date().toLocaleString('es-ES');
  const shippingCostPaid = shipment.shippingCost > 0 && shipment.shippingPayer === 'destinatario';
  const totalCollected = (shipment.collectedAmount || 0) + (shippingCostPaid ? shipment.shippingCost : 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
        <h3 className="text-xl font-bold mb-4 text-white text-center">Vista Previa del Ticket</h3>

        {/* Ticket Content Duplicated for Preview */}
        <div className="bg-white text-black p-4 rounded-lg" style={{ fontFamily: 'sans-serif', fontSize: '12px' }}>
          <p className="text-center text-sm mb-4 font-bold">RECIBO DE ENTREGA</p>

          <p><strong>Albarán:</strong> #{shipment.id}</p>
          <p><strong>Fecha:</strong> {printDate}</p>

          <hr className="my-2 border-black" />

          <p><strong>Remitente:</strong></p>
          <p className="ml-2">{client.name}</p>

          <p className="mt-2"><strong>Destinatario:</strong></p>
          <p className="ml-2">{shipment.recipient}</p>
          <p className="ml-2">{shipment.destination}</p>

          <hr className="my-2 border-black" />

          {shipment.collectedAmount > 0 && (
            <p><strong>Reembolso:</strong> {shipment.collectedAmount.toFixed(2)} €</p>
          )}
          {shippingCostPaid && (
            <p><strong>Portes:</strong> {shipment.shippingCost.toFixed(2)} €</p>
          )}

          {(shipment.collectedAmount > 0 || shippingCostPaid) && (
            <p className="font-bold text-lg mt-2"><strong>TOTAL:</strong> {totalCollected.toFixed(2)} €</p>
          )}

          {shipment.status === 'Entregado' ? (<p className="font-bold text-center text-lg mt-4" style={{ color: 'green' }}>PAGADO</p>) : (<p className="font-bold text-center text-lg mt-4" style={{ color: 'red' }}>COBRO PENDIENTE</p>)}

          {shipment.paymentNotes && (<p className="text-center text-xs mt-1">Nota: {shipment.paymentNotes}</p>)}
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-center space-x-4 mt-6"><button onClick={onCancel} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg">Cerrar</button><button onClick={onConfirm} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"><Printer size={18} /> Confirmar Impresión</button></div>
      </Card>
    </div>
  );
};

export default PrintPreviewModal;