import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GpsLocation, Hotspot, HazardReport, RouteOption, RiskAssessment } from '../types';
import {
  Locate,
  ShieldAlert,
  Navigation,
  Layers,
  AlertTriangle,
  Route,
  Volume2,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';

interface LiveMapProps {
  location: GpsLocation | null;
  hotspots: Hotspot[];
  hazards: HazardReport[];
  currentRoute?: RouteOption | null;
  saferRoute?: RouteOption | null;
  showSaferRoute?: boolean;
  risk?: RiskAssessment | null;
  onSelectHotspot?: (hotspot: Hotspot) => void;
  onToggleSaferRoute?: () => void;
  onPlayVoiceAlert?: () => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  location,
  hotspots,
  hazards,
  currentRoute,
  saferRoute,
  showSaferRoute = false,
  risk,
  onSelectHotspot,
  onToggleSaferRoute,
  onPlayVoiceAlert,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const driverRadarCircleRef = useRef<L.Circle | null>(null);
  const hotspotsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hazardsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapTheme, setMapTheme] = useState<'voyager' | 'osm' | 'dark'>('voyager');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = location?.latitude || 17.3850;
    const initialLon = location?.longitude || 78.4867;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    const tileUrls: Record<string, string> = {
      voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    };

    const tile = L.tileLayer(tileUrls[mapTheme], {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tile;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    hotspotsLayerGroupRef.current = L.layerGroup().addTo(map);
    hazardsLayerGroupRef.current = L.layerGroup().addTo(map);
    routesLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // ResizeObserver to ensure tiles render immediately without grey voids
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    // Initial size invalidations
    setTimeout(() => map.invalidateSize(), 150);
    setTimeout(() => map.invalidateSize(), 450);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if Theme Changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    const tileUrls: Record<string, string> = {
      voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    };

    map.removeLayer(tileLayerRef.current);
    const newTile = L.tileLayer(tileUrls[mapTheme], {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
    tileLayerRef.current = newTile;
  }, [mapTheme]);

  // Update Driver Marker & Live Hazard Radar Radius
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !location) return;

    const { latitude, longitude, heading, speed } = location;
    const isHighRisk = risk?.riskLevel === 'HIGH';
    const isMediumRisk = risk?.riskLevel === 'MEDIUM';

    // Vehicle Marker with Hazard Color Coding
    const vehicleBorderColor = isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#3b82f6';
    const vehicleBgGradient = isHighRisk
      ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
      : isMediumRisk
      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
      : 'linear-gradient(135deg, #2563eb, #1d4ed8)';

    const carIconHtml = `
      <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: ${
          isHighRisk ? 'rgba(239, 68, 68, 0.45)' : 'rgba(59, 130, 246, 0.35)'
        }; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 30px; height: 30px; border-radius: 9999px; background: ${vehicleBgGradient}; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; transform: rotate(${
      heading || 0
    }deg); transition: transform 0.3s ease;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 2L4 20l8-3.5L20 20z" />
          </svg>
        </div>
      </div>
    `;

    const carIcon = L.divIcon({
      html: carIconHtml,
      className: 'driver-car-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = L.marker([latitude, longitude], { icon: carIcon }).addTo(map);
    } else {
      driverMarkerRef.current.setLatLng([latitude, longitude]);
      driverMarkerRef.current.setIcon(carIcon);
    }

    // Vehicle Popup
    driverMarkerRef.current.bindPopup(`
      <div style="padding: 6px; font-family: sans-serif; min-width: 170px;">
        <div style="font-weight: 800; color: #0f172a; font-size: 13px; margin-bottom: 2px;">Your Vehicle Telemetry</div>
        <div style="font-size: 12px; color: #334155;">Speed: <strong>${Math.round(speed)} km/h</strong></div>
        <div style="font-size: 11px; color: ${isHighRisk ? '#dc2626' : '#2563eb'}; font-weight: 700; margin-top: 2px;">
          Risk Level: ${risk?.riskLevel || 'EVALUATING'}
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E</div>
      </div>
    `);

    // Dynamic Hazard Radar Proximity Circle around Vehicle
    const radarColor = isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#3b82f6';
    const radarFill = isHighRisk ? '#dc2626' : isMediumRisk ? '#d97706' : '#2563eb';
    const radarRadius = isHighRisk ? 400 : 250;

    if (!driverRadarCircleRef.current) {
      driverRadarCircleRef.current = L.circle([latitude, longitude], {
        radius: radarRadius,
        color: radarColor,
        weight: 1.5,
        fillColor: radarFill,
        fillOpacity: 0.12,
        dashArray: '4, 6',
      }).addTo(map);
    } else {
      driverRadarCircleRef.current.setLatLng([latitude, longitude]);
      driverRadarCircleRef.current.setRadius(radarRadius);
      driverRadarCircleRef.current.setStyle({
        color: radarColor,
        fillColor: radarFill,
      });
    }

    // Smooth Pan to vehicle
    map.panTo([latitude, longitude], { animate: true, duration: 0.8 });
  }, [location, risk]);

  // Render GeoAI Hotspots
  useEffect(() => {
    const layer = hotspotsLayerGroupRef.current;
    if (!layer) return;

    layer.clearLayers();

    hotspots.forEach((hs) => {
      const isFatal = hs.severity === 'Fatal';
      const color = isFatal ? '#ef4444' : '#f59e0b';
      const fillColor = isFatal ? '#dc2626' : '#d97706';

      // Hotspot influence circle
      const circle = L.circle([hs.latitude, hs.longitude], {
        radius: hs.radiusMeters,
        color: color,
        weight: 2,
        fillColor: fillColor,
        fillOpacity: 0.2,
        dashArray: '5, 5',
      });

      // Hotspot core marker
      const markerHtml = `
        <div style="width: 28px; height: 28px; border-radius: 9999px; background: ${color}; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); cursor: pointer;">
          <span style="font-size: 13px; font-weight: 900; color: #ffffff;">!</span>
        </div>
      `;
      const icon = L.divIcon({
        html: markerHtml,
        className: 'hotspot-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([hs.latitude, hs.longitude], { icon });

      marker.bindPopup(`
        <div style="padding: 8px; font-family: sans-serif; max-width: 230px;">
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="background: ${isFatal ? '#fee2e2' : '#fef3c7'}; color: ${isFatal ? '#991b1b' : '#92400e'}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase;">
              ${hs.severity} Risk Hotspot
            </span>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${hs.name}</div>
          <div style="font-size: 11px; color: #334155; margin-top: 4px;">
            <strong>${hs.historicalAccidentCount}</strong> historical crashes recorded.
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            Cause: ${hs.primaryCause}
          </div>
          <div style="font-size: 11px; color: #0284c7; margin-top: 4px; font-weight: 700;">
            Distance: ${hs.distanceToDriverMeters}m ahead
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectHotspot) onSelectHotspot(hs);
      });

      layer.addLayer(circle);
      layer.addLayer(marker);
    });
  }, [hotspots, onSelectHotspot]);

  // Render Reported Hazards
  useEffect(() => {
    const layer = hazardsLayerGroupRef.current;
    if (!layer) return;

    layer.clearLayers();

    hazards.forEach((haz) => {
      const hazardHtml = `
        <div style="width: 24px; height: 24px; border-radius: 6px; background: #e11d48; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 2L1 21h22L12 2zm0 3.8L19.5 19h-15L12 5.8zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
          </svg>
        </div>
      `;
      const icon = L.divIcon({
        html: hazardHtml,
        className: 'hazard-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([haz.latitude, haz.longitude], { icon });
      marker.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif; max-width: 200px;">
          <div style="font-weight: 700; color: #be123c; font-size: 12px; text-transform: uppercase;">
            Hazard: ${haz.type}
          </div>
          <div style="font-size: 11px; color: #334155; margin-top: 3px;">${haz.description || 'Verified Road Hazard'}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 3px;">Severity: ${haz.severity}</div>
        </div>
      `);
      layer.addLayer(marker);
    });
  }, [hazards]);

  // Render Routes (Current Route vs Safer Alternative Detour)
  useEffect(() => {
    const layer = routesLayerGroupRef.current;
    if (!layer) return;

    layer.clearLayers();

    // 1. Current Route
    if (currentRoute && currentRoute.polyline && currentRoute.polyline.length > 0) {
      const currentPolyline = L.polyline(currentRoute.polyline, {
        color: '#f97316',
        weight: 5,
        opacity: 0.85,
      });
      currentPolyline.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif;">
          <div style="font-weight: 700; color: #ea580c; font-size: 12px;">${currentRoute.name}</div>
          <div style="font-size: 11px; color: #475569;">Risk Score: ${currentRoute.riskScore}/100</div>
          <div style="font-size: 11px; color: #64748b;">Distance: ${currentRoute.distanceKm}km</div>
        </div>
      `);
      layer.addLayer(currentPolyline);
    }

    // 2. Safer Alternative Route
    if (showSaferRoute && saferRoute && saferRoute.polyline && saferRoute.polyline.length > 0) {
      const saferPolyline = L.polyline(saferRoute.polyline, {
        color: '#10b981',
        weight: 6,
        opacity: 0.95,
        dashArray: '6, 8',
      });
      saferPolyline.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif;">
          <div style="font-weight: 800; color: #059669; font-size: 12px;">${saferRoute.name} (Safer Detour)</div>
          <div style="font-size: 11px; color: #047857; font-weight: 700;">Safety Score: ${saferRoute.safetyScore}/100</div>
          <div style="font-size: 11px; color: #475569;">Avoids identified fatal hotspot zones</div>
        </div>
      `);
      layer.addLayer(saferPolyline);
    }
  }, [currentRoute, saferRoute, showSaferRoute]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && location) {
      mapInstanceRef.current.flyTo([location.latitude, location.longitude], 15, { duration: 1 });
    }
  };

  const isHigh = risk?.riskLevel === 'HIGH';
  const isMedium = risk?.riskLevel === 'MEDIUM';

  return (
    <div className="relative w-full h-full min-h-[360px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl flex flex-col">
      {/* Live Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1" />

      {/* Top Floating Visual HUD Warning Bar across the Map */}
      {risk && (
        <div className="absolute top-3 left-3 right-16 z-[400] pointer-events-auto">
          <div
            className={`px-3 py-2 rounded-xl backdrop-blur-md border shadow-xl flex items-center justify-between gap-2 transition-all ${
              isHigh
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-100'
                : isMedium
                ? 'bg-amber-950/90 border-amber-500/60 text-amber-100'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`p-1.5 rounded-lg shrink-0 ${
                  isHigh
                    ? 'bg-rose-600 text-white animate-pulse'
                    : isMedium
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/40">
                    LIVE MAP RADAR
                  </span>
                  <span
                    className={`text-xs font-black uppercase ${
                      isHigh ? 'text-rose-300' : isMedium ? 'text-amber-300' : 'text-emerald-300'
                    }`}
                  >
                    {risk.riskLevel} RISK ZONE
                  </span>
                  <span className="text-[11px] opacity-75 hidden sm:inline">
                    • Safe Speed: &le;{' '}
                    {isHigh
                      ? Math.min(35, Math.round((location?.speed || 60) * 0.55))
                      : location?.speed || 60}{' '}
                    km/h
                  </span>
                </div>
                <div className="text-[11px] text-white/90 truncate font-semibold">
                  {risk.warningMessage}
                </div>
              </div>
            </div>

            {/* Quick Actions inside Map Header */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onPlayVoiceAlert && risk.speechAlert && (
                <button
                  onClick={onPlayVoiceAlert}
                  className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white transition-colors"
                  title="Play Voice Alert"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}

              {onToggleSaferRoute && (
                <button
                  onClick={onToggleSaferRoute}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    showSaferRoute
                      ? 'bg-emerald-600 text-white ring-1 ring-emerald-300'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                  title="Toggle safer bypass route on map"
                >
                  <Route className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    {showSaferRoute ? 'Bypass Visible' : 'Show Detour'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Right Map Controls (Recenter, Map Theme) */}
      <div className="absolute top-16 right-3 z-[400] flex flex-col gap-2">
        <button
          id="btn-map-recenter"
          onClick={handleRecenter}
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95"
          title="Recenter on your vehicle"
        >
          <Locate className="w-4 h-4 text-blue-400" />
        </button>

        {/* Map Theme Selector */}
        <button
          id="btn-map-theme"
          onClick={() => {
            const nextTheme = mapTheme === 'voyager' ? 'dark' : mapTheme === 'dark' ? 'osm' : 'voyager';
            setMapTheme(nextTheme);
          }}
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95 text-[10px] font-bold"
          title={`Switch map view (current: ${mapTheme})`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* GeoAI Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[400] bg-slate-950/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-200 flex flex-wrap items-center gap-3.5 shadow-2xl">
        <div className="flex items-center gap-1.5 font-bold text-white tracking-wide">
          <span>🗺️ GEOAI MAP</span>
        </div>
        <div className="h-3 w-px bg-slate-800 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span>📍</span>
          <span className="text-slate-300">Location</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🔴</span>
          <span className="text-rose-300 font-medium">Hotspots</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🟠</span>
          <span className="text-amber-300 font-medium">Risk Zones</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🚧</span>
          <span className="text-amber-200 font-medium">Hazards</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🛣️</span>
          <span className={showSaferRoute ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
            {showSaferRoute ? 'Safer Route (Active)' : 'Safer Route'}
          </span>
        </div>
      </div>
    </div>
  );
};
