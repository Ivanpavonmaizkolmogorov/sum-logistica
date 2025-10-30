import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Truck, MapPin, Clock, Route } from 'lucide-react';
import Card from '../components/ui/Card';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.75rem'
};

const center = {
  lat: 40.416775,
  lng: -3.703790
};

const routeColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1'];

export const RoutePlanningView = ({ shipments, drivers, onOptimize }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // ¡IMPORTANTE! Usa una variable de entorno
  });

  const [selectedShipmentIds, setSelectedShipmentIds] = useState(new Set());
  const [selectedDriverIds, setSelectedDriverIds] = useState(new Set());
  const [optimizedData, setOptimizedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  const unassignedShipments = shipments.filter(s => s.status === 'Pendiente' && !s.driverId);

  const handleShipmentToggle = (shipmentId) => {
    setSelectedShipmentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shipmentId)) {
        newSet.delete(shipmentId);
      } else {
        newSet.add(shipmentId);
      }
      return newSet;
    });
  };

  const handleDriverToggle = (driverId) => {
    setSelectedDriverIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(driverId)) {
        newSet.delete(driverId);
      } else {
        newSet.add(driverId);
      }
      return newSet;
    });
  };

  const handleOptimizeClick = async () => {
    if (selectedShipmentIds.size === 0 || selectedDriverIds.size === 0) {
      setError("Debes seleccionar al menos un envío y un transportista.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setOptimizedData(null);

    try {      
      // --- MOCK DE RESPUESTA PARA DEMOSTRACIÓN ---
      // En una implementación real, esto vendría del backend.
      // La llamada real al backend se haría con:
      // const result = await onOptimize(Array.from(selectedShipmentIds), Array.from(selectedDriverIds));

      // Este mock simula la respuesta del backend, incluyendo coordenadas.
      const mockResult = {
        routes: Array.from(selectedDriverIds).map((driverId, index) => ({
          driverId: driverId,
          totalDistance: Math.floor(Math.random() * 50000) + 10000,
          totalTime: Math.floor(Math.random() * 7200) + 3600,
          stops: Array.from(selectedShipmentIds)
            .map(id => shipments.find(s => s.id === id))
            .filter((_, i) => i % selectedDriverIds.size === index) // Distribuir envíos
            .map((s, stopIndex) => ({
              shipmentId: s.id,
              lat: 40.416775 + (Math.random() - 0.5) * 0.5, // Coordenadas aleatorias cerca de Madrid
              lng: -3.703790 + (Math.random() - 0.5) * 0.5,
              recipient: s.recipient,
              address: s.destination,
              order: stopIndex + 1,
            }))
        })).filter(r => r.stops.length > 0)
      };
      // --- FIN DEL MOCK ---

      setOptimizedData(mockResult);
    } catch (err) {
      setError("Error al optimizar las rutas. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadError) {
    return <div className="text-red-500">Error al cargar el mapa. Asegúrate de que la API Key de Google Maps es correcta.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panel de Control */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <h3 className="text-xl font-bold mb-4">1. Seleccionar Envíos Pendientes</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {unassignedShipments.length > 0 ? unassignedShipments.map(s => (
              <label key={s.id} className="flex items-center space-x-3 p-2 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-700">
                <input type="checkbox" checked={selectedShipmentIds.has(s.id)} onChange={() => handleShipmentToggle(s.id)} className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500" />
                <div>
                  <p className="font-semibold">{s.recipient}</p>
                  <p className="text-sm text-gray-400">{s.destination}</p>
                </div>
              </label>
            )) : <p className="text-gray-500">No hay envíos pendientes.</p>}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">2. Seleccionar Transportistas</h3>
          <div className="space-y-2">
            {drivers.map(d => (
              <label key={d.id} className="flex items-center space-x-3 p-2 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-700">
                <input type="checkbox" checked={selectedDriverIds.has(d.id)} onChange={() => handleDriverToggle(d.id)} className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500" />
                <p className="font-semibold">{d.name}</p>
              </label>
            ))}
          </div>
        </Card>

        <button
          onClick={handleOptimizeClick}
          disabled={isLoading || selectedShipmentIds.size === 0 || selectedDriverIds.size === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Optimizando...' : 'Optimizar Rutas'}
        </button>
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>

      {/* Visualización del Mapa y Rutas */}
      <div className="lg:col-span-2">
        <Card>
          <h3 className="text-xl font-bold mb-4">Rutas Optimizadas</h3>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={6}
            >
              {optimizedData && optimizedData.routes.map((route, routeIndex) => (
                <React.Fragment key={route.driverId}>
                  {/* Dibuja la polilínea de la ruta */}
                  <Polyline
                    path={route.stops.map(stop => ({ lat: stop.lat, lng: stop.lng }))}
                    options={{
                      strokeColor: routeColors[routeIndex % routeColors.length],
                      strokeOpacity: 0.8,
                      strokeWeight: 4,
                    }}
                  />
                  {/* Dibuja los marcadores para cada parada */}
                  {route.stops.map((stop) => (
                    <Marker
                      key={stop.shipmentId}
                      position={{ lat: stop.lat, lng: stop.lng }}
                      label={{
                        text: stop.order.toString(),
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                      onClick={() => setActiveMarker(stop)}
                    />
                  ))}
                </React.Fragment>
              ))}

              {/* Muestra una ventana de información al hacer clic en un marcador */}
              {activeMarker && (
                <InfoWindow
                  position={{ lat: activeMarker.lat, lng: activeMarker.lng }}
                  onCloseClick={() => setActiveMarker(null)}
                >
                  <div className="p-1 text-black">
                    <h4 className="font-bold">Parada #{activeMarker.order}</h4>
                    <p>{activeMarker.recipient}</p>
                    <p className="text-sm">{activeMarker.address}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : <div>Cargando mapa...</div>}

          {/* Resumen de las rutas generadas */}
          {optimizedData && (
            <div className="mt-6 space-y-4">
              {optimizedData.routes.map((route, index) => {
                const driver = drivers.find(d => d.id === route.driverId);
                return (
                  <div key={route.driverId} className="p-4 rounded-lg" style={{ border: `2px solid ${routeColors[index % routeColors.length]}` }}>
                    <div className="flex items-center gap-3 mb-2">
                      <Truck size={20} style={{ color: routeColors[index % routeColors.length] }} />
                      <h4 className="text-lg font-bold">{driver?.name || 'Transportista Desconocido'}</h4>
                    </div>
                    <div className="flex justify-between text-sm text-gray-300">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {route.stops.length} paradas</span>
                      <span className="flex items-center gap-1"><Route size={14} /> {(route.totalDistance / 1000).toFixed(1)} km</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> ~{(route.totalTime / 3600).toFixed(1)} horas</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RoutePlanningView;