"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { divIcon } from "leaflet";
import { MapPin } from "lucide-react";
import { renderToString } from "react-dom/server";

interface MapPickerProps {
  lat?: number | null;
  lon?: number | null;
  onChange: (lat: number, lon: number) => void;
}

function ClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lon: number) => void;
}) {
  const map = useMap();
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
      map.setView(e.latlng, map.getZoom());
    },
  });
  return null;
}

export default function LeafletMapPicker({
  lat,
  lon,
  onChange,
}: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    lat != null && lon != null ? [Number(lat), Number(lon)] : null,
  );

  const center: LatLngExpression = useMemo(() => {
    if (position) return position;
    // Default center: Addis Ababa (approx)
    return [9.0108, 38.7613];
  }, [position]);

  useEffect(() => {
    if (
      lat != null &&
      lon != null &&
      !Number.isNaN(Number(lat)) &&
      !Number.isNaN(Number(lon))
    ) {
      const next: [number, number] = [Number(lat), Number(lon)];
      // Avoid resetting state if unchanged
      if (!position || position[0] !== next[0] || position[1] !== next[1]) {
        setPosition(next);
      }
    }
  }, [lat, lon, position]);

  const handleSelect = (newLat: number, newLon: number) => {
    setPosition([newLat, newLon]);
    onChange(newLat, newLon);
  };

  const pinIcon = useMemo(() => {
    return divIcon({
      html: renderToString(
        <MapPin color="#fff" size={40} fill="#ff2056" strokeWidth={1} />,
      ),
      className: "",
      iconSize: [32, 32],
      iconAnchor: [14, 28],
    });
  }, []);

  return (
    <div className="border-border h-64 w-full overflow-hidden border md:h-80">
      <MapContainer
        center={center}
        zoom={position ? 16 : 12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <ClickHandler onSelect={handleSelect} />

        {position ? <Marker position={position} icon={pinIcon} /> : null}
      </MapContainer>
    </div>
  );
}
