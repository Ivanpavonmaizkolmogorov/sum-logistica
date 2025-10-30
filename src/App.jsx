import React, { useState, useEffect } from 'react';
import { Truck, LogOut } from 'lucide-react';

// Importar la capa de API
import * as api from './api/mockService'; // CORRECCIÓN: Importar desde el archivo correcto
import './styles/global.css';

// Importar las pantallas principales
import LoginScreen from './screens/LoginScreen';
import { AdminDashboard } from './screens/AdminDashboard';
import { DriverView } from './screens/DriverView'; // Mantener esta ruta si DriverView está en screens
import { ClientView } from './ClientView'; // CORRECCIÓN: Importar ClientView desde la raíz de src
import { AdminSettings } from './screens/AdminSettings'; // Importar AdminSettings
import { ClientManagementView } from './screens/ClientManagementView'; // Importar ClientManagementView

// Importar los modales globales
import ShipmentModal from './components/modals/ShipmentModal';
import PickupModal from './components/modals/PickupModal'; // Importar ClientModal
import ClientModal from './components/modals/ClientModal';
import DriverModal from './components/modals/DriverModal';

export default function App() {
  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [impersonatedUser, setImpersonatedUser] = useState(null);

  // Estados de datos de la aplicación
  const [shipments, setShipments] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [recipients, setRecipients] = useState([]);

  // Estados para controlar los modales
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false); // Nuevo estado para modal de cliente
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false); // Nuevo estado para modal de transportista
  const [clientToEdit, setClientToEdit] = useState(null); // Nuevo estado para cliente a editar
  const [driverToEdit, setDriverToEdit] = useState(null); // Nuevo estado para transportista a editar
  const [shipmentToEdit, setShipmentToEdit] = useState(null);

  // Estado para la configuración de la aplicación
  const [appSettings, setAppSettings] = useState({
    allowManualSort: true,
    showPendingAssignTab: true,
    showPaymentAlertOnDelivery: true,
  });

  // --- EFECTOS ---
  // Cargar todos los datos iniciales desde la API al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [
          clientsData,
          driversData,
          shipmentsData,
          pickupsData,
          recipientsData,
        ] = await Promise.all([
          api.getClients(),
          api.getDrivers(),
          api.getShipments(),
          api.getPickups(),
          api.getRecipients(),
        ]);
        setClients(clientsData);
        setDrivers(driversData);
        setShipments(shipmentsData);
        setPickups(pickupsData);
        setRecipients(recipientsData);
      } catch (error) {
        console.error("Error al cargar los datos iniciales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // --- MANEJADORES DE DATOS (CRUD) ---

  const refreshData = async () => {
    // Esta función se puede llamar para recargar un tipo de dato específico
    // Por ahora, recargaremos todo para simplicidad
    setShipments(await api.getShipments());
    setClients(await api.getClients());
    setDrivers(await api.getDrivers());
    setPickups(await api.getPickups());
    setRecipients(await api.getRecipients());
  };

  // Clientes
  const handleAddClient = async (clientData) => {
    await api.addClient(clientData);
    setClients(await api.getClients());
  };
  const handleUpdateClient = async (clientId, updates) => {
    await api.updateClient(clientId, updates);
    // Si la contraseña se actualiza, también actualizamos la lista para el login
    if (updates.password) {
      const clientIndex = api.initialClientsForLogin.findIndex(c => c.id === clientId);
      if (clientIndex !== -1) {
        api.initialClientsForLogin[clientIndex].password = updates.password;
      }
    }
    setClients(await api.getClients());
  };
  const handleDeleteClient = async (clientId) => {
    await api.deleteClient(clientId);
    setClients(await api.getClients());
  };

  const handleClientPasswordChange = async (clientId, currentPassword, newPassword) => {
    // En una app real, esto lo haría el backend. Aquí lo simulamos.
    const client = (await api.getClients()).find(c => c.id === clientId);
    if (client && client.password === currentPassword) {
      await handleUpdateClient(clientId, { password: newPassword });
      return { success: true, message: 'Contraseña actualizada correctamente.' };
    } else {
      return { success: false, message: 'La contraseña actual es incorrecta.' };
    }
  };

  // Transportistas
  const handleAddDriver = async (driverData) => {
    await api.addDriver(driverData);
    setDrivers(await api.getDrivers());
  };
  const handleSaveDriver = async (driverData) => {
    if (driverData.id) await handleUpdateDriver(driverData.id, driverData);
    else await handleAddDriver(driverData);
    setIsDriverModalOpen(false);
    setDriverToEdit(null);
  };
  const handleUpdateDriver = async (driverId, updates) => {
    await api.updateDriver(driverId, updates);
    setDrivers(await api.getDrivers());
  };

  // Envíos
  const handleSaveShipment = async (shipmentData) => {
    // Si es un cliente creando, el estado ya viene definido desde el modal
    // (En ruta si tiene driver, Pendiente si no).
    // Si es un admin/transportista, se aplican las reglas anteriores.
    if (activeUser.role !== 'client' && !shipmentData.id) {
       shipmentData.status = shipmentData.driverId ? 'En ruta' : 'Pendiente';
    }
    if (activeUser.role === 'client') {
      shipmentData.shippingCost = 0;
    }

    if (shipmentData.id) {
      await api.updateShipment(shipmentData.id, shipmentData);
    } else {
      await api.addShipment(shipmentData);
    }
    setShipments(await api.getShipments());
    closeShipmentModal();
  };
  const handleSaveClient = async (clientData) => {
    if (clientData.id) {
      await handleUpdateClient(clientData.id, clientData);
    } else {
      await handleAddClient(clientData);
    }
    setIsClientModalOpen(false); setClientToEdit(null);
  };
  const handleDeleteShipment = async (shipmentId) => {
    await api.deleteShipment(shipmentId);
    setShipments(await api.getShipments());
  };
  const handleUpdateShipmentStatus = async (shipmentId, updates) => {
    await api.updateShipment(shipmentId, updates);
    setShipments(await api.getShipments());
  };

  // Recogidas
  const handleCreatePickup = async (pickupData) => {
    await api.addPickup(pickupData);
    setPickups(await api.getPickups());
    closePickupModal();
  };

  // Destinatarios
  const handleAddRecipient = async (recipientData) => {
    await api.addRecipient(recipientData);
    setRecipients(await api.getRecipients());
  };

  // Optimización de Rutas
  const handleOptimizeRoutes = async (shipmentIds, driverIds) => {
    console.log("App.jsx: Iniciando optimización para envíos:", shipmentIds, "y transportistas:", driverIds);
    try {
      // En una implementación real, aquí llamarías a tu endpoint del backend
      // const result = await api.optimizeRoutes({ shipmentIds, driverIds });
      // await refreshData(); // Recargar datos después de la optimización
      // return result;
    } catch (error) {
      console.error("Error en la llamada de optimización de rutas:", error);
      throw error; // Re-lanzar el error para que el componente de la UI lo maneje
    }
  };
  // --- MANEJADORES DE UI (MODALES, LOGIN, ETC.) ---

  const handleLogin = (username, password, role) => {
    switch (role) {
      case 'admin':
        if (username === 'admin' && password === 'admin') {
          setCurrentUser({ id: 999, role: 'admin', name: 'Administrador' });
          return true;
        }
        break;
      case 'client':
        const client = api.initialClientsForLogin.find(c => c.email === username && c.password === password);
        if (client && client.hasAccess) { // <-- VERIFICACIÓN DE ACCESO
          setCurrentUser({ ...client, role: 'client' });
          return true;
        }
        break;
      case 'driver':
        const driver = api.initialDriversForLogin.find(d => d.name === username && d.password === password);
        if (driver) {
          setCurrentUser({ ...driver, role: 'driver' });
          return true;
        }
        break;
      default:
        return false;
    }
    return false; // Si no se encuentra en el switch case correcto
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setImpersonatedUser(null);
  };

  const handleImpersonateDriver = (driverId) => {
    const driverToImpersonate = drivers.find(d => d.id === driverId);
    if (driverToImpersonate) {
      setImpersonatedUser({ ...driverToImpersonate, role: 'driver' });
    }
  };

  const handleStopImpersonating = () => setImpersonatedUser(null);

  const openCreateShipmentModal = () => { setShipmentToEdit(null); setIsShipmentModalOpen(true); };
  const openEditShipmentModal = (shipment) => { setShipmentToEdit(shipment); setIsShipmentModalOpen(true); };
  const closeShipmentModal = () => { setIsShipmentModalOpen(false); setShipmentToEdit(null); };
  
  const openCreateDriverModal = () => { setDriverToEdit(null); setIsDriverModalOpen(true); };
  const openEditDriverModal = (driver) => { setDriverToEdit(driver); setIsDriverModalOpen(true); };
  const closeDriverModal = () => setIsDriverModalOpen(false);

  const openCreatePickupModal = () => setIsPickupModalOpen(true);
  const closePickupModal = () => setIsPickupModalOpen(false);

  const openCreateClientModal = () => { setClientToEdit(null); setIsClientModalOpen(true); };
  const openEditClientModal = (client) => { setClientToEdit(client); setIsClientModalOpen(true); };
  const closeClientModal = () => { setIsClientModalOpen(false); setClientToEdit(null); };

  // --- RENDERIZADO ---

  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
        <Truck size={48} className="animate-pulse text-blue-500" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-200 font-sans">
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  const activeUser = impersonatedUser || currentUser;

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="app-container max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-700">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Truck size={32} className="text-blue-500" />
            <h1 className="text-2xl font-bold">SUM Logística</h1>
          </div>
          {impersonatedUser ? (
            <div className="flex items-center space-x-4">
              <span className="text-yellow-400">Viendo como: <strong>{impersonatedUser.name}</strong></span>
              <button onClick={handleStopImpersonating} className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 p-2 rounded-lg text-white font-semibold">
                <LogOut size={20} className="transform -scale-x-100" /> Volver
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Bienvenido, <strong>{currentUser.name}</strong></span>
              <button onClick={handleLogout} title="Cerrar Sesión" className="bg-red-600 hover:bg-red-700 p-2 rounded-lg text-white">
                <LogOut size={20} />
              </button>
            </div>
          )}
        </header>

        <main>
          {
            activeUser.role === 'admin' ? (
              <AdminDashboard
                shipments={shipments}
                pickups={pickups}
                clients={clients}
                drivers={drivers}
                onAddDriver={handleAddDriver}
                onUpdateDriver={handleUpdateDriver}
                onEditDriver={openEditDriverModal}
                onEditShipment={openEditShipmentModal}
                onDeleteShipment={handleDeleteShipment}
                onImpersonateDriver={handleImpersonateDriver}
                appSettings={appSettings}
                onUpdateSettings={setAppSettings}
                onAddClient={handleAddClient}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
                onOpenCreateClient={openCreateClientModal}
                onOpenEditClient={openEditClientModal}
                onOpenCreateDriver={openCreateDriverModal}
                onOpenEditDriver={openEditDriverModal}
                onOptimizeRoutes={handleOptimizeRoutes} // <-- Pasar la nueva función
              />
            ) : activeUser.role === 'client' ? (
              <ClientView client={activeUser} shipments={shipments} onCreateShipment={openCreateShipmentModal} onChangePassword={handleClientPasswordChange} />
            ) : activeUser.role === 'driver' ? (
              <DriverView
                driver={activeUser} shipments={shipments} pickups={pickups} clients={clients} drivers={drivers}
                onUpdateShipment={handleUpdateShipmentStatus} onCreateShipment={openCreateShipmentModal}
                onEditShipment={openEditShipmentModal} onCreatePickup={openCreatePickupModal} appSettings={appSettings}
              />
            ) : null
          }
        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} SUM Logística</p>
        </footer>
      </div>

      <ShipmentModal
        isOpen={isShipmentModalOpen}
        onCancel={closeShipmentModal}
        onSave={handleSaveShipment}
        shipmentToEdit={shipmentToEdit}
        clients={clients}
        recipients={recipients}
        drivers={drivers}
        onAddRecipient={handleAddRecipient}
        onAddClient={handleAddClient}
        currentUser={activeUser}
      />

      <PickupModal
        isOpen={isPickupModalOpen}
        onCancel={closePickupModal}
        onSave={handleCreatePickup}
        clients={clients}
        currentUser={activeUser}
      />

      {isClientModalOpen && <ClientModal
        clientToEdit={clientToEdit}
        onSave={handleSaveClient}
        onCancel={closeClientModal}
        drivers={drivers} // <-- Pasar la lista de transportistas
      />}

      {isDriverModalOpen && <DriverModal
        driverToEdit={driverToEdit}
        onSave={handleSaveDriver}
        onCancel={closeDriverModal}
      />}

    </div>
  );
}
