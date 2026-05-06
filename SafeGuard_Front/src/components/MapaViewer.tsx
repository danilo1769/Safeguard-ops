import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({ 
  iconUrl: iconUrl, 
  shadowUrl: iconShadow, 
  iconAnchor: [12, 41] 
});

interface MapaViewerProps {
  readonly latitud: number;
  readonly longitud: number;
}

export default function MapaViewer({ latitud, longitud }: MapaViewerProps) {
  return (
    <div style={{ height: '200px', width: '100%', border: '1px solid #ddd', borderRadius: '8px', zIndex: 0, marginTop: '10px' }}>
      <MapContainer center={[latitud, longitud]} zoom={15} dragging={false} zoomControl={false} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitud, longitud]} icon={customIcon} />
      </MapContainer>
    </div>
  );
}