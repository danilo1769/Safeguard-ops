import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// FIX 1: Conectamos correctamente la sombra importada a la propiedad shadowUrl
const customIcon = new L.Icon({ 
  iconUrl: iconUrl, 
  shadowUrl: iconShadow, 
  iconAnchor: [12, 41] 
});

// FIX 2 (SonarQube): Marcamos todas las propiedades como de Solo Lectura
interface MapaProps {
  readonly latitud: number;
  readonly longitud: number;
  readonly onLocationSelect: (lat: number, lng: number) => void;
}

const CapturarClic = ({ onSelect }: { readonly onSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export default function MapaSelector({ latitud, longitud, onLocationSelect }: MapaProps) {
  return (
    <div style={{ height: '350px', width: '100%', border: '2px solid #ccc', borderRadius: '8px', zIndex: 0 }}>
      <MapContainer center={[latitud, longitud]} zoom={14} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <CapturarClic onSelect={onLocationSelect} />
        <Marker position={[latitud, longitud]} icon={customIcon} />
      </MapContainer>
    </div>
  );
}