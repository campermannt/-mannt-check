import type { Vehicle, ChecklistItem, MaintenanceLog, SavedRoute } from '@/types';
import {
  apiGetVehicles, apiSaveVehicle, apiDeleteVehicle,
  apiGetChecklist, apiSaveChecklistItem, apiSaveChecklistBatch, apiDeleteChecklistItem,
  apiGetMaintenance, apiSaveMaintenanceLog,
  getToken,
} from './api';

const STORAGE_KEYS = {
  VEHICLE: 'mannt_vehicle',
  VEHICLES: 'mannt_vehicles',
  ACTIVE_VEHICLE_ID: 'mannt_active_vehicle_id',
  CHECKLIST: 'mannt_checklist',
  CHECKLIST_PREFIX: 'mannt_checklist_',
  MAINTENANCE: 'mannt_maintenance',
  MAINTENANCE_PREFIX: 'mannt_maintenance_',
  SAVED_ROUTES: 'mannt_saved_routes',
  ONBOARDING: 'mannt_onboarding_completed',
  ACTION_COUNT: 'mannt_action_count',
  INSTALL_SHOWN: 'mannt_install_shown'
} as const;

/* ── Helpers ────────────────────────────────────────────────── */

function isLoggedIn(): boolean {
  return !!getToken()
}

/* ── Multi-vehicle ─────────────────────────────────────────────── */

// Synchronous: reads from localStorage cache
export const getVehicles = (): Vehicle[] => {
  const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
  if (data) return JSON.parse(data);
  // Migrate legacy single-vehicle storage
  const legacy = localStorage.getItem(STORAGE_KEYS.VEHICLE);
  if (legacy) {
    const v: Vehicle = JSON.parse(legacy);
    const vehicles = [v];
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE_ID, v.id);
    return vehicles;
  }
  return [];
};

// Async: fetches from server and updates local cache
export const fetchAndCacheVehicles = async (): Promise<Vehicle[]> => {
  if (!isLoggedIn()) return getVehicles()
  const vehicles = await apiGetVehicles()
  if (vehicles.length > 0) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles))
    // Ensure active vehicle ID is set
    const activeId = getActiveVehicleId()
    if (!activeId || !vehicles.find((v: Vehicle) => v.id === activeId)) {
      setActiveVehicleId(vehicles[0].id)
    }
  }
  return vehicles.length > 0 ? vehicles : getVehicles()
}

export const saveVehicles = (vehicles: Vehicle[]) => {
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
};

export const addVehicle = async (vehicle: Vehicle): Promise<void> => {
  // Optimistic local update
  const vehicles = getVehicles();
  vehicles.push(vehicle);
  saveVehicles(vehicles);
  setActiveVehicleId(vehicle.id);
  // Persist to server
  if (isLoggedIn()) {
    await apiSaveVehicle(vehicle)
  }
};

export const updateVehicle = async (vehicle: Vehicle): Promise<void> => {
  const vehicles = getVehicles();
  const idx = vehicles.findIndex(v => v.id === vehicle.id);
  if (idx !== -1) {
    vehicles[idx] = vehicle;
    saveVehicles(vehicles);
  }
  if (isLoggedIn()) {
    await apiSaveVehicle(vehicle)
  }
};

export const removeVehicle = async (vehicleId: string): Promise<void> => {
  let vehicles = getVehicles();
  vehicles = vehicles.filter(v => v.id !== vehicleId);
  saveVehicles(vehicles);
  // Clear per-vehicle data from localStorage
  localStorage.removeItem(`${STORAGE_KEYS.CHECKLIST_PREFIX}${vehicleId}`);
  localStorage.removeItem(`${STORAGE_KEYS.MAINTENANCE_PREFIX}${vehicleId}`);
  // If removed vehicle was active, set first remaining as active
  const activeId = getActiveVehicleId();
  if (activeId === vehicleId && vehicles.length > 0) {
    setActiveVehicleId(vehicles[0].id);
  }
  if (isLoggedIn()) {
    await apiDeleteVehicle(vehicleId)
  }
};

export const getActiveVehicleId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_VEHICLE_ID);
};

