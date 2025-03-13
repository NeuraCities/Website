import React from 'react';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';

const MapComponent = ({ randomPoints }: { randomPoints: { lat: number; lng: number }[] }) => {
  return (
    <MapContainer
      center={[30.2672, -97.7431]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem', position: 'relative' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://cartocdn.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {randomPoints.map((point, i) => (
        <CircleMarker
          key={i}
          center={[point.lat, point.lng]}
          radius={4}
          pathOptions={{ color: '#FF5733', fillColor: '#FF5733', fillOpacity: 0.8 }}
          className="animate-pulse"
        />
      ))}
    </MapContainer>
  );
};

export default MapComponent;