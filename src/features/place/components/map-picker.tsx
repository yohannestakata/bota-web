"use client";

import dynamic from "next/dynamic";

const LeafletMapPicker = dynamic(() => import("./leaflet-map-picker"), {
  ssr: false,
  loading: () => (
    <div className="border-border h-64 w-full overflow-hidden border md:h-80" />
  ),
});

export default LeafletMapPicker;