export const setActiveVehicleId = (id: string) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE_ID, id);
};

export const getActiveVehicle = (): Vehicle | null => {
  const vehicles = getVehicles();
  if (vehicles.length === 0) return null;
  const activeId = getActiveVehicleId();
  return vehicles.find(v => v.id === activeId) ?? vehicles[0];
};

/* ── Legacy single-vehicle (kept for compat) ───────────────────── */

export const saveVehicle = async (vehicle: Vehicle): Promise<void> => {
  const vehicles = getVehicles();
  const idx = vehicles.findIndex(v => v.id === vehicle.id);
  if (idx !== -1) {
    vehicles[idx] = vehicle;
    saveVehicles(vehicles);
  } else {
    await addVehicle(vehicle);
    return;
  }
  setActiveVehicleId(vehicle.id);
  if (isLoggedIn()) {
    await apiSaveVehicle(vehicle)
  }
};

export const getVehicle = (): Vehicle | null => {
  return getActiveVehicle();
};

/* ── Per-vehicle checklist ─────────────────────────────────────── */

// Synchronous: reads from localStorage cache
export const getChecklist = (vehicleId?: string): ChecklistItem[] => {
  if (vehicleId) {
    const data = localStorage.getItem(`${STORAGE_KEYS.CHECKLIST_PREFIX}${vehicleId}`);
    if (data) return JSON.parse(data);
    const legacy = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
    return legacy ? JSON.parse(legacy) : [];
  }
  const data = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
  return data ? JSON.parse(data) : [];
};

// Async: fetches from server and updates local cache
export const fetchAndCacheChecklist = async (vehicleId?: string): Promise<ChecklistItem[]> => {
  if (!isLoggedIn()) return getChecklist(vehicleId)
  const items = await apiGetChecklist(vehicleId)
  if (items.length > 0) {
    const key = vehicleId
      ? `${STORAGE_KEYS.CHECKLIST_PREFIX}${vehicleId}`
      : STORAGE_KEYS.CHECKLIST
    localStorage.setItem(key, JSON.stringify(items))
    return items
  }
  return getChecklist(vehicleId)
}

export const saveChecklist = async (items: ChecklistItem[], vehicleId?: string): Promise<void> => {
  const key = vehicleId
    ? `${STORAGE_KEYS.CHECKLIST_PREFIX}${vehicleId}`
    : STORAGE_KEYS.CHECKLIST;
  localStorage.setItem(key, JSON.stringify(items));
  if (isLoggedIn()) {
    // Save all items to server (batch)
    const itemsWithVehicle = items.map(i => ({ ...i, vehicle_id: vehicleId ?? i.category }))
    await apiSaveChecklistBatch(itemsWithVehicle)
  }
};

export const saveChecklistSync = (items: ChecklistItem[], vehicleId?: string): void => {
  const key = vehicleId
    ? `${STORAGE_KEYS.CHECKLIST_PREFIX}${vehicleId}`
    : STORAGE_KEYS.CHECKLIST;
  localStorage.setItem(key, JSON.stringify(items));
};

/* ── Per-vehicle maintenance log ───────────────────────────────── */

// Synchronous: reads from localStorage cache
export const getMaintenanceLogs = (vehicleId?: string): MaintenanceLog[] => {
  if (vehicleId) {
    const data = localStorage.getItem(`${STORAGE_KEYS.MAINTENANCE_PREFIX}${vehicleId}`);
    if (data) return JSON.parse(data);
    const legacy = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    return legacy ? JSON.parse(legacy) : [];
  }
  const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
  return data ? JSON.parse(data) : [];
};

// Async: fetches from server and updates local cache
export const fetchAndCacheMaintenance = async (vehicleId?: string): Promise<MaintenanceLog[]> => {
  if (!isLoggedIn()) return getMaintenanceLogs(vehicleId)
  const logs = await apiGetMaintenance(vehicleId)
  if (logs.length > 0) {
    const key = vehicleId
      ? `${STORAGE_KEYS.MAINTENANCE_PREFIX}${vehicleId}`
      : STORAGE_KEYS.MAINTENANCE
    localStorage.setItem(key, JSON.stringify(logs))
    return logs
  }
  return getMaintenanceLogs(vehicleId)
}

