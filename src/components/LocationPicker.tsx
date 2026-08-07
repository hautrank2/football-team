"use client";

import mapboxgl from "mapbox-gl";
import { MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// [longitude, latitude] — Mapbox order.
export type Coordinate = [number, number];

export type LocationValue = {
  address: string;
  coordinate?: Coordinate;
};

export type LocationPickerProps = {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
};

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
// Default center: Hà Nội, used only until the user picks a point.
const DEFAULT_CENTER: Coordinate = [105.8342, 21.0278];

// Reverse-geocode a point into a human address (Vietnamese). Best-effort.
const reverseGeocode = async (lng: number, lat: number): Promise<string | undefined> => {
  if (!TOKEN) return undefined;
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${TOKEN}&language=vi&limit=1`
    );
    const json = (await res.json()) as { features?: { place_name?: string }[] };
    return json.features?.[0]?.place_name;
  } catch {
    return undefined;
  }
};

// Address (freely editable, seeded from Mapbox) + coordinate (Mapbox-only, set by
// clicking/dragging the map). Falls back to an address-only input when the token
// is missing so the profile form still works.
export const LocationPicker = ({ value, onChange }: LocationPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  // Keep the latest onChange/value without re-initialising the map.
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = TOKEN;
    const start = valueRef.current.coordinate ?? DEFAULT_CENTER;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: start,
      zoom: valueRef.current.coordinate ? 14 : 11,
    });
    mapRef.current = map;

    const marker = new mapboxgl.Marker({ draggable: true });
    if (valueRef.current.coordinate) marker.setLngLat(start).addTo(map);
    markerRef.current = marker;

    const apply = async (lng: number, lat: number) => {
      marker.setLngLat([lng, lat]).addTo(map);
      const coordinate: Coordinate = [lng, lat];
      const address = (await reverseGeocode(lng, lat)) ?? valueRef.current.address;
      onChangeRef.current({ address, coordinate });
    };

    map.on("click", (e) => void apply(e.lngLat.lng, e.lngLat.lat));
    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      void apply(lng, lat);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <Label className="flex items-center gap-1">
        <MapPin className="size-4" />
        Địa chỉ &amp; vị trí
      </Label>

      {TOKEN ? (
        <div ref={containerRef} className="h-64 w-full overflow-hidden rounded-md border" />
      ) : (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Chưa cấu hình <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> — bản đồ đang tắt. Bạn vẫn có thể nhập
          địa chỉ bằng tay; tọa độ sẽ để trống cho tới khi có token.
        </p>
      )}

      <Input
        placeholder="Địa chỉ (tự điền từ bản đồ, có thể sửa)"
        value={value.address}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
      />
      {value.coordinate ? (
        <span className="text-xs text-muted-foreground">
          Tọa độ: {value.coordinate[1].toFixed(5)}, {value.coordinate[0].toFixed(5)}
        </span>
      ) : null}
    </div>
  );
};
