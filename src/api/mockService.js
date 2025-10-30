// src/api/mockService.js

// --- DATOS MOCK ---
let clients = [
  { id: 1, name: 'ElectroHogar S.L.', password: '123', address: 'Calle Falsa 123, Madrid', phone: '34611223344', email: 'facturacion@electrohogar.es', billingType: 'monthly', hasAccess: true, defaultDriverId: 101 },
  { id: 2, name: 'ModaExpress', password: '456', address: 'Avenida de la Industria 45, Barcelona', phone: '34622334455', email: 'pedidos@modaexpress.com', billingType: 'daily', hasAccess: false, defaultDriverId: null },
  { id: 3, name: 'Libros y Más', password: '789', address: 'Plaza Nueva 1, Sevilla', phone: '34633445566', email: 'info@librosymas.es', billingType: 'monthly', hasAccess: false, defaultDriverId: 102 },
];

let drivers = [
  { id: 101, name: 'Carlos Pérez', password: '123', vehicle: 'Furgoneta A', phone: '611223344', defaultZones: ['Madrid', 'Guadalajara'] },
  { id: 102, name: 'Ana García', password: '456', vehicle: 'Furgoneta B', phone: '622334455', defaultZones: ['Barcelona', 'Girona', 'Tarragona'] },
];

