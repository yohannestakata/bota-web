"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { divIcon } from "leaflet";
import { MapPin } from "lucide-react";
import { renderToString } from "react-dom/server";

interface MapProps {
  lat: number;
  lon: number;
  name: string;
}

export default function LeafletMap({ lat, lon, name }: MapProps) {
  const center: LatLngExpression = [lat, lon];
  const pinIcon = useMemo(() => {
    return divIcon({
      html: renderToString(
        <MapPin color="#fff" size={40} fill="#009865" strokeWidth={1} />,
      ),
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  }, []);

  return (
    <div className="border-border relative h-full overflow-hidden border">
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
        <Marker position={center} icon={pinIcon}>
          <Popup>{name}</Popup>
        </Marker>
        <div className="absolute top-1 right-1" style={{ zIndex: 99999 }}>
          <RecenterButton lat={lat} lon={lon} />
        </div>
      </MapContainer>
    </div>
  );
}

function RecenterButton({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  return (
    <button
      type="button"
      onClick={() => map.setView([lat, lon], map.getZoom())}
      className="bg-primary text-primary-foreground m-2 cursor-pointer rounded p-2 shadow"
      aria-label="Recenter to place"
    >
      <MapPin size={20} />
    </button>
  );
}
