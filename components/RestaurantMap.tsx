"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { fitColor } from "@/lib/nutrition";

export interface MapItem {
  slug: string;
  name: string;
  cuisine: string;
  lat: number;
  lng: number;
  distanceMi: number;
  fit: number; // 0 if no profile
  partner: boolean;
}

function pin(fit: number, partner: boolean) {
  const color = fit > 0 ? fitColor(fit) : "#577353";
  const label = fit > 0 ? String(fit) : "";
  const ring = partner ? "box-shadow:0 0 0 3px rgba(194,75,44,0.40), 0 4px 10px rgba(0,0,0,0.25);" : "box-shadow:0 4px 10px rgba(0,0,0,0.25);";
  return L.divIcon({
    className: "",
    html: `<div style="width:34px;height:34px;border-radius:50%;background:${color};border:2px solid #fff;${ring}display:grid;place-items:center;color:#fff;font-weight:700;font-size:12px;font-family:var(--font-display,sans-serif)">${label || "•"}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

export default function RestaurantMap({
  items,
  center = [42.3551, -71.0707],
}: {
  items: MapItem[];
  center?: [number, number];
}) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {items.map((r) => (
        <Marker key={r.slug} position={[r.lat, r.lng]} icon={pin(r.fit, r.partner)}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <p style={{ fontWeight: 700, margin: 0, color: "#0b1f17" }}>{r.name}</p>
              <p style={{ margin: "2px 0 6px", fontSize: 12, color: "#6b7280" }}>
                {r.cuisine} · {r.distanceMi} mi{r.partner ? " · Partner" : ""}
              </p>
              {r.fit > 0 && (
                <p style={{ margin: "0 0 8px", fontSize: 12 }}>
                  <span style={{ background: fitColor(r.fit), color: "#fff", borderRadius: 999, padding: "1px 8px", fontWeight: 700 }}>
                    {r.fit} fit
                  </span>
                </p>
              )}
              <Link href={`/restaurant/${r.slug}`} style={{ color: "#047857", fontWeight: 600, fontSize: 13 }}>
                View menu →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
