import React, { useState, useMemo } from 'react';
import {
  MapPin, Truck, Package, Users, BarChart2, CheckCircle, Clock, Signature,
  Camera, X, FileText, Plus, LocateFixed, GripVertical, Shuffle, UserPlus, Search,
  Pencil, Trash2, DollarSign, ChevronDown, ChevronUp, LogOut, LogIn, Settings, Filter,
  ToggleLeft, ToggleRight, AlertTriangle, Printer,
  Archive, // Icono para Recogidas
  Mail, // Icono para Email
  MessageSquare // Icono para WhatsApp
} from 'lucide-react';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import DriverModal from '../components/modals/DriverModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal'; // Importar DeleteConfirmationModal
import { ClientManagementView } from './ClientManagementView';
import { AdminSettings } from './AdminSettings';

export const AdminDashboard = ({
  shipments, pickups, clients, drivers,
  onAddDriver, onUpdateDriver, onEditShipment, onDeleteShipment, onImpersonateDriver,
  appSettings, onUpdateSettings,
  onAddClient, onUpdateClient, onDeleteClient,
  onOpenCreateClient, onOpenEditClient, onOpenCreateDriver, onOpenEditDriver
}) => {
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [driverToEdit, setDriverToEdit] = useState(null);
  const [shipmentToDelete, setShipmentToDelete] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null); // Para confirmación de borrado
  const [expandedSummaryDriverId, setExpandedSummaryDriverId] = useState(null);
  const [sortOrder, setSortOrder] = useState('default');
  const [statusFilter, setStatusFilter] = useState('activos');
  const [view, setView] = useState('dashboard'); // 'dashboard', 'activity', 'clients', 'settings'
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterDriverId, setFilterDriverId] = useState('');
  const [filterHasReembolso, setFilterHasReembolso] = useState(false);
  const [filterHasIncidencia, setFilterHasIncidencia] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const stats = {
    total: shipments.length,
    inRoute: shipments.filter(s => s.status === 'En ruta').length,
    delivered: shipments.filter(s => s.status === 'Entregado').length,
    pending: shipments.filter(s => s.status === 'Pendiente' || (s.status === 'Cobro Pendiente' && !s.driverId && !s.deliveredAt)).length,
  };

  const sortedShipments = useMemo(() => {
    let filteredShipments = [...shipments];

    // 1. Filtro por estado principal
    if (statusFilter !== 'todos') {
      const activeStatuses = ['Pendiente', 'En ruta', 'Cobro Pendiente'];
      filteredShipments = shipments.filter(s => {
        if (statusFilter === 'activos') {
          // Un envío es activo si su estado está en la lista Y, si es 'Cobro Pendiente', no debe haber sido entregado.
          return activeStatuses.includes(s.status) && !(s.status === 'Cobro Pendiente' && s.deliveredAt);
        }
        if (statusFilter === 'pendientes') return s.status === 'Pendiente' || (s.status === 'Cobro Pendiente' && !s.driverId);
        if (statusFilter === 'en_reparto') return s.status === 'En ruta';
        if (statusFilter === 'entregados') return s.status === 'Entregado';
        if (statusFilter === 'pend_cobro') return s.status === 'Cobro Pendiente';
        if (statusFilter === 'incidencia') return s.status === 'Incidencia';
        return true;
      });
    }

    // 2. Filtros avanzados
    if (filterDriverId) {
      filteredShipments = filteredShipments.filter(s => s.driverId === parseInt(filterDriverId, 10));
    }
    if (filterHasReembolso) {
      filteredShipments = filteredShipments.filter(s => s.collectedAmount > 0);
    }
    if (filterHasIncidencia) {
      filteredShipments = filteredShipments.filter(s => s.status === 'Incidencia');
    }

    // 3. Búsqueda por término
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filteredShipments = filteredShipments.filter(s =>
        s.recipient.toLowerCase().includes(lowercasedTerm) ||
        s.destination.toLowerCase().includes(lowercasedTerm) ||
        s.id.toString().includes(lowercasedTerm)
      );
    }

    const getCity = (address) => {
      const parts = address.split(',');
      return parts.length > 1 ? parts.slice(1).join(',').trim() : address;
    };

    switch (sortOrder) {
      case 'poblacion': return filteredShipments.sort((a, b) => getCity(a.destination).localeCompare(getCity(b.destination)));
      case 'transportista': return filteredShipments.sort((a, b) => (drivers.find(d => d.id === a.driverId)?.name || '').localeCompare(drivers.find(d => d.id === b.driverId)?.name || ''));
      case 'default': default: return filteredShipments.sort((a, b) => a.id - b.id);
    }
  }, [shipments, statusFilter, sortOrder, drivers, searchTerm, filterDriverId, filterHasReembolso, filterHasIncidencia]);

  const activityData = useMemo(() => {
    const activeShipments = shipments.filter(s => s.status === 'Pendiente' || s.status === 'En ruta');
    return activeShipments.reduce((acc, shipment) => {
      (acc[shipment.driverId] = acc[shipment.driverId] || []).push(shipment);
      return acc;
    }, {});
  }, [shipments]);

  const dailySummaryData = useMemo(() => {
    const deliveredShipments = shipments.filter(s =>
      s.status === 'Entregado' &&
      s.deliveredAt &&
      s.deliveredAt.startsWith(selectedDate)
    );

    const summaryByDriver = deliveredShipments.reduce((acc, shipment) => {
      const driverId = shipment.driverId;
      if (!acc[driverId]) {
        acc[driverId] = {
          driverName: drivers.find(d => d.id === driverId)?.name || 'Desconocido',
          totalShippingCost: 0,
          totalCollectedAmount: 0,
          shipments: []
        };
      }
      acc[driverId].totalShippingCost += shipment.shippingCost;
      acc[driverId].totalCollectedAmount += shipment.collectedAmount;
      acc[driverId].shipments.push(shipment);
      return acc;
    }, {});

    return Object.entries(summaryByDriver).map(([driverId, data]) => ({
      driverId: parseInt(driverId),
      ...data
    }));
  }, [shipments, drivers, selectedDate]);

  const dailyPickupSummary = useMemo(() => {
    const dayPickups = pickups.filter(p => p.createdAt && p.createdAt.startsWith(selectedDate));

    const summaryByClient = dayPickups.reduce((acc, pickup) => {
      const clientId = pickup.clientId;
      if (!acc[clientId]) {
        const client = clients.find(c => c.id === clientId);
        acc[clientId] = {
          clientName: client?.name || 'Cliente Desconocido',
          client: client,
          totalItems: 0,
          pickups: []
        };
      }
      acc[clientId].totalItems += pickup.items;
      acc[clientId].pickups.push(pickup);
      return acc;
    }, {});

    return Object.values(summaryByClient);
  }, [pickups, clients, selectedDate]);

  const globalDailySummary = useMemo(() => {
    return dailySummaryData.reduce((acc, driverSummary) => {
      acc.totalShippingCost += driverSummary.totalShippingCost;
      acc.totalCollectedAmount += driverSummary.totalCollectedAmount;
      acc.totalToSettle += driverSummary.totalShippingCost + driverSummary.totalCollectedAmount;
      return acc;
    }, { totalShippingCost: 0, totalCollectedAmount: 0, totalToSettle: 0 });
  }, [dailySummaryData]);

  const hasActiveShipments = Object.keys(activityData).length > 0;

  const toggleSummaryDetails = (driverId) => setExpandedSummaryDriverId(prevId => (prevId === driverId ? null : driverId));

  const handleSaveDriver = (driverData) => {
    if (driverData.id) onUpdateDriver(driverData.id, driverData); else onAddDriver(driverData);
    setIsDriverModalOpen(false); setDriverToEdit(null);
  };

  const handleOpenCreateDriverModal = () => { setDriverToEdit(null); setIsDriverModalOpen(true); };
  const handleOpenEditDriverModal = (driver) => { setDriverToEdit(driver); setIsDriverModalOpen(true); };
  const confirmDeleteShipment = () => { if (shipmentToDelete) { onDeleteShipment(shipmentToDelete.id); setShipmentToDelete(null); } };

  const handleDeleteClientClick = (client) => {
    if (window.confirm(`¿Seguro que quieres eliminar al cliente "${client.name}"? Esto no se puede deshacer.`)) {
      onDeleteClient(client.id);
    }
  };

  const formatBatchPickupMessage = (client, pickups) => {
    const date = new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES');
    let message = `Hola ${client.name},\n\nEste es tu resumen de recogidas de hoy (${date}):\n\n`;
    let totalItems = 0;

    pickups.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).forEach(p => {
      const time = new Date(p.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      message += `- ${time}: ${p.items} bulto(s)`;
      if (p.observations) {
        message += ` (Obs: ${p.observations})\n`;
      } else {
        message += `\n`;
      }
      totalItems += p.items;
    });

    message += `\nTotal: ${totalItems} bultos recogidos.\n\nGracias,\nSUM Logística`;
    return message;
  };

  const handleShareBatchEmail = (client, pickups) => {
    if (!client.email) {
      console.error("Este cliente no tiene un email registrado.");
      return;
    }
    const subject = `Resumen de Recogidas - ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES')}`;
    const body = formatBatchPickupMessage(client, pickups);
    const mailtoLink = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleShareBatchWhatsApp = (client, pickups) => {
    if (!client.phone) {
      console.error("Este cliente no tiene un teléfono registrado.");
      return;
    }
    const body = formatBatchPickupMessage(client, pickups);
    const whatsappLink = `https://wa.me/${client.phone}?text=${encodeURIComponent(body)}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-white">Panel de Administración</h2>
        <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-lg">
          <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-md font-semibold ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>General</button>
          <button onClick={() => setView('activity')} className={`px-4 py-2 rounded-md font-semibold ${view === 'activity' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Actividad y Resúmenes</button>
          <button onClick={() => setView('clients')} className={`px-4 py-2 rounded-md font-semibold ${view === 'clients' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Clientes</button>
          <button onClick={() => setView('settings')} className={`px-4 py-2 rounded-md font-semibold ${view === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Ajustes</button>
        </div>
      </div>

      {view === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card><div className="flex items-center space-x-4"><Package size={28} className="text-blue-400" /><div><p>Envíos Totales</p><p className="text-2xl font-bold">{stats.total}</p></div></div></Card>
            <Card><div className="flex items-center space-x-4"><Truck size={28} className="text-yellow-400" /><div><p>En Ruta</p><p className="text-2xl font-bold">{stats.inRoute}</p></div></div></Card>
            <Card><div className="flex items-center space-x-4"><CheckCircle size={28} className="text-green-400" /><div><p>Entregados</p><p className="text-2xl font-bold">{stats.delivered}</p></div></div></Card>
            <Card><div className="flex items-center space-x-4"><Clock size={28} className="text-red-400" /><div><p>Pend. de Asignar</p><p className="text-2xl font-bold">{stats.pending}</p></div></div></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                  <h3 className="text-xl font-bold">Gestión de Envíos</h3>
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="text"
                      placeholder="Buscar por ID, destinatario, dirección..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-900 text-white p-2 pl-10 rounded-lg border border-gray-600"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-700 text-sm p-2 rounded-lg"><option value="activos">Activos</option><option value="todos">Todos</option><option value="pendientes">Pend. de Asignar</option><option value="en_reparto">En Reparto</option><option value="entregados">Entregados</option><option value="pend_cobro">Pend. Cobro</option><option value="incidencia">Incidencias</option></select>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-gray-700 text-sm p-2 rounded-lg"><option value="default">Ruta</option><option value="poblacion">Población</option><option value="transportista">Transportista</option></select>
                  </div>
                  <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">
                    <Filter size={16} /> Filtros Avanzados {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {showAdvancedFilters && (
                  <div className="bg-gray-900 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select value={filterDriverId} onChange={(e) => setFilterDriverId(e.target.value)} className="bg-gray-700 text-sm p-2 rounded-lg">
                      <option value="">Todos los transportistas</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <label className="flex items-center space-x-2 text-white"><input type="checkbox" checked={filterHasReembolso} onChange={(e) => setFilterHasReembolso(e.target.checked)} className="h-4 w-4 rounded bg-gray-600" /><span>Con reembolso</span></label>
                    <label className="flex items-center space-x-2 text-white"><input type="checkbox" checked={filterHasIncidencia} onChange={(e) => setFilterHasIncidencia(e.target.checked)} className="h-4 w-4 rounded bg-gray-600" /><span>Con incidencia</span></label>
                  </div>
                )}

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {sortedShipments.map(shipment => (
                    <div key={shipment.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
                      <div className="flex-1 min-w-0"><p className="font-bold truncate">{shipment.recipient}</p><p className="text-sm text-gray-400 truncate">{shipment.destination.split(',')[0]}</p><p className="text-sm font-semibold">{shipment.destination.split(',').slice(1).join(',')}</p></div>
                      <div className="flex items-center flex-shrink-0 gap-3 ml-4"><StatusBadge status={shipment.status} /><button onClick={() => onEditShipment(shipment)} className="text-gray-400 hover:text-white"><Pencil size={18} /></button><button onClick={() => setShipmentToDelete(shipment)} className="text-red-500 hover:text-red-400"><Trash2 size={18} /></button></div>
                    </div>
                  ))}
                  {sortedShipments.length === 0 && <p className="text-center text-gray-500 py-8">No hay envíos que coincidan con los filtros.</p>}
                </div>
              </Card>
            </div>
            <div>
              <Card>
                <h3 className="text-xl font-bold mb-4">Gestión de Transportistas</h3>
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                  {drivers.map(driver => (
                    <div key={driver.id} className="bg-gray-900 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">{driver.name}</p>
                          <p className="text-sm text-gray-400 mt-1">{driver.vehicle}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => onImpersonateDriver(driver.id)} className="text-blue-400 hover:text-blue-300" title="Acceder como transportista">
                            <LogIn size={18} />
                          </button>
                          <button onClick={() => onOpenEditDriver(driver)} className="text-gray-400 hover:text-white" title="Editar transportista">
                            <Pencil size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4"><button onClick={onOpenCreateDriver} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg"><UserPlus size={18} /> Nuevo Transportista</button></div>
              </Card>
            </div>
          </div>
        </>
      )}

      {view === 'activity' && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-white">Actividad y Resúmenes Diarios</h3>
            <div>
              <label htmlFor="summary-date" className="text-sm text-gray-400 mr-2">Fecha del Resumen:</label>
              <input
                type="date"
                id="summary-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-900 text-white p-2 rounded-lg border border-gray-600"
              />
            </div>
          </div>

          <Card className="mb-10 bg-gray-900 border-2 border-green-500">
            <h4 className="text-xl font-bold mb-4 text-white">Liquidación Total del Día</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-400">Total Portes Cobrados</p>
                <p className="text-2xl font-bold text-blue-400">{globalDailySummary.totalShippingCost.toFixed(2)} €</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-400">Total Reembolsos Cobrados</p>
                <p className="text-2xl font-bold text-yellow-400">{globalDailySummary.totalCollectedAmount.toFixed(2)} €</p>
              </div>
              <div className="bg-green-800/50 p-4 rounded-lg text-center border border-green-600">
                <p className="text-sm text-green-200">TOTAL A LIQUIDAR</p>
                <p className="text-3xl font-extrabold text-white">{globalDailySummary.totalToSettle.toFixed(2)} €</p>
              </div>
            </div>
          </Card>

          <div className="mb-10">
            <h4 className="text-xl font-bold mb-4 text-white">Resumen de Entregas ({new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })})</h4>
            <div className="space-y-4">
              {dailySummaryData.length === 0 ? (
                <Card><p className="text-center text-gray-500 py-8">No hay entregas completadas para mostrar.</p></Card>
              ) : (
                dailySummaryData.map(summary => (
                  <div key={summary.driverId} className="bg-gray-900 rounded-lg overflow-hidden">
                    <button onClick={() => toggleSummaryDetails(summary.driverId)} className="w-full p-4 flex flex-col sm:flex-row justify-between sm:items-center text-left hover:bg-gray-700/50">
                      <p className="font-bold text-lg mb-2 sm:mb-0">{summary.driverName}</p>
                      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">Portes</p>
                          <p className="font-semibold text-blue-400">{summary.totalShippingCost.toFixed(2)} €</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">Reembolsos</p>
                          <p className="font-bold text-yellow-400">{summary.totalCollectedAmount.toFixed(2)} €</p>
                        </div>
                        <div className="ml-auto">
                          {expandedSummaryDriverId === summary.driverId ? <ChevronUp /> : <ChevronDown />}
                        </div>
                      </div>
                    </button>
                    {expandedSummaryDriverId === summary.driverId && (
                      <div className="bg-gray-800/50 p-4 border-t border-gray-700">
                        <h5 className="text-sm font-semibold text-gray-400 mb-2">Detalle de Entregas:</h5>
                        <div className="space-y-2">
                          {summary.shipments.map(s => (
                            <div key={s.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center text-sm">
                              <p className="text-gray-300 col-span-1 truncate" title={s.recipient}>#{s.id} - {s.recipient}</p>
                              <p className="text-blue-300 sm:text-right">Porte: {s.shippingCost.toFixed(2)} €</p>
                              <p className="text-yellow-300 sm:text-right">Reembolso: {s.collectedAmount.toFixed(2)} €</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-10">
            <h4 className="text-xl font-bold mb-4 text-white">Resumen de Recogidas ({new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })})</h4>
            <div className="space-y-4">
              {dailyPickupSummary.length === 0 ? (
                <Card><p className="text-center text-gray-500 py-8">No hay recogidas para mostrar.</p></Card>
              ) : (
                dailyPickupSummary.map(summary => (
                  <Card key={summary.client.id}>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                      <div>
                        <p className="font-bold text-lg">{summary.clientName}</p>
                        <p className="text-sm text-gray-400">{summary.client.address}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-3 sm:mt-0">
                        <button onClick={() => handleShareBatchWhatsApp(summary.client, summary.pickups)} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-lg text-sm flex items-center gap-2" title="Enviar Resumen por WhatsApp">
                          <MessageSquare size={16} /> WhatsApp
                        </button>
                        <button onClick={() => handleShareBatchEmail(summary.client, summary.pickups)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-lg text-sm flex items-center gap-2" title="Enviar Resumen por Email">
                          <Mail size={16} /> Email
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 bg-gray-900 p-3 rounded-lg max-h-60 overflow-y-auto">
                      <h5 className="text-sm font-semibold text-gray-400 mb-2">Detalle de Recogidas ({summary.totalItems} bultos totales):</h5>
                      {summary.pickups.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm">
                          <p className="text-gray-300">
                            <span className="font-semibold">{new Date(p.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}:</span> {p.items} bulto(s)
                          </p>
                          <p className="text-gray-500 truncate ml-4" title={p.observations}>{p.observations}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="mb-10">
            <h4 className="text-xl font-bold mb-4 text-white">Envíos Activos Ahora</h4>
            <div className="space-y-6">
              {!hasActiveShipments && (
                <Card><p className="text-center text-gray-500 py-8">No hay envíos activos en este momento.</p></Card>
              )}
              {hasActiveShipments && drivers.map(driver => {
                const driverShipments = activityData[driver.id];
                if (!driverShipments || driverShipments.length === 0) return null;
                return (
                  <Card key={driver.id}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">{driver.name}</h4>
                        <p className="text-sm text-gray-400">{driver.vehicle}</p>
                      </div>
                      <span className="text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full mt-2 sm:mt-0">{driverShipments.length} Activos</span>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {driverShipments.map(shipment => (
                        <div key={shipment.id} className="bg-gray-900 p-3 rounded-lg flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{shipment.recipient}</p>
                            <p className="text-sm text-gray-400 truncate" title={shipment.destination}>{shipment.destination}</p>
                          </div>
                          <div className="flex items-center flex-shrink-0 gap-3 ml-4">
                            <StatusBadge status={shipment.status} />
                            <button onClick={() => onEditShipment(shipment)} className="text-gray-400 hover:text-white" title="Editar Envío"><Pencil size={18} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {view === 'clients' && (
        <ClientManagementView
          clients={clients}
          onAdd={onOpenCreateClient}
          onEdit={onOpenEditClient}
          onDelete={handleDeleteClientClick}
        />
      )}

      {view === 'settings' && (
        <AdminSettings appSettings={appSettings} onUpdateSettings={onUpdateSettings} />
      )}

      {isDriverModalOpen && <DriverModal driverToEdit={driverToEdit} onSave={handleSaveDriver} onCancel={() => { setIsDriverModalOpen(false); setDriverToEdit(null); }} />}
      <DeleteConfirmationModal shipment={shipmentToDelete} onConfirm={confirmDeleteShipment} onCancel={() => setShipmentToDelete(null)} />
    </div>
  );
};