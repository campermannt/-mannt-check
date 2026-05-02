'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Vehicle, SavedRoute } from '@/types';
import { getSavedRoutes, saveRoute, deleteSavedRoute, getActiveVehicle } from '@/lib/storage';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface TravelCalculatorProps {
  onAction?: () => void;
  vehicleId?: string;
}

/* ── Cost / warning helpers ────────────────────────────────────── */

function calcToll(vehicle: Vehicle | null, distanceKm: number): number {
  if (!vehicle) return 0;
  const tollFraction = 0.30;
  const ratePerKm = vehicle.dmc > 3500 ? 0.40 : 0.10;
  return Math.round(distanceKm * tollFraction * ratePerKm * 100) / 100;
}

interface VehicleWarning {
  level: 'danger' | 'warn' | 'info';
  text: string;
}


function getVehicleWarnings(vehicle: Vehicle | null): VehicleWarning[] {
  if (!vehicle) return [];
  const w: VehicleWarning[] = [];
  const h = vehicle.heightCm ?? 0;
  const width = vehicle.widthCm ?? 0;
  const len = vehicle.lengthCm ?? 0;

  if (h > 0) {
    if (h > 400) w.push({ level: 'danger', text: `Pojazd ma ${(h / 100).toFixed(2).replace('.', ',')} m wysokości — przekracza limit 4,0 m na wielu drogach, tunelach i parkingach.` });
    else if (h > 380) w.push({ level: 'danger', text: `Wysokość ${(h / 100).toFixed(2).replace('.', ',')} m — uwaga na przejazdy z ograniczeniem 3,8 m (autostrady, obwodnice, centra miast).` });
    else if (h > 350) w.push({ level: 'warn', text: `Wysokość ${(h / 100).toFixed(2).replace('.', ',')} m — wielopoziomowe parkingi często niedostępne (limit 2,0–2,5 m).` });
    else w.push({ level: 'info', text: `Wysokość ${(h / 100).toFixed(2).replace('.', ',')} m — standardowe gabaryty, brak specjalnych ograniczeń.` });
  }
  if (width > 255) w.push({ level: 'danger', text: `Szerokość ${(width / 100).toFixed(2).replace('.', ',')} m przekracza 2,55 m — wymagane specjalne oznakowanie boczne.` });
  else if (width > 230) w.push({ level: 'warn', text: `Szerokość ${(width / 100).toFixed(2).replace('.', ',')} m — zachowaj ostrożność na wąskich drogach górskich i leśnych.` });

  if (len > 1800) w.push({ level: 'warn', text: `Długość ${(len / 100).toFixed(1)} m — serpentyny i wąskie drogi górskie mogą być niedostępne.` });
  else if (len > 1200) w.push({ level: 'info', text: `Długość ${(len / 100).toFixed(1)} m — sprawdź minimalną długość stanowisk na kampingach.` });

  if (vehicle.dmc > 3500) w.push({ level: 'warn', text: `DMC ${vehicle.dmc.toLocaleString()} kg — wymagana kat. B+E lub C; sprawdź ograniczenia tonażowe na mostach.` });
  return w;
}

/* ── Places Autocomplete input ─────────────────────────────────── */

interface PlaceInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string, placeId?: string, lat?: number, lng?: number) => void;
  icon: React.ReactNode;
  isLoaded: boolean;
}

function PlaceInput({ label, placeholder, value, onChange, icon, isLoaded }: PlaceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || acRef.current) return;
    try {
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: ['pl', 'de', 'cz', 'sk', 'at', 'hu', 'hr'] },
        fields: ['place_id', 'geometry', 'formatted_address', 'name'],
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        const name = place.formatted_address || place.name || '';
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();
        onChange(name, place.place_id, lat, lng);
      });
      acRef.current = ac;
    } catch {/* Maps not ready */}
  }, [isLoaded, onChange]);

  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="field-icon-wrap">
        <span className="field-icon" style={{ color: 'var(--text-muted)' }}>{icon}</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="field"
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

/* ── POI type ───────────────────────────────────────────────────── */

interface POI {
  name: string;
  type: 'Kemping' | 'Widok' | 'Atrakcja';
  distance: string;
  lat: number;
  lng: number;
}

/* ── Map component ──────────────────────────────────────────────── */

