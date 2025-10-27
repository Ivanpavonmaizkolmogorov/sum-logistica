import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin, Truck, Package, Users, BarChart2, CheckCircle, Clock, Signature,
  Camera, X, FileText, Plus, LocateFixed, GripVertical, Shuffle, UserPlus,
  Pencil, Trash2, DollarSign, ChevronDown, ChevronUp, LogOut, LogIn, Settings,
  ToggleLeft, ToggleRight, AlertTriangle, Printer,
  Archive, // Icono para Recogidas
  Mail, // Icono para Email
  MessageSquare // Icono para WhatsApp
} from 'lucide-react';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import PrintableTicket from '../components/shared/PrintableTicket';
import SignaturePad from '../components/modals/SignaturePad';
import PaymentAlertModal from '../components/modals/PaymentAlertModal';
import PrintPreviewModal from '../components/modals/PrintPreviewModal';

export const DriverView = ({
  driver, shipments, pickups, clients, drivers,
  onUpdateShipment, onCreateShipment, onEditShipment, onCreatePickup,
  appSettings
}) => {
  const [activeTab, setActiveTab] = useState('reparto');
  const [list, setList] = useState([]);
  const [pickupList, setPickupList] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const fileInputRef = useRef(null);
  const [assigningShipmentId, setAssigningShipmentId] = useState(null);
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPendingPayment, setIsPendingPayment] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const ticketRef = useRef(null);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    if (activeTab === 'recogidas_driver') {
      let filteredPickups = pickups.filter(p =>
        p.driverId === driver.id &&
        p.createdAt &&
        p.createdAt.startsWith(selectedDate)
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPickupList(filteredPickups);
      setList([]);
    } else {
      let filteredShipments = shipments.filter(shipment => {
        if (activeTab === 'reparto') return shipment.driverId === driver.id && shipment.status === 'En ruta';
        if (activeTab === 'pendiente') return shipment.status === 'Pendiente';
        if (activeTab === 'completados') return shipment.driverId === driver.id && (shipment.status === 'Entregado');
        if (activeTab === 'cobroPendiente') return shipment.driverId === driver.id && shipment.status === 'Cobro Pendiente';
        return false;
      });
      setList(filteredShipments);
      setPickupList([]);
    }
  }, [activeTab, shipments, pickups, driver.id, selectedDate]);

  const dailySummary = useMemo(() => {
    const deliveredShipments = shipments.filter(s =>
      s.driverId === driver.id &&
      s.status === 'Entregado' &&
      s.deliveredAt &&
      s.deliveredAt.startsWith(selectedDate)
    );
    const totalShippingCostDelivered = deliveredShipments.filter(s => s.shippingPayer === 'destinatario').reduce((sum, s) => sum + s.shippingCost, 0);
    const totalCollectedAmountDelivered = deliveredShipments.reduce((sum, s) => sum + s.collectedAmount, 0);

    const shipmentsWithCollections = deliveredShipments.filter(s => s.collectedAmount > 0 || (s.shippingCost > 0 && s.shippingPayer === 'destinatario'));

    const prePaidShipments = shipments.filter(s =>
      s.paymentCollectedBy === driver.id &&
      s.senderPaymentCollectedAt &&
      s.senderPaymentCollectedAt.startsWith(selectedDate)
    );
    const totalShippingCostPrePaid = prePaidShipments.reduce((sum, s) => sum + s.shippingCost, 0);

    const allShipments = [...shipmentsWithCollections, ...prePaidShipments];
    const uniqueShipmentIds = new Set();
    const uniqueShipments = allShipments.filter(s => {
      if (uniqueShipmentIds.has(s.id)) {
        return false;
      }
      uniqueShipmentIds.add(s.id);
      return true;
    });

    return {
      shipments: uniqueShipments,
      totalShippingCost: totalShippingCostDelivered + totalShippingCostPrePaid,
      totalCollectedAmount: totalCollectedAmountDelivered,
    };
  }, [shipments, driver.id, selectedDate]);

  const counts = {
    reparto: shipments.filter(s => s.driverId === driver.id && s.status === 'En ruta').length,
    pendiente: shipments.filter(s => s.status === 'Pendiente').length,
    completados: shipments.filter(s => s.driverId === driver.id && (s.status === 'Entregado')).length,
    cobroPendiente: shipments.filter(s => s.driverId === driver.id && s.status === 'Cobro Pendiente').length,
    recogidas_driver: pickups.filter(p => p.driverId === driver.id && p.createdAt && p.createdAt.startsWith(selectedDate)).length,
  };

  if (!driver) {
    return <div className="text-center text-xl text-gray-400">Selecciona un transportista.</div>
  }

  const handleAssignShipment = (shipmentId, driverId) => {
    onUpdateShipment(shipmentId, {
      driverId: driverId,
      status: 'En ruta'
    });
    setAssigningShipmentId(null);
  };

  const handleSortByPopulation = () => {
    const getCity = (address) => {
      const parts = address.split(',');
      return parts.length > 1 ? parts.slice(1).join(',').trim() : address;
    };
    const sortedList = [...list].sort((a, b) => getCity(a.destination).localeCompare(getCity(b.destination)));
    setList(sortedList);
  };

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50');
    const newList = [...list];
    const draggedItemContent = newList.splice(dragItem.current, 1)[0];
    newList.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setList(newList);
  };

  const handleSelectShipment = (shipment) => setSelectedShipment(shipment);
  const handleCloseModal = () => {
    setSelectedShipment(null);
    setIsPendingPayment(false);
    setPaymentNote('');
    setShowPaymentAlert(false);
    setShowPrintPreview(false);
  };
  const handleEditFromDetail = (shipment) => { handleCloseModal(); onEditShipment(shipment); };
  const handleSignatureSave = (signatureData) => { onUpdateShipment(selectedShipment.id, { signature: signatureData }); setShowSignaturePad(false); setSelectedShipment(p => ({ ...p, signature: signatureData })); };
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => { onUpdateShipment(selectedShipment.id, { photo: e.target.result }); setSelectedShipment(p => ({ ...p, photo: e.target.result })); };
      reader.readAsDataURL(file);
    }
  };

  const handleAttemptMarkAsDelivered = () => {
    const senderClient = clients.find(c => c.id === selectedShipment.clientId);
    const isDailySenderPayment = selectedShipment.shippingPayer === 'remitente' && senderClient?.billingType === 'daily';
    const isSenderPaymentCollected = !!selectedShipment.senderPaymentCollectedAt;

    const needsReimbursement = selectedShipment.collectedAmount > 0;

    let isDailyRecipientPayment = false;
    if (selectedShipment.shippingPayer === 'destinatario' && selectedShipment.shippingCost > 0) {
      const recipientAsClient = clients.find(c => `${c.name} (Cliente)` === selectedShipment.recipient);
      if (recipientAsClient && recipientAsClient.billingType === 'daily') {
        isDailyRecipientPayment = true;
      }
    }

    const needsShippingCostFromNonDaily = selectedShipment.shippingCost > 0 && selectedShipment.shippingPayer === 'destinatario' && !isDailyRecipientPayment;

    if (appSettings.showPaymentAlertOnDelivery && (needsReimbursement || needsShippingCostFromNonDaily || isDailyRecipientPayment)) {
      setShowPaymentAlert(true);
    }
    else if (isDailySenderPayment && !isSenderPaymentCollected) {
      onUpdateShipment(selectedShipment.id, {
        status: 'Cobro Pendiente',
        deliveredAt: new Date().toISOString(),
        paymentNotes: "Cobro pendiente del REMITENTE"
      });
      handleCloseModal();
    }
    else {
      onUpdateShipment(selectedShipment.id, { status: 'Entregado', deliveredAt: new Date().toISOString() });
      handleCloseModal();
    }
  };

  const confirmDeliveryAndPayment = () => {
    onUpdateShipment(selectedShipment.id, { status: 'Entregado', deliveredAt: new Date().toISOString() });
    handleCloseModal();
  };

  const handleConfirmPendingPayment = () => {
    onUpdateShipment(selectedShipment.id, {
      status: 'Cobro Pendiente',
      deliveredAt: new Date().toISOString(),
      paymentNotes: paymentNote
    });
    handleCloseModal();
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const formatSinglePickupMessage = (pickup, client) => {
    const time = new Date(pickup.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    let message = `JUSTIFICANTE DE RECOGIDA\n\n`;
    message += `Fecha: ${time}\n`;
    message += `Cliente: ${client.name}\n`;
    message += `Dirección: ${pickup.address}\n`;
    message += `Bultos: ${pickup.items}\n`;
    if (pickup.observations) {
      message += `Obs: ${pickup.observations}\n`;
    }
    message += `\nRecogido por: ${driver.name}\nSUM Logística`;
    return message;
  };

  const handleSharePickupEmail = (pickup) => {
    const client = clients.find(c => c.id === pickup.clientId);
    if (!client || !client.email) {
      console.error("Este cliente no tiene un email registrado.");
      return;
    }
    const subject = `Justificante de Recogida - ${new Date(pickup.createdAt).toLocaleDateString('es-ES')}`;
    const body = formatSinglePickupMessage(pickup, client);
    const mailtoLink = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleSharePickupWhatsApp = (pickup) => {
    const client = clients.find(c => c.id === pickup.clientId);
    if (!client || !client.phone) {
      console.error("Este cliente no tiene un teléfono registrado.");
      return;
    }
    const body = formatSinglePickupMessage(pickup, client);
    const whatsappLink = `https://wa.me/${client.phone}?text=${encodeURIComponent(body)}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="space-y-8 relative pb-20">
      <div><h2 className="text-3xl font-bold">Panel del Repartidor</h2><p className="text-gray-400">Hola, {driver.name}.</p></div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 bg-gray-700 p-1 rounded-lg w-full sm:w-auto">
          <button onClick={() => setActiveTab('reparto')} className={`flex-1 px-3 py-2 rounded-md font-semibold transition-colors text-sm ${activeTab === 'reparto' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Reparto ({counts.reparto})</button>
          {appSettings.showPendingAssignTab && <button onClick={() => setActiveTab('pendiente')} className={`flex-1 px-3 py-2 rounded-md font-semibold transition-colors text-sm ${activeTab === 'pendiente' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Pendiente ({counts.pendiente})</button>}
          <button onClick={() => setActiveTab('recogidas_driver')} className={`flex-1 px-3 py-2 rounded-md font-semibold transition-colors text-sm ${activeTab === 'recogidas_driver' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Recogidas ({counts.recogidas_driver})</button>
          <button onClick={() => setActiveTab('completados')} className={`flex-1 px-3 py-2 rounded-md font-semibold transition-colors text-sm ${activeTab === 'completados' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Entregados ({counts.completados})</button>
          <button onClick={() => setActiveTab('cobroPendiente')} className={`flex-1 px-3 py-2 rounded-md font-semibold transition-colors text-sm ${activeTab === 'cobroPendiente' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Pend. Cobro ({counts.cobroPendiente})</button>
          <button onClick={() => setActiveTab('cuenta')} className={`flex-1 px-3 py-2 rounded-md font-semibold transition-colors text-sm ${activeTab === 'cuenta' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Cuenta</button>
        </div>
        {activeTab === 'reparto' && appSettings.allowManualSort && (
          <button
            onClick={handleSortByPopulation}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
          >
            <Shuffle size={16} />
            Ordenar por Población
          </button>
        )}
        {(activeTab === 'recogidas_driver' || activeTab === 'cuenta') && (
          <div>
            <label htmlFor="summary-date-driver" className="text-sm text-gray-400 mr-2">Fecha:</label>
            <input
              type="date"
              id="summary-date-driver"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-900 text-white p-2 rounded-lg border border-gray-600"
            />
          </div>
        )}
      </div>

      {activeTab === 'cuenta' ? (
        <div>
          <Card>
            <h3 className="text-xl font-bold mb-4 text-white">Resumen del {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Portes Cobrados</p>
                <p className="text-2xl font-bold text-blue-400">{dailySummary.totalShippingCost.toFixed(2)} €</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Reembolsos Cobrados</p>
                <p className="text-2xl font-bold text-yellow-400">{dailySummary.totalCollectedAmount.toFixed(2)} €</p>
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-4 text-gray-300">Detalle de Cobros</h4>
            {dailySummary.shipments.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {dailySummary.shipments.map(s => (
                  <div key={s.id} className="bg-gray-900 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center text-sm">
                    <p className="text-gray-300 truncate col-span-1" title={s.recipient}>
                      #{s.id} - {s.recipient} {s.status !== 'Entregado' && s.senderPaymentCollectedAt ? <span className="text-xs text-yellow-400">(Pre-pago)</span> : ''}
                    </p>
                    <p className="text-blue-300 sm:text-right">Porte: {s.shippingCost.toFixed(2)} €</p>
                    <p className="text-yellow-300 sm:text-right">Reembolso: {s.collectedAmount.toFixed(2)} €</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No hay cobros en esta fecha.</p>
            )}
          </Card>
        </div>
      ) : activeTab === 'recogidas_driver' ? (
        <Card>
          {pickupList.length > 0 ? (
            <div className="space-y-4">
              {pickupList.map((pickup) => {
                const client = clients.find(c => c.id === pickup.clientId);
                return (
                  <div key={pickup.id} className="bg-gray-900 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-grow min-w-0">
                      <p className="font-bold truncate">{client?.name || 'Cliente Desconocido'}</p>
                      <p className="text-sm text-gray-400 truncate">{pickup.address}</p>
                      <p className="text-sm font-semibold text-green-400">{pickup.items} bulto(s) - {new Date(pickup.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                      {pickup.observations && <p className="text-sm text-gray-500 italic mt-1">Obs: {pickup.observations}</p>}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
                      <button onClick={() => handleSharePickupWhatsApp(pickup)} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2" title="Compartir por WhatsApp">
                        <MessageSquare size={16} />
                      </button>
                      <button onClick={() => handleSharePickupEmail(pickup)} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2" title="Compartir por Email">
                        <Mail size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No has registrado recogidas en esta fecha.</p>
          )}
        </Card>
      ) : (
        <Card>
          {list.length > 0 ? (
            <div className="space-y-4">
              {list.map((shipment, index) => {
                const destinationParts = shipment.destination.split(',');
                const address = destinationParts[0]?.trim();
                const city = destinationParts.length > 1 ? destinationParts.slice(1).join(',').trim() : '';
                const isDraggable = (activeTab === 'reparto' || activeTab === 'pendiente') && appSettings.allowManualSort;
                return (
                  <div
                    key={shipment.id}
                    className={`bg-gray-900 p-4 rounded-lg flex items-center gap-3 hover:bg-gray-700 group transition-all ${isDraggable ? 'cursor-move' : ''}`}
                    draggable={isDraggable}
                    onDragStart={isDraggable ? (e) => dragItem.current = index : undefined}
                    onDragEnter={isDraggable ? (e) => dragOverItem.current = index : undefined}
                    onDragEnd={isDraggable ? (e) => {
                      const newList = [...list];
                      const draggedItemContent = newList.splice(dragItem.current, 1)[0];
                      newList.splice(dragOverItem.current, 0, draggedItemContent);
                      setList(newList);
                      dragItem.current = null;
                      dragOverItem.current = null;
                    } : undefined}
                    onDragOver={isDraggable ? (e) => e.preventDefault() : undefined}
                  >
                    {isDraggable && <GripVertical className="text-gray-500 flex-shrink-0" />}
                    <button onClick={() => handleSelectShipment(shipment)} className="flex-grow text-left flex justify-between items-center min-w-0">
                      <div className="flex-1 min-w-0"><p className="font-bold truncate">{shipment.recipient}</p><p className="text-sm text-gray-400 truncate">{address}</p><p className="text-sm font-semibold">{city}</p></div>
                      <div className="flex-shrink-0 ml-4"><StatusBadge status={shipment.status} /></div>
                    </button>
                    {activeTab === 'pendiente' && (
                      <div className="relative">
                        <button
                          onClick={() => setAssigningShipmentId(assigningShipmentId === shipment.id ? null : shipment.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-lg text-sm flex-shrink-0"
                        >
                          Asignar
                        </button>
                        {assigningShipmentId === shipment.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-gray-600 border border-gray-500 rounded-lg shadow-xl z-20">
                            <ul className="py-1 max-h-48 overflow-y-auto">
                              {drivers.map(d => (
                                <li
                                  key={d.id}
                                  onClick={() => handleAssignShipment(shipment.id, d.id)}
                                  className="px-4 py-2 text-white hover:bg-blue-600 cursor-pointer text-sm"
                                >
                                  {d.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
            : (
              <p className="text-center text-gray-500 py-8">No hay envíos en esta categoría.</p>
            )}
        </Card>
      )}

      {selectedShipment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <Card className="w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => handleEditFromDetail(selectedShipment)} className="absolute top-4 left-4 text-gray-400 hover:text-white"><Pencil size={18} /></button>
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-bold mb-4">Detalle de Entrega #{selectedShipment.id}</h3>
            <div className="space-y-4">
              <div><p className="font-bold text-gray-400">Cliente</p><p>{clients.find(c => c.id === selectedShipment.clientId)?.name}</p></div>

              <div>
                <p className="font-bold text-gray-400">Transportista Asignado</p>
                <select
                  value={selectedShipment.driverId || ''}
                  onChange={(e) => {
                    const newDriverId = e.target.value ? parseInt(e.target.value, 10) : null;
                    onUpdateShipment(selectedShipment.id, { driverId: newDriverId, status: newDriverId ? 'En ruta' : 'Pendiente' });
                    setSelectedShipment(prev => ({ ...prev, driverId: newDriverId, status: newDriverId ? 'En ruta' : 'Pendiente' }));
                  }}
                  className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 mt-1"
                >
                  <option value="">-- Sin Asignar --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div><p className="font-bold text-gray-400">Dirección</p><p>{selectedShipment.destination}</p></div>
              <div><p className="font-bold text-gray-400">Receptor</p><p>{selectedShipment.recipient}</p></div>

              {selectedShipment.collectedAmount > 0 && (<div><p className="font-bold text-gray-400">Reembolso a Cobrar</p><p className="text-yellow-400 text-lg font-bold">{selectedShipment.collectedAmount.toFixed(2)} €</p></div>)}

              {selectedShipment.shippingCost > 0 && selectedShipment.shippingPayer === 'destinatario' && (
                <div>
                  <p className="font-bold text-gray-400">Portes a Cobrar</p>
                  <p className="text-blue-400 text-lg font-bold">{selectedShipment.shippingCost.toFixed(2)} €</p>
                </div>
              )}

              <div><p className="font-bold text-gray-400">Paga Portes</p><p className="capitalize">{selectedShipment.shippingPayer}</p></div>

              {selectedShipment.status === 'Cobro Pendiente' && (
                <div className="bg-purple-500/20 p-3 rounded-lg text-purple-300 space-y-2">
                  <div>
                    <p className="font-bold">Pago Pendiente</p>
                    {selectedShipment.paymentNotes && <p className="text-sm">Nota: {selectedShipment.paymentNotes}</p>}
                  </div>
                  <button
                    onClick={handleAttemptMarkAsDelivered}
                    className="w-full bg-green-600 hover:bg-green-700 font-bold py-2 px-3 rounded-lg text-sm"
                  >
                    Registrar Pago
                  </button>
                </div>
              )}

              {!['Entregado', 'Cobro Pendiente', 'Incidencia'].includes(selectedShipment.status) && (
                isPendingPayment ? (
                  <div className="border-t border-gray-700 pt-4 space-y-3">
                    <label className="text-white">Nota para el Cobro Pendiente:</label>
                    <input
                      type="text"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      className="w-full bg-gray-900 text-white p-2 rounded-lg"
                      placeholder="Ej: Cobrar el lunes, transferir..."
                    />
                    <div className="flex space-x-2">
                      <button onClick={() => setIsPendingPayment(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                      <button onClick={handleConfirmPendingPayment} className="flex-1 bg-purple-600 hover:bg-purple-700 font-bold py-2 px-4 rounded-lg">Confirmar</button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-700 pt-4 flex flex-col space-y-3">
                    <div className="flex space-x-2"><button onClick={() => setShowSignaturePad(true)} disabled={!!selectedShipment.signature} className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded-lg disabled:bg-gray-500"><Signature size={18} className="mr-2" />{selectedShipment.signature ? 'Firmado' : 'Firma'}</button><button onClick={() => fileInputRef.current.click()} disabled={!!selectedShipment.photo} className="flex-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 font-bold py-2 px-4 rounded-lg disabled:bg-gray-500"><Camera size={18} className="mr-2" />{selectedShipment.photo ? 'Foto OK' : 'Foto'}</button><input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" /></div>
                    <div className="flex space-x-2">
                      <button onClick={() => setIsPendingPayment(true)} className="flex-1 bg-purple-600 hover:bg-purple-700 font-bold py-3 px-4 rounded-lg">Entregar (Cobro Pendiente)</button>
                      <button onClick={handleAttemptMarkAsDelivered} className="flex-1 bg-green-600 hover:bg-green-700 font-bold py-3 px-4 rounded-lg">Marcar Entregado</button>
                    </div>
                  </div>
                )
              )}

              {['Entregado', 'Cobro Pendiente'].includes(selectedShipment.status) && (
                <div className={`flex items-center gap-4 ${selectedShipment.status === 'Entregado' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'} py-4 px-4 rounded-lg`}>
                  <p className="font-bold text-lg flex-1">
                    {selectedShipment.status === 'Entregado' ? 'Paquete entregado' : 'Paquete entregado (Pago Pendiente)'}
                  </p>
                  <button
                    onClick={() => setShowPrintPreview(true)}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                  >
                    <Printer size={18} /> Imprimir Ticket
                  </button>
                </div>
              )}
            </div>
          </Card>
          <PrintableTicket ref={ticketRef} shipment={selectedShipment} client={clients.find(c => c.id === selectedShipment.clientId)} />
        </div>
      )}
      {showSignaturePad && <SignaturePad onSave={handleSignatureSave} onCancel={() => setShowSignaturePad(false)} />}
      {showPaymentAlert && selectedShipment && (
        <PaymentAlertModal
          shipment={selectedShipment}
          onConfirm={confirmDeliveryAndPayment}
          onCancel={() => setShowPaymentAlert(false)}
        />
      )}
      {showPrintPreview && selectedShipment && (
        <PrintPreviewModal
          shipment={selectedShipment}
          client={clients.find(c => c.id === selectedShipment.clientId)}
          onCancel={() => setShowPrintPreview(false)}
          onConfirm={handlePrintTicket}
        />
      )}

      <div className="fixed bottom-8 right-8 z-30">
        <button
          onClick={onCreateShipment}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-5 shadow-lg transition-transform duration-200"
          title="Crear Albarán"
        >
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
};