export const saveMaintenanceLog = (logs: MaintenanceLog[], vehicleId?: string) => {
  const key = vehicleId
    ? `${STORAGE_KEYS.MAINTENANCE_PREFIX}${vehicleId}`
    : STORAGE_KEYS.MAINTENANCE;
  localStorage.setItem(key, JSON.stringify(logs));
};

export const addMaintenanceLog = async (log: MaintenanceLog): Promise<void> => {
  const logs = getMaintenanceLogs(log.vehicleId);
  logs.unshift(log);
  saveMaintenanceLog(logs, log.vehicleId);
  if (isLoggedIn()) {
    await apiSaveMaintenanceLog({ ...log, vehicle_id: log.vehicleId })
  }
};

/* ── Hydrate cache from server (call after login) ──────────────── */

export const hydrateFromServer = async (): Promise<void> => {
  if (!isLoggedIn()) return

  try {
    // Fetch vehicles
    const vehicles = await apiGetVehicles()
    if (vehicles.length > 0) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles))
      const activeId = getActiveVehicleId()
      if (!activeId || !vehicles.find((v: Vehicle) => v.id === activeId)) {
        setActiveVehicleId(vehicles[0].id)
      }

      // Fetch checklists and maintenance for each vehicle
      for (const v of vehicles) {
        const checklist = await apiGetChecklist(v.id)
        if (checklist.length > 0) {
          localStorage.setItem(`${STORAGE_KEYS.CHECKLIST_PREFIX}${v.id}`, JSON.stringify(checklist))
        }
        const maintenance = await apiGetMaintenance(v.id)
        if (maintenance.length > 0) {
          localStorage.setItem(`${STORAGE_KEYS.MAINTENANCE_PREFIX}${v.id}`, JSON.stringify(maintenance))
        }
      }
    }
  } catch {
    // Hydration errors are non-fatal — app will use cached data
  }
}

/* ── Clear all user data (on logout / account switch) ─────────── */

export const clearAllAppData = (): void => {
  // Preserve UI settings that are not user-specific
  const dark = localStorage.getItem('mannt-dark')
  const onboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING)
  const installShown = localStorage.getItem(STORAGE_KEYS.INSTALL_SHOWN)

  // Wipe everything
  localStorage.clear()

  // Restore UI settings
  if (dark !== null) localStorage.setItem('mannt-dark', dark)
  if (onboarding !== null) localStorage.setItem(STORAGE_KEYS.ONBOARDING, onboarding)
  if (installShown !== null) localStorage.setItem(STORAGE_KEYS.INSTALL_SHOWN, installShown)
}

/* ── Onboarding ────────────────────────────────────────────────── */

export const setOnboardingCompleted = () => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
};

export const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING) === 'true';
};

/* ── PWA helpers ───────────────────────────────────────────────── */

export const incrementActionCount = (): number => {
  const count = getActionCount() + 1;
  localStorage.setItem(STORAGE_KEYS.ACTION_COUNT, count.toString());
  return count;
};

export const getActionCount = (): number => {
  const count = localStorage.getItem(STORAGE_KEYS.ACTION_COUNT);
  return count ? parseInt(count, 10) : 0;
};

export const setInstallShown = () => {
  localStorage.setItem(STORAGE_KEYS.INSTALL_SHOWN, 'true');
};

export const wasInstallShown = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.INSTALL_SHOWN) === 'true';
};

/* ── Saved routes ──────────────────────────────────────────────── */

export const getSavedRoutes = (): SavedRoute[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SAVED_ROUTES);
  return data ? JSON.parse(data) : [];
};

export const saveRoute = (route: SavedRoute) => {
  const routes = getSavedRoutes();
  routes.unshift(route);
  localStorage.setItem(STORAGE_KEYS.SAVED_ROUTES, JSON.stringify(routes));
};

export const deleteSavedRoute = (id: string) => {
  const routes = getSavedRoutes().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.SAVED_ROUTES, JSON.stringify(routes));
};