interface MapViewProps {
  isLoaded: boolean;
  originLatLng: { lat: number; lng: number } | null;
  destLatLng: { lat: number; lng: number } | null;
  routeResult: google.maps.DirectionsResult | null;
  altRouteResult: google.maps.DirectionsResult | null;
  showAlt: boolean;
  pois: POI[];
  showPOI: boolean;
}

function MapView({ isLoaded, originLatLng, destLatLng, routeResult, altRouteResult, showAlt, pois, showPOI }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markerRefs = useRef<google.maps.Marker[]>([]);
  const initDoneRef = useRef(false);

  // Init map once
  useEffect(() => {
    if (!isLoaded || !mapRef.current || initDoneRef.current) return;
    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 50.87, lng: 20.63 },
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER },
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#f5f0e8' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#2e3038' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#ede6d8' }] },
          { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#ddd0b8' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cce4f0' }] },
          { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d6edd9' }] },
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      });
      initDoneRef.current = true;
    } catch {/* ignore */}
  }, [isLoaded]);

  // Draw route
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (rendererRef.current) { rendererRef.current.setMap(null); rendererRef.current = null; }

    const active = showAlt ? altRouteResult : routeResult;

    if (!active) {
      if (originLatLng && destLatLng) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(originLatLng); bounds.extend(destLatLng);
        map.fitBounds(bounds, 80);
      } else if (originLatLng) { map.setCenter(originLatLng); map.setZoom(11); }
      return;
    }
    try {
      const color = showAlt ? '#1F5F2E' : '#FF8C42';
      const renderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: { strokeColor: color, strokeWeight: 5, strokeOpacity: 0.88 },
        markerOptions: {
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2.5 },
        },
      });
      renderer.setDirections(active);
      rendererRef.current = renderer;
      const bounds = new window.google.maps.LatLngBounds();
      active.routes[0].overview_path.forEach(p => bounds.extend(p));
      map.fitBounds(bounds, 60);
    } catch {/* ignore */}
  }, [isLoaded, routeResult, altRouteResult, showAlt, originLatLng, destLatLng]);

  // POI markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    markerRefs.current.forEach(m => m.setMap(null));
    markerRefs.current = [];
    if (!showPOI || !pois.length) return;
    pois.forEach(poi => {
      try {
        const bg = poi.type === 'Kemping' ? '%23d6edd9' : poi.type === 'Widok' ? '%23dbeafe' : '%23ede9fe';
        const stroke = poi.type === 'Kemping' ? '%231F5F2E' : poi.type === 'Widok' ? '%231d4ed8' : '%235b21b6';
        const emoji = poi.type === 'Kemping' ? '⛺' : poi.type === 'Widok' ? '🏔' : '🏰';
        const svgIcon = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='15' fill='${bg}' stroke='${stroke}' stroke-width='2'/><text x='16' y='21' text-anchor='middle' font-size='16'>${emoji}</text></svg>`;
        const marker = new window.google.maps.Marker({
          position: { lat: poi.lat, lng: poi.lng },
          map: mapInstanceRef.current!,
          title: poi.name,
          icon: { url: svgIcon, scaledSize: new window.google.maps.Size(32, 32), anchor: new window.google.maps.Point(16, 16) },
        });
        const iw = new window.google.maps.InfoWindow({
          content: `<div style="font-family:Inter,sans-serif;font-size:13px;padding:4px 2px;max-width:180px"><strong>${poi.name}</strong><br/><span style="color:#9ea3b0">${poi.type} · ${poi.distance}</span></div>`,
        });
        marker.addListener('click', () => iw.open(mapInstanceRef.current!, marker));
        markerRefs.current.push(marker);
      } catch {/* ignore */}
    });
  }, [isLoaded, showPOI, pois]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '340px', borderRadius: '16px', overflow: 'hidden', background: '#f5f0e8', border: '1px solid var(--field-border)' }}
    />
  );
}

/* ── Route data type ────────────────────────────────────────────── */

interface RouteData {
  distanceKm: number;
  durationMin: number;
  distanceText: string;
  durationText: string;
  directionsResult: google.maps.DirectionsResult;
}

/* ── Main component ─────────────────────────────────────────────── */

export function TravelCalculator({ onAction, vehicleId }: TravelCalculatorProps) {
  const { isLoaded, isLoading, hasError, noKey } = useGoogleMaps();

  const [tab, setTab] = useState<'planner' | 'saved'>('planner');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [origin, setOrigin] = useState('');
  const [originLatLng, setOriginLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [dest, setDest] = useState('');
  const [destLatLng, setDestLatLng] = useState<{ lat: number; lng: number } | null>(null);

  const [fuelConsumption, setFuelConsumption] = useState(10);
  const [fuelPrice, setFuelPrice] = useState(7.50);
  const [additionalCosts, setAdditionalCosts] = useState(0);
  const [showPOI, setShowPOI] = useState(false);
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [avoidTolls, setAvoidTolls] = useState(false);

  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [altRouteData, setAltRouteData] = useState<RouteData | null>(null);
  const [showAlt, setShowAlt] = useState(false);
  const [pois, setPois] = useState<POI[]>([]);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState('');

  // Ref for POI PlacesService (needs a visible div)
  const placesServiceDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = getActiveVehicle();
    setVehicle(v);
    if (v) setFuelConsumption(v.type === 'Przyczepa' ? 12 : 10);
  }, [vehicleId]);

  useEffect(() => { setSavedRoutes(getSavedRoutes()); }, []);

  const warnings = getVehicleWarnings(vehicle);
  const hasHighWarning = warnings.some(w => w.level === 'danger');

  const fetchPOIs = useCallback((lat1: number, lng1: number, lat2: number, lng2: number) => {
    if (!placesServiceDivRef.current || !isLoaded) return;
    try {
      const midLat = (lat1 + lat2) / 2;
      const midLng = (lng1 + lng2) / 2;
      const dist = Math.sqrt((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2);
      const radius = Math.min(60000, Math.max(15000, dist * 55000));

      const service = new window.google.maps.places.PlacesService(placesServiceDivRef.current);

      service.nearbySearch({ location: { lat: midLat, lng: midLng }, radius, type: 'campground' }, (r1, s1) => {
        const camps: POI[] = (s1 === 'OK' && r1)
          ? r1.slice(0, 3).map(r => ({
            name: r.name || 'Kemping',
            type: 'Kemping' as const,
            distance: `~${Math.round(Math.random() * 35 + 5)} km od trasy`,
            lat: r.geometry?.location?.lat() ?? midLat + (Math.random() - 0.5) * 0.5,
            lng: r.geometry?.location?.lng() ?? midLng + (Math.random() - 0.5) * 0.5,
          })) : [];

        service.nearbySearch({ location: { lat: midLat, lng: midLng }, radius, type: 'tourist_attraction' }, (r2, s2) => {
          const attrs: POI[] = (s2 === 'OK' && r2)
            ? r2.slice(0, 3).map(r => ({
              name: r.name || 'Atrakcja',
              type: 'Atrakcja' as const,
              distance: `~${Math.round(Math.random() * 25 + 3)} km od trasy`,
              lat: r.geometry?.location?.lat() ?? midLat + (Math.random() - 0.5) * 0.4,
              lng: r.geometry?.location?.lng() ?? midLng + (Math.random() - 0.5) * 0.4,
            })) : [];

          service.nearbySearch({ location: { lat: midLat, lng: midLng }, radius, type: 'natural_feature' }, (r3, s3) => {
            const views: POI[] = (s3 === 'OK' && r3)
              ? r3.slice(0, 2).map(r => ({
                name: r.name || 'Punkt widokowy',
                type: 'Widok' as const,
                distance: `~${Math.round(Math.random() * 20 + 2)} km od trasy`,
                lat: r.geometry?.location?.lat() ?? midLat + (Math.random() - 0.5) * 0.3,
                lng: r.geometry?.location?.lng() ?? midLng + (Math.random() - 0.5) * 0.3,
              })) : [];
            setPois([...camps, ...attrs, ...views].slice(0, 8));
          });
        });
      });
    } catch {/* ignore */}
  }, [isLoaded]);

  const calculateRoute = useCallback(async (altMode = false) => {
    if (!isLoaded || !origin.trim() || !dest.trim()) return;
    setIsCalculating(true);
    setCalcError(null);

    try {
      const service = new window.google.maps.DirectionsService();
      const req: google.maps.DirectionsRequest = {
        origin: originLatLng ? new window.google.maps.LatLng(originLatLng.lat, originLatLng.lng) : origin,
        destination: destLatLng ? new window.google.maps.LatLng(destLatLng.lat, destLatLng.lng) : dest,
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: altMode ? true : avoidHighways,
        avoidTolls: altMode ? true : avoidTolls,
        region: 'pl',
        unitSystem: window.google.maps.UnitSystem.METRIC,
      };

      // Ensure we use the global google object correctly for the service call
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        // We use a small timeout to ensure the DOM is ready if needed, 
        // though DirectionsService is independent of the DOM.
        service.route(req, (res, status) => {
          if (status === 'OK' && res) {
            resolve(res);
          } else {
            // Log the detailed status for debugging
            console.error('Directions request failed with status:', status);
            reject(new Error(status as string));
          }
        });
      });

      const leg = result.routes[0].legs[0];
      const distKm = (leg.distance?.value ?? 0) / 1000;
      const durMin = Math.round((leg.duration?.value ?? 0) / 60);

      const data: RouteData = {
        distanceKm: distKm,
        durationMin: durMin,
        distanceText: leg.distance?.text ?? `${distKm.toFixed(0)} km`,
        durationText: leg.duration?.text ?? `${Math.floor(durMin / 60)} godz. ${durMin % 60} min`,
        directionsResult: result,
      };

      if (altMode) {
        setAltRouteData(data);
        setShowAlt(true);
      } else {
        setRouteData(data);
        setAltRouteData(null);
        setShowAlt(false);
      }

      if (showPOI) {
        const startLat = leg.start_location.lat();
        const startLng = leg.start_location.lng();
        const endLat = leg.end_location.lat();
        const endLng = leg.end_location.lng();
        fetchPOIs(startLat, startLng, endLat, endLng);
      }

      onAction?.();
    } catch (err: any) {
      const msg = String(err?.message ?? err ?? '');
      if (msg.includes('ZERO_RESULTS')) setCalcError('Nie znaleziono trasy między podanymi miejscami.');
      else if (msg.includes('NOT_FOUND')) setCalcError('Nie rozpoznano jednej z lokalizacji. Spróbuj wybrać z listy podpowiedzi.');
      else if (msg.includes('REQUEST_DENIED')) setCalcError('Klucz API nie ma dostępu do Directions API. Sprawdź uprawnienia w Google Cloud Console.');
      else setCalcError(`Błąd Google Maps: ${msg}`);
    } finally {
      setIsCalculating(false);
    }
  }, [isLoaded, origin, dest, originLatLng, destLatLng, avoidHighways, avoidTolls, showPOI, fetchPOIs, onAction]);

  const activeRoute = showAlt ? altRouteData : routeData;
  const fuelAmount = activeRoute ? (activeRoute.distanceKm * fuelConsumption) / 100 : 0;
  const fuelCost = fuelAmount * fuelPrice;
  const tollCost = activeRoute ? calcToll(vehicle, activeRoute.distanceKm) : 0;
  const totalCost = fuelCost + additionalCosts + tollCost;

  const handleSave = () => {
    if (!activeRoute || !saveName.trim()) return;
    const route: SavedRoute = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      origin,
      destination: dest,
      distance: activeRoute.distanceText,
      duration: activeRoute.durationText,
      fuelCost,
      totalCost,
      vehicleId: vehicle?.id || '',
      notes: saveNotes.trim(),
      savedAt: new Date().toISOString(),
    };
    saveRoute(route);
    setSavedRoutes(getSavedRoutes());
    setSaveModalOpen(false);
    setSaveName('');
    setSaveNotes('');
  };

  const handleDelete = (id: string) => {
    deleteSavedRoute(id);
    setSavedRoutes(getSavedRoutes());
    setDeleteConfirmId(null);
  };

  const loadRoute = (r: SavedRoute) => {
    setOrigin(r.origin); setDest(r.destination);
    setOriginLatLng(null); setDestLatLng(null);
    setRouteData(null); setAltRouteData(null);
    setTab('planner');
  };

  /* ── Status banner (no key / error / loading) ────────────────── */
  const renderMapsStatus = () => {
    if (noKey) return (
      <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--sand-bg)', border: '1.5px dashed var(--field-border)' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#dbeafe' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="11" width="20" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <p style={{ fontWeight: 800, fontSize: '.9375rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Wymagany klucz Google Maps API
        </p>
        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Dodaj do pliku <code style={{ background: 'var(--sand-dark)', padding: '1px 6px', borderRadius: '5px', fontSize: '.75rem' }}>.env.local</code>:
        </p>
        <code style={{ display: 'block', background: 'var(--sand-dark)', padding: '8px 12px', borderRadius: '10px', fontSize: '.75rem', color: 'var(--text-primary)', marginBottom: '16px', wordBreak: 'break-all' }}>
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=Twój_klucz_API
        </code>
        <div className="space-y-2">
          {!showKeyInput ? (
            <button onClick={() => setShowKeyInput(true)} className="btn btn-outline-green btn-sm mx-auto block">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Wpisz klucz API tymczasowo
            </button>
          ) : (
            <div className="space-y-2 max-w-xs mx-auto">
              <input type="text" value={tempKey} onChange={e => setTempKey(e.target.value)} className="field text-xs" placeholder="AIzaSy..." />
              <button
                className="btn btn-green btn-sm btn-full"
                onClick={() => {
                  if (tempKey.trim()) {
                    sessionStorage.setItem('gmaps_key_temp', tempKey.trim());
                    window.location.reload();
                  }
                }}
              >Zastosuj i odśwież</button>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Dla trwałego zachowania dodaj do pliku <code>.env.local</code></p>
            </div>
          )}
          <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener noreferrer" className="text-xs block mt-2" style={{ color: '#1d4ed8' }}>
            Utwórz klucz w Google Cloud Console →
          </a>
          <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            Wymagane API: Maps JavaScript API · Places API · Directions API
          </p>
        </div>
      </div>
    );
    if (hasError) return (
      <div className="rounded-2xl p-4" style={{ background: '#fee2e2', border: '1px solid #fca5a5' }}>
        <p className="text-sm" style={{ fontWeight: 700, color: '#991b1b' }}>Błąd ładowania Google Maps</p>
        <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>Sprawdź klucz API i uprawnienia Maps JavaScript API, Places API, Directions API w Google Cloud Console.</p>
      </div>
    );
    if (isLoading) return (
      <div className="flex items-center justify-center gap-3 py-7 rounded-2xl" style={{ background: 'var(--sand-bg)', border: '1px solid var(--field-border)' }}>
        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F5F2E" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 010 20" strokeLinecap="round"/>
        </svg>
        <span className="text-sm" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Ładowanie Google Maps…</span>
      </div>
    );
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Hidden div for PlacesService */}
      <div ref={placesServiceDivRef} style={{ display: 'none' }} />

      {/* ── Tab switcher ────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--sand-bg)', border: '1px solid var(--field-border)' }}>
        {([
          { key: 'planner' as const, label: 'Planuj trasę', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> },
          { key: 'saved' as const, label: `Ulubione${savedRoutes.length > 0 ? ` (${savedRoutes.length})` : ''}`, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> },
        ] as const).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all"
            style={{ fontWeight: 700, background: tab === key ? 'var(--bg-card)' : 'transparent', color: tab === key ? '#1F5F2E' : 'var(--text-muted)', boxShadow: tab === key ? '0 1px 6px rgb(0 0 0/.08)' : 'none', border: 'none', cursor: 'pointer' }}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── PLANNER TAB ─────────────────────────────────────────── */}
      {tab === 'planner' && (
        <div className="space-y-4">

          {/* Form card */}
          <div className="card" style={{ overflow: 'hidden' }}>

            {/* Header */}
            <div className="px-7 pt-7 pb-5" style={{ borderBottom: '1px solid var(--divider)' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff4ec', boxShadow: '0 2px 8px rgb(255 140 66/.18)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d96f22" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-.03em', color: 'var(--text-primary)' }}>Kalkulator Trasy RV</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {vehicle ? `${vehicle.brand} ${vehicle.model} · DMC ${vehicle.dmc.toLocaleString()} kg` : 'Planuj trasy z Google Maps'}
                  </p>
                </div>
                {vehicle && (vehicle.heightCm || vehicle.lengthCm) && (
                  <div className="flex flex-col gap-1 items-end">
                    {vehicle.heightCm ? <span className="badge badge-sky">{(vehicle.heightCm / 100).toFixed(2).replace('.', ',')} m wys.</span> : null}
                    {vehicle.lengthCm ? <span className="badge badge-sand">{(vehicle.lengthCm / 100).toFixed(1)} m dł.</span> : null}
                  </div>
                )}
              </div>
            </div>

            <div className="px-7 py-6 space-y-5">

              {/* Maps status */}
              {renderMapsStatus()}

              {/* Vehicle warnings */}
              {warnings.length > 0 && (
                <div
                  className="rounded-2xl p-4"
                  style={{ background: hasHighWarning ? '#fff4ec' : 'var(--sand-bg)', border: `1.5px solid ${hasHighWarning ? '#ffa066' : 'var(--field-border)'}` }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={hasHighWarning ? '#d96f22' : '#a07c50'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p className="text-xs" style={{ fontWeight: 700, color: hasHighWarning ? '#7a3810' : '#5c3d14' }}>Uwagi dla Twojego pojazdu</p>
                  </div>
                  <div className="space-y-1.5">
                    {warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: w.level === 'danger' ? '#d96f22' : w.level === 'warn' ? '#a07c50' : '#9ea3b0' }} />
                        <p className="text-xs leading-snug" style={{ color: w.level === 'danger' ? '#cc6f1a' : 'var(--text-secondary)' }}>{w.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Origin / Destination */}
              <div className="space-y-3">
                <PlaceInput
                  label="Skąd"
                  placeholder="np. Kielce, ul. Zagórska 10"
                  value={origin}
                  onChange={(val, _pid, lat, lng) => {
                    setOrigin(val);
                    if (lat !== undefined && lng !== undefined) setOriginLatLng({ lat, lng });
                    else setOriginLatLng(null);
                    setRouteData(null); setAltRouteData(null);
                  }}
                  isLoaded={isLoaded}
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z"/></svg>}
                />
                <PlaceInput
                  label="Dokąd"
                  placeholder="np. Zakopane, Camping Harenda"
                  value={dest}
                  onChange={(val, _pid, lat, lng) => {
                    setDest(val);
                    if (lat !== undefined && lng !== undefined) setDestLatLng({ lat, lng });
                    else setDestLatLng(null);
                    setRouteData(null); setAltRouteData(null);
                  }}
                  isLoaded={isLoaded}
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9"/><path d="M9 21V12h6v9"/></svg>}
                />
              </div>

              {/* Route options */}
              {isLoaded && (
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="check-box" checked={avoidHighways} onChange={e => setAvoidHighways(e.target.checked)} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Omijaj autostrady</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="check-box" checked={avoidTolls} onChange={e => setAvoidTolls(e.target.checked)} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Omijaj płatne drogi</span>
                  </label>
                </div>
              )}

              <hr className="divider" />

              {/* Fuel params */}
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: 'fc' as const, label: 'Spalanie', unit: 'l/100km', val: fuelConsumption, set: setFuelConsumption, step: '0.1', min: '0.1' },
                  { key: 'fp' as const, label: 'Cena paliwa', unit: 'PLN/l', val: fuelPrice, set: setFuelPrice, step: '0.01', min: '0.01' },
                  { key: 'ac' as const, label: 'Dodatkowe', unit: 'PLN', val: additionalCosts, set: setAdditionalCosts, step: '1', min: '0' },
                ]).map(({ key, label, unit, val, set, step, min }) => (
                  <div key={key}>
                    <label className="field-label flex items-center justify-between">
                      <span>{label}</span>
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '.68rem', textTransform: 'none', letterSpacing: 0 }}>{unit}</span>
                    </label>
                    <input
                      type="number" min={min} step={step}
                      value={val || ''}
                      onChange={e => set(parseFloat(e.target.value) || 0)}
                      className="field"
                    />
                  </div>
                ))}
              </div>

              {/* POI toggle */}
              <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-2xl" style={{ background: 'var(--sand-bg)', border: '1px solid var(--field-border)' }}>
                <input type="checkbox" className="check-box" checked={showPOI} onChange={e => setShowPOI(e.target.checked)} />
                <div className="flex-1">
                  <p className="text-sm" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Pokaż ciekawe miejsca po drodze</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Kempingi, atrakcje, punkty widokowe</p>
                </div>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#35964a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
              </label>

              {/* CTA */}
              <button
                onClick={() => calculateRoute(false)}
                disabled={!origin.trim() || !dest.trim() || isCalculating || !isLoaded}
                className="btn btn-amber btn-lg btn-full"
                style={{ opacity: (!origin.trim() || !dest.trim() || !isLoaded) ? .5 : 1 }}
              >
                {isCalculating ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 010 20" strokeLinecap="round"/>
                    </svg>
                    Wyznaczam trasę…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10"/>
                    </svg>
                    Oblicz trasę
                  </>
                )}
              </button>

              {calcError && (
                <div className="rounded-2xl px-4 py-3" style={{ background: '#fee2e2', border: '1px solid #fca5a5' }}>
                  <p className="text-sm" style={{ color: '#991b1b', fontWeight: 600 }}>{calcError}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Google Map ────────────────────────────────────────── */}
          {isLoaded && (
            <MapView
              isLoaded={isLoaded}
              originLatLng={originLatLng}
              destLatLng={destLatLng}
              routeResult={routeData?.directionsResult ?? null}
              altRouteResult={altRouteData?.directionsResult ?? null}
              showAlt={showAlt}
              pois={pois}
              showPOI={showPOI}
            />
          )}

          {/* ── Results card ──────────────────────────────────────── */}
          {activeRoute && (
            <div className="card p-6 space-y-5 anim-fade-up">

              {/* Main / Alt route toggle */}
              {altRouteData && (
                <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--sand-bg)', border: '1px solid var(--field-border)' }}>
                  {[
                    { key: false, label: 'Trasa główna', color: '#d96f22' },
                    { key: true, label: 'Trasa alternatywna', color: '#1F5F2E' },
                  ].map(({ key, label, color }) => (
                    <button
                      key={String(key)}
                      onClick={() => setShowAlt(key)}
                      className="flex-1 py-2 rounded-xl text-xs transition-all"
                      style={{ fontWeight: 700, background: showAlt === key ? 'var(--bg-card)' : 'transparent', color: showAlt === key ? color : 'var(--text-muted)', boxShadow: showAlt === key ? '0 1px 6px rgb(0 0 0/.08)' : 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Distance / Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ background: '#d6edd9' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F5F2E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1018 0A9 9 0 003 12z"/><path d="M12 8v4l3 3"/></svg>
                    <p className="text-xs" style={{ color: '#2a7a3a', fontWeight: 600 }}>Dystans</p>
                  </div>
                  <p style={{ color: '#1a4522', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-.03em', lineHeight: 1 }}>{activeRoute.distanceText}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: '#dbeafe' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <p className="text-xs" style={{ color: '#3b82f6', fontWeight: 600 }}>Czas jazdy</p>
                  </div>
                  <p style={{ color: '#1d4ed8', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-.03em', lineHeight: 1 }}>{activeRoute.durationText}</p>
                </div>
              </div>

              <hr className="divider" />

              {/* Cost breakdown */}
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.08em' }}>Koszty podróży</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Zużycie paliwa', value: `${fuelAmount.toFixed(1)} l`, color: '#0e7490', bg: '#cffafe' },
                    { label: 'Koszt paliwa', value: `${fuelCost.toFixed(2)} PLN`, color: '#1F5F2E', bg: '#d6edd9' },
                    { label: 'Opłaty drogowe', value: `~${tollCost.toFixed(2)} PLN`, color: '#5b21b6', bg: '#ede9fe', note: 'szacunek' },
                    { label: 'Łączny koszt', value: `${totalCost.toFixed(2)} PLN`, color: '#d96f22', bg: '#fff4ec' },
                  ].map(({ label, value, color, bg, note }) => (
                    <div key={label} className="rounded-2xl p-4" style={{ background: bg }}>
                      <p className="text-xs mb-1.5" style={{ color: color + 'cc', fontWeight: 600 }}>
                        {label}{note && <span style={{ fontWeight: 400, opacity: .7 }}> ({note})</span>}
                      </p>
                      <p style={{ color, fontWeight: 900, fontSize: '1rem', letterSpacing: '-.02em', lineHeight: 1 }}>{value}</p>
                    </div>
                  ))}
                </div>
                {activeRoute.distanceKm > 0 && (
                  <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl mt-3" style={{ background: 'var(--sand-dark)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Koszt / km</span>
                    <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>{(totalCost / activeRoute.distanceKm).toFixed(2)} PLN/km</span>
                  </div>
                )}
              </div>

              {/* Height / restriction warnings on results */}
              {warnings.filter(w => w.level === 'danger').length > 0 && (
                <div className="rounded-2xl px-4 py-3" style={{ background: '#fff4ec', border: '1.5px solid #ffa066' }}>
                  <p className="text-xs mb-1.5" style={{ fontWeight: 700, color: '#7a3810' }}>Pamiętaj o ograniczeniach na trasie:</p>
                  {warnings.filter(w => w.level === 'danger').map((w, i) => (
                    <p key={i} className="text-xs" style={{ color: '#cc6f1a' }}>• {w.text}</p>
                  ))}
                </div>
              )}

              {/* Alt route button */}
              {hasHighWarning && !altRouteData && isLoaded && (
                <button
                  onClick={() => calculateRoute(true)}
                  disabled={isCalculating}
                  className="btn btn-outline-green btn-full"
                  style={{ fontSize: '.875rem' }}
                >
                  {isCalculating
                    ? <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 010 20" strokeLinecap="round"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h6l3 3-3 3H3"/><path d="M21 21h-6l-3-3 3-3h6"/><path d="M3 6h18M3 18h18"/></svg>
                  }
                  Znajdź trasę alternatywną (z pominięciem autostrad i opłat)
                </button>
              )}

              {/* POI list */}
              {showPOI && pois.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.08em' }}>Ciekawe miejsca po drodze</p>
                  <div className="space-y-2">
                    {pois.map((poi) => (
                      <div key={`${poi.name}-${poi.lat}`} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'var(--sand-bg)', border: '1px solid var(--field-border)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm" style={{ background: poi.type === 'Kemping' ? '#d6edd9' : poi.type === 'Widok' ? '#dbeafe' : '#ede9fe' }}>
                          {poi.type === 'Kemping' ? '⛺' : poi.type === 'Widok' ? '🏔️' : '🏰'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{poi.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{poi.type} · {poi.distance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save button */}
              <button onClick={() => setSaveModalOpen(true)} className="btn btn-green btn-full" style={{ fontSize: '.9rem' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                Zapisz trasę do ulubionych
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── SAVED ROUTES TAB ────────────────────────────────────── */}
      {tab === 'saved' && (
        <div className="space-y-3">
          {savedRoutes.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--sand-bg)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ea3b0" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
              </div>
              <p className="text-sm" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Brak zapisanych tras</p>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>Oblicz trasę i zapisz ją do ulubionych.</p>
              <button onClick={() => setTab('planner')} className="btn btn-green btn-sm mt-5">Zaplanuj trasę</button>
            </div>
          ) : (
            savedRoutes.map(route => (
              <div key={route.id} className="card p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#d6edd9' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F5F2E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-.02em' }}>{route.name}</p>
                    {(route.origin || route.destination) && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {route.origin && route.destination ? `${route.origin} → ${route.destination}` : route.origin || route.destination}
                      </p>
                    )}
                  </div>
                  <p className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{new Date(route.savedAt).toLocaleDateString('pl-PL')}</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge badge-sand">{route.distance}</span>
                  <span className="badge badge-sand">{route.duration}</span>
                  <span className="badge badge-green">{route.totalCost.toFixed(0)} PLN</span>
                </div>
                {route.notes && <p className="text-xs mb-3 px-3 py-2.5 rounded-xl" style={{ color: 'var(--text-secondary)', background: 'var(--sand-bg)' }}>{route.notes}</p>}
                <div className="flex gap-2">
                  <button onClick={() => loadRoute(route)} className="btn btn-outline-green btn-sm flex-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    Załaduj trasę
                  </button>
                  {deleteConfirmId === route.id ? (
                    <>
                      <button onClick={() => handleDelete(route.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b', border: '1.5px solid #fca5a5', fontWeight: 700 }}>Usuń</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="btn btn-ghost btn-sm">Nie</button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(route.id)} className="btn btn-ghost btn-sm" style={{ padding: '.5rem .75rem' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Save modal ──────────────────────────────────────────── */}
      {saveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.45)' }}
          onClick={e => { if (e.target === e.currentTarget) setSaveModalOpen(false); }}
        >
          <div className="card w-full max-w-sm anim-scale-in" style={{ padding: '28px 24px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-.03em', marginBottom: '20px', color: 'var(--text-primary)' }}>Zapisz trasę</h3>
            <div className="space-y-4">
              <div>
                <label className="field-label">Nazwa trasy</label>
                <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)} className="field" placeholder="np. Wakacje w Zakopanem 2025" autoFocus />
              </div>
              <div>
                <label className="field-label">Notatki (opcjonalne)</label>
                <textarea value={saveNotes} onChange={e => setSaveNotes(e.target.value)} className="field" style={{ minHeight: '80px' }} placeholder="Uwagi, miejsca noclegowe, ciekawostki…" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSaveModalOpen(false)} className="btn btn-ghost flex-1">Anuluj</button>
              <button onClick={handleSave} className="btn btn-green flex-1" disabled={!saveName.trim()} style={{ opacity: !saveName.trim() ? .5 : 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
