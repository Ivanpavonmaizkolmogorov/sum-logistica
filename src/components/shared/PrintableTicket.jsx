import React from 'react';

const PrintableTicket = React.forwardRef(({ shipment, client }, ref) => {
  if (!shipment || !client) return null;

  const printDate = shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleString('es-ES') : new Date().toLocaleString('es-ES');
  const shippingCostPaid = shipment.shippingCost > 0 && shipment.shippingPayer === 'destinatario';
  const totalCollected = (shipment.collectedAmount || 0) + (shippingCostPaid ? shipment.shippingCost : 0);

  return (
    <div ref={ref} className="printable-ticket hidden bg-white text-black p-4" style={{ width: '300px', fontFamily: 'sans-serif', fontSize: '12px' }}>
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
        <p className="font-bold text-lg mt-2">
          <strong>TOTAL:</strong> {totalCollected.toFixed(2)} €
        </p>
      )}

      {shipment.status === 'Entregado' ? (
        <p className="font-bold text-center text-lg mt-4" style={{ color: 'green' }}>PAGADO</p>
      ) : (
        <p className="font-bold text-center text-lg mt-4" style={{ color: 'red' }}>COBRO PENDIENTE</p>
      )}

      {shipment.paymentNotes && (
        <p className="text-center text-xs mt-1">Nota: {shipment.paymentNotes}</p>
      )}
    </div>
  );
});

export default PrintableTicket;