let shipments = [
  { id: 1001, clientId: 1, driverId: 101, origin: 'Almacén Central', destination: 'Calle Falsa 123, Madrid', status: 'En ruta', items: 2, collectedAmount: 0, recipient: 'Juan Pérez', signature: null, photo: null, priority: 'Normal', shippingPayer: 'remitente', observations: 'Entregar en portería.', shippingCost: 10.50, merchandisePhoto: null, deliveredAt: null, paymentNotes: null, senderPaymentCollectedAt: null, paymentCollectedBy: null },
  { id: 1002, clientId: 2, driverId: null, origin: 'Centro Logístico', destination: 'Avenida de la Industria 45, Barcelona', status: 'Pendiente', items: 1, collectedAmount: 50.00, recipient: 'Sofía López', signature: null, photo: null, priority: 'Urgente', shippingPayer: 'destinatario', observations: '', shippingCost: 15.00, merchandisePhoto: null, deliveredAt: null, paymentNotes: null, senderPaymentCollectedAt: null, paymentCollectedBy: null },
  { id: 1003, clientId: 3, driverId: 102, origin: 'Almacén Sur', destination: 'Plaza Nueva 1, Sevilla', status: 'Entregado', items: 5, collectedAmount: 0, recipient: 'Luis Torres', signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', photo: null, priority: 'Baja', shippingPayer: 'remitente', observations: 'Cuidado, frágil.', shippingCost: 22.00, merchandisePhoto: null, deliveredAt: '2025-10-20T10:00:00.000Z', paymentNotes: null, senderPaymentCollectedAt: null, paymentCollectedBy: null },
  { id: 1004, clientId: 1, driverId: 102, origin: 'Almacén Central', destination: 'Paseo de la Castellana 200, Madrid', status: 'Entregado', items: 1, collectedAmount: 25.50, recipient: 'Elena Moreno', signature: null, photo: null, priority: 'Urgente', shippingPayer: 'destinatario', observations: 'Dejar en el buzón si no hay nadie.', shippingCost: 8.75, merchandisePhoto: null, deliveredAt: '2025-10-21T12:00:00.000Z', paymentNotes: null, senderPaymentCollectedAt: null, paymentCollectedBy: null },
  { id: 1005, clientId: 2, driverId: null, origin: 'Centro Logístico', destination: 'Calle Gran Vía 30, Madrid', status: 'Pendiente', items: 3, collectedAmount: 0, recipient: 'Pedro Martín', signature: null, photo: null, priority: 'Normal', shippingPayer: 'remitente', observations: '', shippingCost: 12.00, merchandisePhoto: null, deliveredAt: null, paymentNotes: null, senderPaymentCollectedAt: null, paymentCollectedBy: null },
  { id: 1006, clientId: 1, driverId: 101, origin: 'Almacén Central', destination: 'Plaza Callao 2, Madrid', status: 'Incidencia', items: 1, collectedAmount: 0, recipient: 'Laura Gómez', signature: null, photo: null, priority: 'Normal', shippingPayer: 'remitente', observations: 'Dirección incorrecta.', shippingCost: 9.00, merchandisePhoto: null, deliveredAt: null, paymentNotes: null, senderPaymentCollectedAt: null, paymentCollectedBy: null },
  { id: 1007, clientId: 2, driverId: 101, origin: 'Almacén Norte', destination: 'Calle Alcalá 100, Madrid', status: 'Cobro Pendiente', items: 1, collectedAmount: 30.00, recipient: 'Marcos Ruiz', signature: null, photo: null, priority: 'Normal', shippingPayer: 'destinatario', observations: 'Entregado, cobrará el lunes.', shippingCost: 7.00, merchandisePhoto: null, deliveredAt: '2025-10-22T09:30:00.000Z', paymentNotes: 'Cobrar el lunes', senderPaymentCollectedAt: null, paymentCollectedBy: null },
];

let pickups = [
  { id: 2001, clientId: 1, driverId: 101, address: 'Calle Falsa 123, Madrid', items: 2, observations: 'Material de oficina', createdAt: '2025-10-22T09:15:00.000Z' },
  { id: 2002, clientId: 2, driverId: 101, address: 'Avenida de la Industria 45, Barcelona', items: 5, observations: 'Cajas de ropa', createdAt: '2025-10-22T10:30:00.000Z' },
  { id: 2003, clientId: 1, driverId: 101, address: 'Calle Falsa 123, Madrid', items: 1, observations: 'Devolución', createdAt: '2025-10-22T11:45:00.000Z' },
];

let recipients = [
  { id: 201, clientId: 1, name: 'Juan Pérez (Oficina)', address: 'Calle Falsa 123, Madrid' },
  { id: 202, clientId: 1, name: 'Elena Moreno (Almacén)', address: 'Paseo de la Castellana 200, Madrid' },
  { id: 203, clientId: 2, name: 'Sofía López (Tienda)', address: 'Avenida de la Industria 45, Barcelona' },
  { id: 204, clientId: 3, name: 'Luis Torres (Librería)', address: 'Plaza Nueva 1, Sevilla' },
  { id: 205, clientId: 2, name: 'Pedro Martín (Taller)', address: 'Calle Gran Vía 30, Madrid' },
];

// --- Funciones de la API Mock ---

// Simula una llamada asíncrona
const fakeApiCall = (data) => new Promise(resolve => setTimeout(() => resolve(data), 200));

// Clientes
export const getClients = () => fakeApiCall([...clients]);
export const addClient = async (newClientData) => {
  const newClient = { ...newClientData, id: Date.now() };
  clients.push(newClient);
  return fakeApiCall(newClient);
};
export const updateClient = async (clientId, updates) => {
  clients = clients.map(c => c.id === clientId ? { ...c, ...updates } : c);
  return fakeApiCall(clients.find(c => c.id === clientId));
};
export const deleteClient = async (clientId) => {
  clients = clients.filter(c => c.id !== clientId);
  return fakeApiCall({ success: true });
};

// Transportistas
export const getDrivers = () => fakeApiCall([...drivers]);
export const addDriver = async (newDriverData) => {
  const newDriver = { ...newDriverData, id: Date.now() };
  drivers.push(newDriver);
  return fakeApiCall(newDriver);
};
export const updateDriver = async (driverId, updates) => {
  drivers = drivers.map(d => d.id === driverId ? { ...d, ...updates } : d);
  return fakeApiCall(drivers.find(d => d.id === driverId));
};

// Envíos
export const getShipments = () => fakeApiCall([...shipments]);
export const addShipment = async (newShipmentData) => {
  const newShipment = { ...newShipmentData, id: Date.now() };
  shipments.push(newShipment);
  return fakeApiCall(newShipment);
};
export const updateShipment = async (shipmentId, updates) => {
  shipments = shipments.map(s => s.id === shipmentId ? { ...s, ...updates } : s);
  return fakeApiCall(shipments.find(s => s.id === shipmentId));
};
export const deleteShipment = async (shipmentId) => {
  shipments = shipments.filter(s => s.id !== shipmentId);
  return fakeApiCall({ success: true });
};

// Recogidas
export const getPickups = () => fakeApiCall([...pickups]);
export const addPickup = async (newPickupData) => {
  const newPickup = { ...newPickupData, id: Date.now() };
  pickups.push(newPickup);
  return fakeApiCall(newPickup);
};

// Destinatarios
export const getRecipients = () => fakeApiCall([...recipients]);
export const addRecipient = async (newRecipientData) => {
  const newRecipient = { ...newRecipientData, id: Date.now() };
  recipients.push(newRecipient);
  return fakeApiCall(newRecipient);
};

// Exportar datos iniciales para el login (solo para el mock)
export const initialDriversForLogin = drivers;
export const initialClientsForLogin = clients;