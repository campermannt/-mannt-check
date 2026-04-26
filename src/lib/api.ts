/**
 * API client for mannt-api backend.
 * All requests are authenticated with Bearer token from localStorage.
 */

const API_BASE = 'https://mannt-api.marcintomczyk.workers.dev'
const TOKEN_KEY = 'mannt_auth_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(`${API_BASE}${path}`, { ...init, headers })
}

// ── Vehicles ──────────────────────────────────────────────────

export async function apiGetVehicles(): Promise<any[]> {
  try {
    const res = await apiFetch('/api/vehicles')
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

export async function apiSaveVehicle(vehicle: any): Promise<boolean> {
  try {
    const res = await apiFetch('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    })
    return res.ok
  } catch { return false }
}

export async function apiDeleteVehicle(id: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/vehicles/${id}`, { method: 'DELETE' })
    return res.ok
  } catch { return false }
}

// ── Checklist ─────────────────────────────────────────────────

export async function apiGetChecklist(vehicleId?: string): Promise<any[]> {
  try {
    const qs = vehicleId ? `?vehicle_id=${vehicleId}` : ''
    const res = await apiFetch(`/api/checklist${qs}`)
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

export async function apiSaveChecklistItem(item: any): Promise<boolean> {
  try {
    const res = await apiFetch('/api/checklist', {
      method: 'POST',
      body: JSON.stringify(item),
    })
    return res.ok
  } catch { return false }
}

export async function apiSaveChecklistBatch(items: any[]): Promise<boolean> {
  // Save all items in parallel
  try {
    await Promise.all(items.map(item => apiSaveChecklistItem(item)))
    return true
  } catch { return false }
}

export async function apiDeleteChecklistItem(id: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/checklist/${id}`, { method: 'DELETE' })
    return res.ok
  } catch { return false }
}

// ── Maintenance ───────────────────────────────────────────────

export async function apiGetMaintenance(vehicleId?: string): Promise<any[]> {
  try {
    const qs = vehicleId ? `?vehicle_id=${vehicleId}` : ''
    const res = await apiFetch(`/api/maintenance${qs}`)
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

export async function apiSaveMaintenanceLog(log: any): Promise<boolean> {
  try {
    const res = await apiFetch('/api/maintenance', {
      method: 'POST',
      body: JSON.stringify(log),
    })
    return res.ok
  } catch { return false }
}

export async function apiDeleteMaintenanceLog(id: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/maintenance/${id}`, { method: 'DELETE' })
    return res.ok
  } catch { return false }
}

// ── Full data fetch (for hydration after login) ────────────────

export async function apiGetAllData(): Promise<{ vehicles: any[]; checklist: any[]; maintenance: any[] } | null> {
  try {
    const res = await apiFetch('/api/data')
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

// ── Account deletion (RODO) ────────────────────────────────────

export async function apiDeleteAccount(password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiFetch('/api/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: data.error ?? 'Wystąpił błąd podczas usuwania konta.' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Błąd połączenia z serwerem.' }
  }
}

// ── Service request (zgłoszenie do serwisu) ───────────────────

export async function apiSubmitServiceRequest(data: {
  vehicleLabel: string
  description: string
  phone?: string
  urgent?: boolean
  photos?: Array<{ name: string; type: string; data: string }>
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiFetch('/api/service-request', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) return { ok: false, error: json.error ?? 'Wystąpił błąd podczas wysyłania zgłoszenia.' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Błąd połączenia z serwerem.' }
  }
}

// ── Sync (push local → server when server is empty) ────────────

export async function apiSync(vehicles: any[], checklist: any[], maintenance: any[]): Promise<{ vehicles: any[]; checklist: any[]; maintenance: any[] } | null> {
  try {
    const res = await apiFetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ vehicles, checklist, maintenance }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data ?? null
  } catch { return null }
}
