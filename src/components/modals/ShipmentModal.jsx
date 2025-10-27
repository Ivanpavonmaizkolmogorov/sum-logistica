import React, { useState, useEffect, useRef } from 'react';
import { MapPin, LocateFixed, Camera, X } from 'lucide-react';
import Card from '../ui/Card';
import SearchableDropdown from '../ui/SearchableDropdown';
import SenderPaymentConfirmModal from './SenderPaymentConfirmModal';
import SenderForgotAlertModal from './SenderForgotAlertModal';

const ShipmentModal = ({ isOpen, onCancel, onSave, shipmentToEdit, clients, recipients, drivers, onAddRecipient, onAddClient, currentUser }) => {
  const isEditing = shipmentToEdit && shipmentToEdit.id;
  const initialFormState = {
    clientId: null,
    clientName: '',
    recipient: '',
    destination: '',
    poblacion: '',
    items: 1,
    collectedAmount: 0,
    driverId: null,
    shippingPayer: 'remitente',
    observations: '',
    shippingCost: '',
    merchandisePhoto: null,
    senderPaymentCollected: false,
    isRecipientFreeTextDailyPayer: false, // Nuevo campo
  };

  const [formData, setFormData] = useState(initialFormState);
  const [saveNewClient, setSaveNewClient] = useState(false);
  const [saveNewRecipient, setSaveNewRecipient] = useState(false);
  const [showSenderPayment, setShowSenderPayment] = useState(false);
  const [showSenderPaymentAlert, setShowSenderPaymentAlert] = useState(false);
  const [showSenderForgotAlert, setShowSenderForgotAlert] = useState(false);
  const merchandisePhotoInputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      const client = clients.find(c => c.id === shipmentToEdit.clientId);
      const destinationParts = shipmentToEdit.destination.split(',');
      const street = destinationParts[0]?.trim();
      const city = destinationParts.length > 1 ? destinationParts.slice(1).join(',').trim() : '';

      setFormData({
        ...initialFormState,
        ...shipmentToEdit,
        clientName: client ? `${client.name} (Cliente)` : '',
        destination: street,
        poblacion: city,
        senderPaymentCollected: !!shipmentToEdit.senderPaymentCollectedAt,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [shipmentToEdit, isOpen, clients]);

  useEffect(() => {
    if (formData.shippingPayer === 'remitente') {
      let isDailyClient = false;
      // Caso 1: Es un cliente existente seleccionado de la lista
      if (formData.clientId) { // Cliente existente
        const client = clients.find(c => c.id === formData.clientId);
        if (client && client.billingType === 'daily') {
          isDailyClient = true;
        }
      } 
      // Caso 2: Es un cliente nuevo de escritura libre (no está en la lista de clientes)
      else if (formData.clientName && !clients.some(c => `${c.name} (Cliente)` === formData.clientName)) {
        isDailyClient = true;
      }
      setShowSenderPayment(isDailyClient);
    } else {
      setShowSenderPayment(false);
    }
  }, [formData.clientId, formData.clientName, formData.shippingPayer, clients]);

  // Efecto para auto-marcar el cobro diario para destinatarios de texto libre
  useEffect(() => {
    const isNew = formData.recipient && !recipients.some(r => r.name === formData.recipient) && !clients.some(c => `${c.name} (Cliente)` === formData.recipient);
    const shouldBeDailyPayer = isNew && formData.shippingPayer === 'destinatario';
    if (shouldBeDailyPayer) {
      setFormData(prev => ({ ...prev, isRecipientFreeTextDailyPayer: true }));
    } else if (formData.shippingPayer !== 'destinatario') {
      setFormData(prev => ({ ...prev, isRecipientFreeTextDailyPayer: false }));
    }
  }, [formData.shippingPayer, formData.recipient, clients, recipients]);

  const contactOptions = [
    ...clients.map(c => ({
      value: `client-${c.id}`,
      label: `${c.name} (Cliente)`,
      address: c.address,
      clientId: c.id
    })),
    ...recipients.map(r => ({
      value: `recipient-${r.id}`,
      label: r.name,
      address: r.address,
      clientId: r.clientId
    }))
  ];

  const isNewClient = formData.clientName && !formData.clientId && !clients.some(c => `${c.name} (Cliente)` === formData.clientName);
  const isNewRecipient = formData.recipient && !recipients.some(r => r.name === formData.recipient) && !clients.some(c => `${c.name} (Cliente)` === formData.recipient);
  const showRecipientDailyPayerCheckbox = isNewRecipient && formData.shippingPayer === 'destinatario';

  const handleClientSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      clientId: option.clientId,
      clientName: option.label
    }));
  };

  const handleRecipientSelect = (option) => {
    setFormData(prev => {
      const destinationParts = option.address.split(',');
      const street = destinationParts[0]?.trim();
      const city = destinationParts.length > 1 ? destinationParts.slice(1).join(',').trim() : '';

      const newState = { ...prev, recipient: option.label, destination: street, poblacion: city };
      if (!prev.clientId) { // Auto-fill client if not already set
        const client = clients.find(c => c.id === option.clientId);
        if (client) {
          newState.clientId = client.id;
          newState.clientName = `${client.name} (Cliente)`;
        }
      }
      return newState;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, merchandisePhoto: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error("La geolocalización no es compatible con tu navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude}, ${longitude}`;
        setFormData(prev => ({ ...prev, destination: locationString }));
      },
      (error) => { console.error("No se pudo obtener la ubicación."); }
    );
  };

  const handleViewOnMap = () => {
    if (!formData.destination) return;
    const fullDestination = [formData.destination, formData.poblacion].filter(Boolean).join(', ');
    const encodedAddress = encodeURIComponent(fullDestination);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  const runSave = async () => {
    console.log("--- ShipmentModal: runSave ---");
    console.log("Estado del formulario ANTES de procesar:", formData);

    let finalClientId = formData.clientId;

    if (saveNewClient && isNewClient) {
      const newClient = {
        id: Date.now(),
        name: formData.clientName,
        address: '',
        billingType: 'daily'
      };
      await onAddClient(newClient); // Assuming onAddClient is async
      finalClientId = newClient.id;
    }

    if (saveNewRecipient && isNewRecipient) {
      const newRecipient = {
        id: Date.now() + 1000,
        clientId: finalClientId, // Use finalClientId here
        name: formData.recipient,
        address: [formData.destination, formData.poblacion].filter(Boolean).join(', '),
      };
      await onAddRecipient(newRecipient); // Assuming onAddRecipient is async
    }

    const fullDestination = [formData.destination, formData.poblacion].filter(Boolean).join(', ');

    const shipmentData = {
      ...formData,
      clientId: finalClientId,
      destination: fullDestination,
      id: isEditing ? shipmentToEdit.id : undefined,
      items: parseInt(formData.items, 10) || 1,
      shippingCost: parseFloat(formData.shippingCost) || 0,
      collectedAmount: parseFloat(formData.collectedAmount) || 0,
      priority: formData.priority || 'Normal',
      senderPaymentCollectedAt: formData.senderPaymentCollected ? new Date().toISOString() : null,
      paymentCollectedBy: formData.senderPaymentCollected ? currentUser.id : null,
      status: isEditing ? shipmentToEdit.status : 'Pendiente', // Asegurar que el estado se establece
    };
    delete shipmentData.poblacion;
    delete shipmentData.senderPaymentCollected;

    console.log("Datos del albarán listos para guardar:", shipmentData);

    onSave(shipmentData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.senderPaymentCollected && !isEditing) {
      setShowSenderPaymentAlert(true);
    } else if (showSenderPayment && !formData.senderPaymentCollected && !isEditing) {
      setShowSenderForgotAlert(true);
    } else {
      runSave();
    }
  };

  const handleConfirmSenderPayment = () => {
    setShowSenderPaymentAlert(false);
    runSave();
  };

  const handleConfirmForgotSenderPayment = () => {
    setShowSenderForgotAlert(false);
    runSave();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-lg relative h-[90vh] overflow-y-auto">
          <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
          <h3 className="text-2xl font-bold mb-4 text-white">{isEditing ? 'Editar' : 'Crear'} Albarán</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              name="driverId"
              value={formData.driverId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value ? parseInt(e.target.value, 10) : null }))}
              className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600"
            >
              <option value="">-- Sin Asignar --</option>
              {drivers.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <SearchableDropdown options={contactOptions} value={formData.clientName} onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value, clientId: null }))} onSelect={handleClientSelect} placeholder="Buscar cliente..." />
              <SearchableDropdown options={contactOptions} value={formData.recipient} onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))} onSelect={handleRecipientSelect} placeholder="Buscar destinatario..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Paga portes</label>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, shippingPayer: 'remitente' }))} className={`flex-1 py-2 px-4 rounded-lg font-semibold ${formData.shippingPayer === 'remitente' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>Remitente</button>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, shippingPayer: 'destinatario' }))} className={`flex-1 py-2 px-4 rounded-lg font-semibold ${formData.shippingPayer === 'destinatario' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>Destinatario</button>
              </div>
            </div>

            {isNewClient && (
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <label className="flex items-center space-x-2 text-white"><input type="checkbox" checked={saveNewClient} onChange={(e) => setSaveNewClient(e.target.checked)} className="h-4 w-4 rounded bg-gray-600" /><span>Guardar nuevo cliente "{formData.clientName}"</span></label>
              </div>
            )}

            {showSenderPayment && (
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={formData.senderPaymentCollected}
                    onChange={(e) => setFormData(prev => ({ ...prev, senderPaymentCollected: e.target.checked }))}
                    className="h-4 w-4 rounded bg-gray-600"
                  /><span>¿Cobrado al remitente?</span>
                </label>
              </div>
            )}

            {isNewRecipient && (
              <div className="bg-gray-700/50 p-3 rounded-lg"><label className="flex items-center space-x-2 text-white"><input type="checkbox" checked={saveNewRecipient} onChange={(e) => setSaveNewRecipient(e.target.checked)} className="h-4 w-4 rounded bg-gray-600" /><span>Guardar "{formData.recipient}"</span></label></div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="poblacion" value={formData.poblacion} onChange={handleChange} required className="w-full bg-gray-700 text-white p-2 rounded-lg" placeholder="Población" />
              <div className="relative">
                <input type="text" name="destination" value={formData.destination} onChange={handleChange} required className="w-full bg-gray-700 text-white p-2 rounded-lg pr-20" placeholder="Dirección de Entrega" />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button type="button" onClick={handleGetCurrentLocation} className="px-3 text-gray-400 hover:text-blue-400"><LocateFixed size={18} /></button>
                  <button type="button" onClick={handleViewOnMap} className="px-3 text-gray-400 hover:text-blue-400" disabled={!formData.destination || !formData.poblacion}><MapPin size={18} /></button>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <input type="number" name="items" value={formData.items} onChange={handleChange} min="1" required className="w-full bg-gray-700 text-white p-2 rounded-lg" placeholder="Nº Bultos" />
              <input type="number" name="shippingCost" value={formData.shippingCost} onChange={handleChange} min="0" step="0.01" className="w-full bg-gray-700 text-white p-2 rounded-lg" placeholder="Precio del Porte (€)" />
              <input type="number" name="collectedAmount" value={formData.collectedAmount} onChange={handleChange} min="0" step="0.01" required className="w-full bg-gray-700 text-white p-2 rounded-lg" placeholder="Reembolso (€)" />
            </div>
            <div>
              <textarea name="observations" value={formData.observations} onChange={handleChange} placeholder="Observaciones..." className="w-full bg-gray-700 text-white p-2 rounded-lg border-gray-600 h-24"></textarea>
            </div>
            <div>
              <button type="button" onClick={() => merchandisePhotoInputRef.current.click()} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">
                <Camera size={18} />{formData.merchandisePhoto ? 'Cambiar Foto' : 'Foto Mercancía'}
              </button>
              <input type="file" accept="image/*" ref={merchandisePhotoInputRef} onChange={handlePhotoUpload} className="hidden" />
              {formData.merchandisePhoto && <img src={formData.merchandisePhoto} alt="Vista previa" className="mt-4 rounded-lg max-h-40 mx-auto" />}
            </div>
            <div className="pt-4">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg">
                {isEditing ? 'Guardar Cambios' : 'Generar Albarán'}
              </button>
            </div>
          </form>
        </Card>
      </div>
      {showSenderPaymentAlert && (
        <SenderPaymentConfirmModal
          clientName={formData.clientName}
          shippingCost={parseFloat(formData.shippingCost) || 0}
          onConfirm={handleConfirmSenderPayment}
          onCancel={() => setShowSenderPaymentAlert(false)}
        />
      )}
      {showSenderForgotAlert && (
        <SenderForgotAlertModal
          onConfirm={handleConfirmForgotSenderPayment}
          onCancel={() => setShowSenderForgotAlert(false)}
        />
      )}
    </>
  );
};

export default ShipmentModal;