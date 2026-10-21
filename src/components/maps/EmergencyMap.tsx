import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  patientLocation?: { lat: number; lng: number; label?: string };
  ambulanceLocation?: { lat: number; lng: number; label?: string; heading?: number };
  hospitalLocation?: { lat: number; lng: number; label?: string };
  routeCoordinates?: [number, number][];
  height?: string;
  zoom?: number;
  interactive?: boolean;
}

export const EmergencyMap: React.FC<MapProps> = ({
  patientLocation,
  ambulanceLocation,
  hospitalLocation,
  routeCoordinates = [],
  height = '360px',
  zoom = 14,
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center coordinates (default: patient, ambulance, or Bengaluru central)
    const initialLat = patientLocation?.lat || ambulanceLocation?.lat || 12.9716;
    const initialLng = patientLocation?.lng || ambulanceLocation?.lng || 77.5946;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: false,
      });

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Helper: Create custom SVG icons
    const createMarkerIcon = (color: string, emoji: string) =>
      L.divIcon({
        className: 'custom-emergency-icon',
        html: `
          <div style="
            background-color: ${color};
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
          ">
            ${emoji}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17],
      });

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const boundsPoints: L.LatLngExpression[] = [];

    // 1. Patient Marker
    if (patientLocation && !isNaN(patientLocation.lat) && !isNaN(patientLocation.lng)) {
      const pIcon = createMarkerIcon('#dc2626', '🆘');
      const pMarker = L.marker([patientLocation.lat, patientLocation.lng], { icon: pIcon })
        .addTo(map)
        .bindPopup(`<strong>Emergency Distress Point</strong><br/>${patientLocation.label || 'Patient Location'}`);
      markersRef.current['patient'] = pMarker;
      boundsPoints.push([patientLocation.lat, patientLocation.lng]);
    }

    // 2. Ambulance Marker
    if (ambulanceLocation && !isNaN(ambulanceLocation.lat) && !isNaN(ambulanceLocation.lng)) {
      const aIcon = createMarkerIcon('#2563eb', '🚑');
      const aMarker = L.marker([ambulanceLocation.lat, ambulanceLocation.lng], { icon: aIcon })
        .addTo(map)
        .bindPopup(`<strong>Ambulance Unit</strong><br/>${ambulanceLocation.label || 'En-Route Vehicle'}`);
      markersRef.current['ambulance'] = aMarker;
      boundsPoints.push([ambulanceLocation.lat, ambulanceLocation.lng]);
    }

    // 3. Hospital Marker
    if (hospitalLocation && !isNaN(hospitalLocation.lat) && !isNaN(hospitalLocation.lng)) {
      const hIcon = createMarkerIcon('#059669', '🏥');
      const hMarker = L.marker([hospitalLocation.lat, hospitalLocation.lng], { icon: hIcon })
        .addTo(map)
        .bindPopup(`<strong>Trauma Center</strong><br/>${hospitalLocation.label || 'Destination ER'}`);
      markersRef.current['hospital'] = hMarker;
      boundsPoints.push([hospitalLocation.lat, hospitalLocation.lng]);
    }

    // 4. Draw Driving Route Polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 1) {
      const polyline = L.polyline(routeCoordinates, {
        color: '#dc2626',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round',
      }).addTo(map);

      polylineRef.current = polyline;
      boundsPoints.push(...routeCoordinates);
    }

    // Fit map bounds if multiple points exist
    if (boundsPoints.length > 1) {
      try {
        const bounds = L.latLngBounds(boundsPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } catch (e) {
        // ignore bounds calculation error
      }
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], zoom);
    }

    // Invalidate size after layout settles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [patientLocation, ambulanceLocation, hospitalLocation, routeCoordinates, zoom, interactive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%', zIndex: 10 }}
        className="bg-slate-100 dark:bg-slate-900"
      />
      
      {/* Map Attribution and Live GPS Status Badge */}
      <div className="absolute bottom-2 left-2 z-20 pointer-events-none flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live OpenStreetMap • OSRM Emergency Corridor</span>
        </div>
      </div>
    </div>
  );
};
