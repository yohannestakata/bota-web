"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

interface MapProps {
  lat: number;
  lon: number;
  name: string;
}

export default function LeafletMap({ lat, lon, name }: MapProps) {
  const center: LatLngExpression = [lat, lon];

  return (
    <div className="border-border h-full overflow-hidden rounded-3xl border">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <CircleMarker
          center={center}
          radius={10}
          pathOptions={{ color: "#22c55e" }}
        >
          <Popup>{name}</Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}

