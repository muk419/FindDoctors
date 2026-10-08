"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { decodePolyline } from "@/lib/geo";
import type { Doctor, Hospital, LatLng, Pharmacy } from "@/lib/types";

function pin(color: string, label: string, size = 28) {
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);color:#fff;font:700 ${size / 2}px sans-serif">${label}</span></div>`,
  });
}

const ICONS = {
  you: L.divIcon({
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: '<div style="width:20px;height:20px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 5px rgba(37,99,235,.25)"></div>',
  }),
  doctor: pin("#14b8a6", "+"),
  doctorSelected: pin("#0f766e", "+", 36),
  hospital: pin("#e11d48", "H"),
  hospitalRecommended: pin("#f59e0b", "H", 34),
  hospitalSelected: pin("#9f1239", "H", 36),
  pharmacy: pin("#7c3aed", "℞", 26),
  pharmacy24x7: pin("#16a34a", "℞", 30),
  pharmacySelected: pin("#14532d", "℞", 36),
};

export default function MapView({
  origin,
  doctors,
  hospitals,
  pharmacies,
  recommendedHospitalId,
  selectedId,
  polyline,
  visible,
  onSelectDoctor,
  onSelectHospital,
  onSelectPharmacy,
  onSetOrigin,
}: {
  origin: LatLng;
  doctors: Doctor[];
  hospitals: Hospital[];
  pharmacies: Pharmacy[];
  recommendedHospitalId: string | null;
  selectedId: string | null;
  polyline: string | null;
  /** Phones hide the map behind a List/Map switch; Leaflet must re-measure when it appears. */
  visible: boolean;
  onSelectDoctor: (d: Doctor) => void;
  onSelectHospital: (h: Hospital) => void;
  onSelectPharmacy: (p: Pharmacy) => void;
  onSetOrigin: (p: LatLng) => void;
}) {
  const path = useMemo(() => (polyline ? decodePolyline(polyline) : null), [polyline]);

  return (
    <MapContainer center={origin} zoom={13} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToSetOrigin onSetOrigin={onSetOrigin} />
      <FitBounds origin={origin} doctors={doctors} hospitals={hospitals} path={path} visible={visible} />

      <Marker position={origin} icon={ICONS.you} zIndexOffset={1000}>
        <Tooltip>You are here</Tooltip>
      </Marker>

      {hospitals.map((h) => (
        <Marker
          key={h.id}
          position={h.location}
          icon={
            h.id === selectedId
              ? ICONS.hospitalSelected
              : h.id === recommendedHospitalId
                ? ICONS.hospitalRecommended
                : ICONS.hospital
          }
          zIndexOffset={h.id === selectedId ? 900 : h.id === recommendedHospitalId ? 500 : 100}
          eventHandlers={{ click: () => onSelectHospital(h) }}
        >
          <Tooltip>{h.name}</Tooltip>
        </Marker>
      ))}

      {doctors.map((d) => (
        <Marker
          key={d.id}
          position={d.location}
          icon={d.id === selectedId ? ICONS.doctorSelected : ICONS.doctor}
          zIndexOffset={d.id === selectedId ? 900 : 200}
          eventHandlers={{ click: () => onSelectDoctor(d) }}
        >
          <Tooltip>{d.name}</Tooltip>
        </Marker>
      ))}

      {pharmacies.map((p) => (
        <Marker
          key={p.id}
          position={p.location}
          icon={p.id === selectedId ? ICONS.pharmacySelected : p.open24x7 ? ICONS.pharmacy24x7 : ICONS.pharmacy}
          zIndexOffset={p.id === selectedId ? 900 : p.open24x7 ? 400 : 150}
          eventHandlers={{ click: () => onSelectPharmacy(p) }}
        >
          <Tooltip>
            {p.name}
            {p.open24x7 ? " · 24×7" : ""}
          </Tooltip>
        </Marker>
      ))}

      {path && <Polyline positions={path} pathOptions={{ color: "#2563eb", weight: 6, opacity: 0.85 }} />}
    </MapContainer>
  );
}

function ClickToSetOrigin({ onSetOrigin }: { onSetOrigin: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onSetOrigin({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function FitBounds({
  origin,
  doctors,
  hospitals,
  path,
  visible,
}: {
  origin: LatLng;
  doctors: Doctor[];
  hospitals: Hospital[];
  path: LatLng[] | null;
  visible: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const points = path ?? [origin, ...doctors.map((d) => d.location), ...hospitals.map((h) => h.location)];
    if (points.length < 2) map.setView(origin, 14);
    else map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
  }, [map, origin, doctors, hospitals, path, visible]);
  return null;
}
