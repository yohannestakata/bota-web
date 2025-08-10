"use client";

import dynamic from "next/dynamic";

interface MapProps {
  lat: number;
  lon: number;
  name: string;
}

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="border-border h-full overflow-hidden rounded-3xl border" />
  ),
});

export default function Map(props: MapProps) {
  return <LeafletMap {...props} />;
}
