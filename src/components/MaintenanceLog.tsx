'use client';

import { useState, useEffect, useRef } from 'react';
import type { MaintenanceLog, MaintenanceCategory, Vehicle } from '@/types';
import { MAINTENANCE_CATEGORIES } from '@/types';
import { fetchAndCacheMaintenance, addMaintenanceLog, getVehicles, updateVehicle } from '@/lib/storage';
import { apiSubmitServiceRequest } from '@/lib/api';

const CAT_META: Record<string, { icon: string; bg: string; color: string }> = {
  'Silnik i podwozie':                     { icon: '⚙️', bg: '#f3f4f6', color: '#374151' },
  'Szczelność zabudowy':                    { icon: '🏠', bg: '#ede6d8', color: '#5c3d14' },
  'Instalacja elektryczna i fotowoltaika':  { icon: '⚡', bg: '#d6edd9', color: '#1a4522' },
  'Ogrzewanie i gaz':                       { icon: '🔥', bg: '#fee2e2', color: '#991b1b' },
  'Układ wodny i sanitarny':                { icon: '💧', bg: '#cffafe', color: '#0e7490' },
  'Akcesoria (markizy, bagażniki)':         { icon: '🧳', bg: '#ede9fe', color: '#5b21b6' },
};

interface MaintenanceLogProps {
  userId: string;
  vehicleId: string;
  onAction?: () => void;
}

interface PhotoItem {
  id: string;
  name: string;
  type: string;
  data: string; // base64
  preview: string; // object URL
}

