import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '../constants';
import { Coordinates, Toilet } from '../types';

// Use CDN for default icons
const DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const toiletIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  routeCoordinates: Coordinates[] | null;
  toilets: Toilet[];
  startLocation: Coordinates | null;
  endLocation: Coordinates | null;
  selectedToiletId: string | number | null;
  onToiletSelect: (id: string | number) => void;
  padding?: [number, number];
}

// Helper to fit bounds
const BoundsController: React.FC<{ coords: Coordinates[]; padding?: [number, number] }> = ({ coords, padding }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { 
        paddingTopLeft: padding || [20, 20],
        paddingBottomRight: [20, 20],
        maxZoom: 15,
        animate: true
      });
    }
  }, [coords, map, padding]);
  return null;
};

export const Map: React.FC<MapProps> = ({ 
  routeCoordinates, 
  toilets, 
  startLocation, 
  endLocation, 
  selectedToiletId,
  onToiletSelect,
  padding
}) => {
  
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={MAP_DEFAULT_CENTER} 
        zoom={MAP_DEFAULT_ZOOM} 
        scrollWheelZoom={true} 
        className="h-full w-full outline-none bg-slate-50 dark:bg-slate-900"
        zoomControl={false} 
      >
        <ZoomControl position="bottomright" />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />

        {routeCoordinates && (
          <>
            <Polyline 
              positions={routeCoordinates.map(c => [c.lat, c.lng])} 
              color="#3b82f6" 
              weight={6} 
              opacity={0.8} 
              lineCap="round"
              lineJoin="round"
            />
            <BoundsController coords={routeCoordinates} padding={padding} />
          </>
        )}

        {startLocation && (
          <Marker position={[startLocation.lat, startLocation.lng]} icon={startIcon}>
            <Popup className="font-sans"><strong>Start</strong></Popup>
          </Marker>
        )}

        {endLocation && (
          <Marker position={[endLocation.lat, endLocation.lng]} icon={endIcon}>
            <Popup className="font-sans"><strong>Destination</strong></Popup>
          </Marker>
        )}

        {toilets.map((toilet) => (
          <Marker
            key={toilet.id}
            position={[toilet.lat, toilet.lng]}
            icon={toiletIcon}
            eventHandlers={{
              click: () => onToiletSelect(toilet.id),
            }}
            opacity={selectedToiletId && selectedToiletId !== toilet.id ? 0.6 : 1}
          >
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};