/* ── Service request modal ──────────────────────────────────── */
function ServiceRequestModal({
  log,
  vehicle,
  onClose,
  onSent,
}: {
  log: MaintenanceLog;
  vehicle: Vehicle | null;
  onClose: () => void;
  onSent: () => void;
}) {
  const vehicleBrandModel = vehicle ? `${vehicle.brand} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ''}` : '';
  const vehicleReg = vehicle?.registrationNumber ?? '';

  const defaultDesc = log.description;

  const [description, setDescription] = useState(defaultDesc);
  const [phone, setPhone] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  // vehicleInfo used for sending
  const vehicleInfo = [vehicleBrandModel, vehicleReg].filter(Boolean).join(' · ');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => { photos.forEach(p => URL.revokeObjectURL(p.preview)); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const MAX_PHOTOS = 3;

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const comma = result.indexOf(',');
        const base64 = comma >= 0 ? result.slice(comma + 1) : result;
        setPhotos(prev => {
          if (prev.length >= MAX_PHOTOS) return prev;
          return [...prev, {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            data: base64,
            preview: URL.createObjectURL(file),
          }];
        });
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-added after removal
    e.target.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const p = prev.find(x => x.id === id);
      if (p) URL.revokeObjectURL(p.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { setError('Opis jest wymagany.'); return; }
    setBusy(true);
    setError(null);

    const result = await apiSubmitServiceRequest({
      vehicleLabel: vehicleInfo,
      description,
      phone: phone.trim() || undefined,
      urgent,
      photos: photos.map(p => ({ name: p.name, type: p.type, data: p.data })),
    });

    if (!result.ok) {
      setError(result.error ?? 'Nie udało się wysłać zgłoszenia.');
      setBusy(false);
      return;
    }
    setSent(true);
    onSent();
    setBusy(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="anim-scale-in"
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          background: 'var(--bg-card, #fff)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,.35)',
          overflow: 'hidden',
        }}
      >
        {sent ? (
          /* ── Success ── */
          <div className="flex flex-col items-center justify-center text-center p-10" style={{ flex: 1 }}>
            <div
              style={{
                width: 80, height: 80,
                borderRadius: 28,
                background: 'linear-gradient(135deg, #d6edd9, #a8d5b5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a4522" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h3 style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary, #111)', letterSpacing: '-.03em', marginBottom: 10 }}>
              Zgłoszenie wysłane!
            </h3>
            <p style={{ color: 'var(--text-muted, #6b7280)', fontSize: '.9375rem', lineHeight: 1.6, maxWidth: 320, marginBottom: 32 }}>
              Zgłoszenie zostało wysłane do Camper Mannt. Skontaktujemy się z Tobą wkrótce.
            </p>
            <button onClick={onClose} className="btn btn-green" style={{ minWidth: 200, fontSize: '1rem', padding: '14px 32px' }}>
              Zamknij
            </button>
          </div>
        ) : (
          <>
            {/* ── Sticky header ── */}
            <div
              style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid var(--border, #e5e7eb)',
                flexShrink: 0,
                background: 'var(--bg-card, #fff)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  style={{
                    width: 48, height: 48,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #d6edd9, #a8d5b5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1F5F2E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontWeight: 900, fontSize: '1.0625rem', color: 'var(--text-primary, #111)', letterSpacing: '-.03em', lineHeight: 1.2 }}>
                    Zgłoszenie do serwisu
                  </h3>
                  <p style={{ fontSize: '.8125rem', color: 'var(--text-muted, #6b7280)', marginTop: 3 }}>
                    Camper Mannt Kielce · camper@mannt.pl
                  </p>
                </div>
                {/* Close button */}
                <button
                  onClick={onClose}
                  aria-label="Zamknij"
                  style={{
                    width: 40, height: 40,
                    borderRadius: 12,
                    background: 'var(--bg-secondary, #f3f4f6)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--text-muted, #6b7280)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Scrollable form body ── */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 20px 0' }}>
              <form id="service-form" onSubmit={handleSubmit} className="space-y-5">

                {/* Vehicle info — readonly */}
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '.8125rem', color: 'var(--text-muted, #6b7280)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    Marka i model pojazdu
                  </label>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f0fdf4, #e6f4ea)',
                      border: '1.5px solid #a8d5b5',
                      borderRadius: 14,
                      padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>🚐</span>
                    <span style={{ fontWeight: 700, color: '#1a4522', fontSize: '.9375rem', lineHeight: 1.3 }}>
                      {vehicleBrandModel || '—'}
                    </span>
                  </div>
                </div>

                {/* Registration — readonly */}
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '.8125rem', color: 'var(--text-muted, #6b7280)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    Numer rejestracyjny
                  </label>
                  <div
                    style={{
                      background: 'var(--bg-secondary, #f9fafb)',
                      border: '1.5px solid var(--border, #e5e7eb)',
                      borderRadius: 14,
                      padding: '14px 16px',
                      fontSize: '.9375rem',
                      fontWeight: 600,
                      color: vehicleReg ? 'var(--text-primary, #111)' : 'var(--text-muted, #9ca3af)',
                      letterSpacing: vehicleReg ? '.08em' : undefined,
                    }}
                  >
                    {vehicleReg || 'Brak numeru rejestracyjnego'}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="svc-desc"
                    style={{ display: 'block', fontWeight: 700, fontSize: '.8125rem', color: 'var(--text-muted, #6b7280)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}
                  >
                    Opis usterki / co trzeba naprawić
                  </label>
                  <textarea
                    id="svc-desc"
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="field"
                    style={{ minHeight: 140, resize: 'vertical', fontSize: '.9375rem', lineHeight: 1.6 }}
                    placeholder="Opisz dokładnie co się dzieje, kiedy problem wystąpił, jakie objawy itp…"
                  />
                </div>

                {/* Photos */}
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '.8125rem', color: 'var(--text-muted, #6b7280)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    Zdjęcia
                    <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6 }}>(opcjonalnie, maks. {MAX_PHOTOS})</span>
                  </label>

                  {/* Photo grid */}
                  {photos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                      {photos.map(p => (
                        <div key={p.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e5e7eb' }}>
                          <img
                            src={p.preview}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(p.id)}
                            style={{
                              position: 'absolute', top: 4, right: 4,
                              width: 26, height: 26,
                              borderRadius: '50%',
                              background: 'rgba(0,0,0,.65)',
                              border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff',
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                              <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length < MAX_PHOTOS && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handlePhotoAdd}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: '100%',
                          padding: '14px',
                          border: '2px dashed #a8d5b5',
                          borderRadius: 14,
                          background: '#f0fdf4',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          color: '#1a4522', fontWeight: 600, fontSize: '.9375rem',
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="3"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                        {photos.length === 0 ? 'Dodaj zdjęcia z galerii' : `Dodaj więcej (${MAX_PHOTOS - photos.length} pozostało)`}
                      </button>
                    </>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="svc-phone"
                    style={{ display: 'block', fontWeight: 700, fontSize: '.8125rem', color: 'var(--text-muted, #6b7280)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}
                  >
                    Telefon kontaktowy
                    <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6 }}>(opcjonalnie)</span>
                  </label>
                  <input
                    id="svc-phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="field"
                    style={{ fontSize: '1rem' }}
                    placeholder="np. 500 100 200"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>

                {/* Urgent checkbox */}
                <div>
                  <label
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '16px 18px',
                      borderRadius: 16,
                      background: urgent ? '#fef2f2' : 'var(--bg-secondary, #f9fafb)',
                      border: `2px solid ${urgent ? '#fca5a5' : 'var(--border, #e5e7eb)'}`,
                      cursor: 'pointer',
                      transition: 'all .2s',
                    }}
                  >
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: urgent ? '#b91c1c' : 'var(--bg-card, #fff)',
                        border: `2px solid ${urgent ? '#b91c1c' : '#d1d5db'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .15s',
                      }}
                    >
                      {urgent && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={urgent}
                      onChange={e => setUrgent(e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '.9375rem', color: urgent ? '#b91c1c' : 'var(--text-primary, #111)', margin: 0 }}>
                        🚨 Pilne — potrzebuję szybkiej pomocy
                      </p>
                      <p style={{ fontSize: '.8125rem', color: 'var(--text-muted, #6b7280)', margin: '2px 0 0' }}>
                        Priorytetowe zgłoszenie trafi na górę kolejki
                      </p>
                    </div>
                  </label>
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', color: '#b91c1c', fontWeight: 600, fontSize: '.875rem', textAlign: 'center' }}>
                    {error}
                  </div>
                )}

              </form>
            </div>

            {/* ── Sticky footer with buttons ── */}
            <div
              style={{
                padding: '16px 20px 24px',
                borderTop: '1px solid var(--border, #e5e7eb)',
                flexShrink: 0,
                background: 'var(--bg-card, #fff)',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}
            >
              <button
                type="submit"
                form="service-form"
                disabled={busy}
                className="btn btn-green btn-full"
                style={{ fontSize: '1rem', padding: '16px', opacity: busy ? .7 : 1, fontWeight: 800 }}
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="10" strokeOpacity=".3"/>
                      <path d="M12 2a10 10 0 010 20" strokeLinecap="round"/>
                    </svg>
                    Wysyłanie…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
                    </svg>
                    Wyślij zgłoszenie do serwisu
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-full"
                style={{ fontSize: '.9375rem', padding: '14px', fontWeight: 600 }}
              >
                Anuluj
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export function MaintenanceLogComponent({ userId, vehicleId, onAction }: MaintenanceLogProps) {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [serviceModalLog, setServiceModalLog] = useState<MaintenanceLog | null>(null);
  const [formData, setFormData] = useState({
    category: MAINTENANCE_CATEGORIES[0] as MaintenanceCategory,
    description: '',
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    cost: ''
  });

  const vehicle: Vehicle | null = vehicleId
    ? (getVehicles().find(v => v.id === vehicleId) ?? null)
    : null;

  useEffect(() => { fetchAndCacheMaintenance(vehicleId).then(setLogs); }, [vehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: MaintenanceLog = {
      id: crypto.randomUUID(),
      userId, vehicleId,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      reportedToMannt: false,
      createdAt: new Date().toISOString()
    };
    await addMaintenanceLog(newLog);

    if (newLog.mileage && vehicleId) {
      const vehicles = getVehicles();
      const v = vehicles.find(vv => vv.id === vehicleId);
      if (v && newLog.mileage > v.mileage) {
        await updateVehicle({ ...v, mileage: newLog.mileage, updatedAt: new Date().toISOString() });
      }
    }

    setLogs([newLog, ...logs]);
    setShowForm(false);
    setFormData({
      category: MAINTENANCE_CATEGORIES[0],
      description: '',
      date: new Date().toISOString().split('T')[0],
      mileage: '', cost: ''
    });
    onAction?.();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Add button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className={`btn btn-full btn-lg ${showForm ? 'btn-ghost' : 'btn-green'}`}
      >
        {showForm ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Anuluj
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Dodaj wpis serwisowy
          </>
        )}
      </button>

      {/* Add form */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d6edd9, #a8d5b5)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F5F2E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[#1a4522]" style={{ fontWeight: 800, letterSpacing: '-.02em' }}>Nowy wpis serwisowy</h3>
              <p className="text-xs mt-0.5" style={{ color: '#9ea3b0' }}>Zapisz wykonaną czynność lub usterkę</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label">Kategoria</label>
              <select
                value={formData.category}
                onChange={e => setFormData(p => ({ ...p, category: e.target.value as MaintenanceCategory }))}
                className="field"
              >
                {MAINTENANCE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{CAT_META[cat]?.icon} {cat}</option>
                ))}
              </select>
            </div>

                <div>
                  <label className="field-label">Opis</label>
                  <textarea
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="field"
                    style={{ minHeight: '96px' }}
                    placeholder="Opisz problem lub usługę, której potrzebujesz…"
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="field-label">Zdjęcia (max {MAX_PHOTOS})</label>
                  <div className="flex flex-wrap gap-3">
                    {photos.map(photo => (
                      <div key={photo.id} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                        <img src={photo.preview} alt={photo.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                    {photos.length < MAX_PHOTOS && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handlePhotoAdd}
                    style={{ display: 'none' }}
                  />
                </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="field-label">Data</label>
                <input type="date" required value={formData.date}
                  onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                  className="field" />
              </div>
              <div>
                <label className="field-label">Przebieg (km)</label>
                <input type="number" value={formData.mileage}
                  onChange={e => setFormData(p => ({ ...p, mileage: e.target.value }))}
                  className="field" placeholder="opcja" />
              </div>
              <div>
                <label className="field-label">Koszt (PLN)</label>
                <input type="number" step="0.01" value={formData.cost}
                  onChange={e => setFormData(p => ({ ...p, cost: e.target.value }))}
                  className="field" placeholder="opcja" />
              </div>
            </div>

            <hr className="divider" />
            <button type="submit" className="btn btn-green btn-full">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v13a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
              Zapisz wpis
            </button>
          </form>
        </div>
      )}

      {/* Empty state */}
      {logs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: '#F5F0E8' }}>
            📋
          </div>
          <p className="text-sm" style={{ fontWeight: 700, color: '#2e3038' }}>Brak wpisów serwisowych</p>
          <p className="text-xs mt-1.5" style={{ color: '#9ea3b0' }}>Dodaj pierwszy wpis klikając przycisk powyżej.</p>
        </div>
      ) : (
        logs.map(log => {
          const meta = CAT_META[log.category] || { icon: '🔧', bg: '#F5F0E8', color: '#111318' };
          return (
            <div key={log.id} className="card p-5">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: meta.bg }}
                >
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className="badge badge-sand text-xs mb-1.5 block w-fit"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {log.category}
                  </span>
                  <p className="text-sm leading-snug" style={{ color: '#2e3038' }}>{log.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-xs mb-4" style={{ paddingLeft: '3.75rem', color: '#9ea3b0' }}>
                <span className="flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  {new Date(log.date).toLocaleDateString('pl-PL')}
                </span>
                {log.mileage && (
                  <span className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                    {log.mileage.toLocaleString()} km
                  </span>
                )}
                {log.cost && (
                  <span className="flex items-center gap-1.5" style={{ fontWeight: 700, color: '#d96f22' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
                    </svg>
                    {log.cost.toFixed(2)} PLN
                  </span>
                )}
              </div>

              {/* CTA */}
              {!log.reportedToMannt ? (
                <button
                  onClick={() => setServiceModalLog(log)}
                  className="btn btn-amber btn-full btn-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                  </svg>
                  Zgłoś do serwisu Camper Mannt
                </button>
              ) : (
                <div
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
                  style={{ background: '#d6edd9', color: '#1a4522', fontWeight: 700 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Zgłoszone do serwisu Mannt
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Service request modal */}
      {serviceModalLog && (
        <ServiceRequestModal
          log={serviceModalLog}
          vehicle={vehicle}
          onClose={() => setServiceModalLog(null)}
          onSent={() => {
            setLogs(prev => prev.map(l =>
              l.id === serviceModalLog.id ? { ...l, reportedToMannt: true } : l
            ));
          }}
        />
      )}
    </div>
  );
}
