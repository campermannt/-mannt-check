'use client';

import { useState } from 'react';
import type { Vehicle, VehicleType } from '@/types';
import { saveVehicle } from '@/lib/storage';

interface VehicleFormProps {
  userId: string;
  onSave: (vehicle: Vehicle) => void;
  initialData?: Vehicle;
}

export function VehicleForm({ userId, onSave, initialData }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    registrationNumber: initialData?.registrationNumber || '',
    type: (initialData?.type || 'Kamper') as VehicleType,
    dmc: initialData?.dmc || 3500,
    mileage: initialData?.mileage || 0,
    lastInspectionDate: initialData?.lastInspectionDate || '',
    heightCm: initialData?.heightCm || 0,
    widthCm: initialData?.widthCm || 0,
    lengthCm: initialData?.lengthCm || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle: Vehicle = {
      id: initialData?.id || crypto.randomUUID(),
      userId,
      ...formData,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveVehicle(vehicle);
    onSave(vehicle);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isEdit = !!initialData;

  return (
    <div className="max-w-xl mx-auto">

      {/* ── Hero header ──────────────────────────────────────────── */}
      <div
        className="rounded-3xl overflow-hidden mb-5 anim-fade-up"
        style={{
          background: 'linear-gradient(145deg, #0a1f0f 0%, #1a4522 40%, #1F5F2E 70%, #2a7a3a 100%)',
          boxShadow: '0 16px 48px rgb(15 45 20 / .38)',
          padding: '36px 32px 28px',
          position: 'relative',
        }}
      >
        {/* Orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '20%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,66,.12) 0%, transparent 70%)' }} />
        </div>

        {/* Camper SVG illustration */}
        <div className="flex justify-center mb-5 anim-float" style={{ position: 'relative', zIndex: 1 }}>
          <svg width="140" height="82" viewBox="0 0 140 82" fill="none">
            {/* Body */}
            <rect x="2" y="20" width="100" height="44" rx="7" fill="rgba(255,255,255,.18)" />
            {/* Cabin */}
            <rect x="90" y="8" width="46" height="56" rx="7" fill="rgba(255,255,255,.22)" />
            {/* Windshield */}
            <rect x="96" y="14" width="30" height="22" rx="4" fill="rgba(255,255,255,.55)" />
            {/* Side windows */}
            <rect x="14" y="28" width="30" height="20" rx="4" fill="rgba(255,255,255,.40)" />
            <rect x="50" y="28" width="20" height="20" rx="4" fill="rgba(255,255,255,.24)" />
            {/* Orange stripe */}
            <rect x="2" y="56" width="134" height="5" rx="2.5" fill="#FF8C42" />
            {/* Door line */}
            <line x1="2" y1="44" x2="102" y2="44" stroke="rgba(255,255,255,.10)" strokeWidth="1" />
            {/* Wheels */}
            <circle cx="28" cy="70" r="10" fill="#0a1f0f" stroke="rgba(255,255,255,.55)" strokeWidth="2.5" />
            <circle cx="28" cy="70" r="4.5" fill="rgba(255,255,255,.30)" />
            <circle cx="100" cy="70" r="10" fill="#0a1f0f" stroke="rgba(255,255,255,.55)" strokeWidth="2.5" />
            <circle cx="100" cy="70" r="4.5" fill="rgba(255,255,255,.30)" />
            {/* Headlight */}
            <rect x="133" y="32" width="5" height="10" rx="2.5" fill="rgba(255,240,160,.6)" />
            <ellipse cx="136" cy="42" rx="8" ry="3" fill="rgba(255,240,160,.18)" />
            {/* Roof detail */}
            <rect x="10" y="20" width="70" height="4" rx="2" fill="rgba(255,255,255,.07)" />
          </svg>
        </div>

        {/* Title */}
        <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="text-white mb-1.5" style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-.045em', lineHeight: 1.1 }}>
            {isEdit ? 'Edytuj pojazd' : 'Dodaj swój pojazd'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.9rem', lineHeight: 1.5 }}>
            {isEdit ? 'Zaktualizuj dane swojego kampera' : 'Wypełnij dane — zajmie to tylko chwilę'}
          </p>
        </div>
      </div>

      {/* ── Card with form ──────────────────────────────────────── */}
      <div className="card anim-fade-up-1" style={{ overflow: 'hidden' }}>
        <form onSubmit={handleSubmit} className="p-8 space-y-7">

          {/* Vehicle type selector */}
          <div>
            <label className="field-label mb-3 block">Typ pojazdu</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                {
                  type: 'Kamper' as VehicleType,
                  label: 'Kamper',
                  desc: 'Samochód kempingowy',
                  svg: (
                    <svg width="52" height="34" viewBox="0 0 96 56" fill="none">
                      <rect x="2" y="14" width="72" height="30" rx="5" fill="currentColor" fillOpacity=".15" />
                      <rect x="62" y="6" width="30" height="38" rx="5" fill="currentColor" fillOpacity=".18" />
                      <rect x="66" y="10" width="20" height="16" rx="3" fill="currentColor" fillOpacity=".40" />
                      <rect x="12" y="20" width="22" height="14" rx="3" fill="currentColor" fillOpacity=".32" />
                      <rect x="38" y="20" width="14" height="14" rx="3" fill="currentColor" fillOpacity=".20" />
                      <rect x="2" y="38" width="90" height="4" rx="2" fill="#FF8C42" />
                      <circle cx="20" cy="50" r="6" fill="currentColor" fillOpacity=".45" />
                      <circle cx="66" cy="50" r="6" fill="currentColor" fillOpacity=".45" />
                      <circle cx="20" cy="50" r="2.5" fill="currentColor" fillOpacity=".7" />
                      <circle cx="66" cy="50" r="2.5" fill="currentColor" fillOpacity=".7" />
                    </svg>
                  ),
                },
                {
                  type: 'Przyczepa' as VehicleType,
                  label: 'Przyczepa',
                  desc: 'Przyczepa kempingowa',
                  svg: (
                    <svg width="52" height="34" viewBox="0 0 80 56" fill="none">
                      <rect x="4" y="10" width="68" height="36" rx="5" fill="currentColor" fillOpacity=".15" />
                      <rect x="10" y="16" width="22" height="14" rx="3" fill="currentColor" fillOpacity=".28" />
                      <rect x="36" y="16" width="14" height="14" rx="3" fill="currentColor" fillOpacity=".18" />
                      <rect x="4" y="40" width="68" height="4" rx="2" fill="#FF8C42" />
                      <circle cx="22" cy="50" r="6" fill="currentColor" fillOpacity=".45" />
                      <circle cx="58" cy="50" r="6" fill="currentColor" fillOpacity=".45" />
                      <circle cx="22" cy="50" r="2.5" fill="currentColor" fillOpacity=".7" />
                      <circle cx="58" cy="50" r="2.5" fill="currentColor" fillOpacity=".7" />
                      <line x1="76" y1="26" x2="76" y2="44" stroke="currentColor" strokeOpacity=".4" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx="76" cy="46" r="3.5" fill="currentColor" fillOpacity=".55" />
                    </svg>
                  ),
                },
              ] as const).map(({ type, label, desc, svg }) => {
                const sel = formData.type === type;
                return (
                  <label
                    key={type}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all text-center"
                    style={{
                      borderColor: sel ? '#1F5F2E' : 'var(--field-border)',
                      background: sel ? '#eef7f0' : 'var(--sand-bg)',
                      boxShadow: sel
                        ? '0 0 0 3px rgb(31 95 46 / .12), inset 0 1px 0 rgba(255,255,255,.8)'
                        : 'inset 0 1px 0 rgba(255,255,255,.6)',
                      transform: sel ? 'translateY(-1px)' : '',
                    }}
                  >
                    <input type="radio" name="type" value={type} checked={sel}
                      onChange={e => handleChange('type', e.target.value)} className="sr-only" />
                    <div style={{ color: sel ? '#1F5F2E' : 'var(--text-muted)' }}>{svg}</div>
                    <div>
                      <p className="text-sm" style={{ fontWeight: 700, color: sel ? '#1a4522' : 'var(--text-primary)', letterSpacing: '-.02em' }}>{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: sel ? '#2a7a3a' : 'var(--text-muted)' }}>{desc}</p>
                    </div>
                    {sel && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#1F5F2E' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Brand + Model */}
          <div>
            <p className="field-label mb-3">Dane pojazdu</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label" style={{ fontSize: '.7rem' }}>Marka</label>
                <div className="field-icon-wrap">
                  <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <input type="text" required value={formData.brand}
                    onChange={e => handleChange('brand', e.target.value)}
                    className="field" placeholder="np. Fiat" />
                </div>
              </div>
              <div>
                <label className="field-label" style={{ fontSize: '.7rem' }}>Model</label>
                <input type="text" required value={formData.model}
                  onChange={e => handleChange('model', e.target.value)}
                  className="field" placeholder="np. Ducato" />
              </div>
            </div>
          </div>

          {/* Year + Registration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Rok produkcji</label>
              <div className="field-icon-wrap">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <input type="number" required min="1970" max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={e => handleChange('year', parseInt(e.target.value))}
                  className="field" />
              </div>
            </div>
            <div>
              <label className="field-label">Nr rejestracyjny</label>
              <div className="field-icon-wrap">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M6 14h.01M10 10h8M10 14h5"/>
                </svg>
                <input type="text" required value={formData.registrationNumber}
                  onChange={e => handleChange('registrationNumber', e.target.value.toUpperCase())}
                  className="field" placeholder="np. KI 12345" />
              </div>
            </div>
          </div>

          {/* DMC + Mileage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">DMC (kg)</label>
              <div className="field-icon-wrap">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a5 5 0 015 5v1H7V7a5 5 0 015-5z"/><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 12v4M9 14h6"/>
                </svg>
                <input type="number" required min="100" max="10000"
                  value={formData.dmc}
                  onChange={e => handleChange('dmc', parseInt(e.target.value))}
                  className="field" />
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>od 100 do 10 000 kg</p>
            </div>
            <div>
              <label className="field-label">Przebieg (km)</label>
              <div className="field-icon-wrap">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                <input type="number" required min="0"
                  value={formData.mileage}
                  onChange={e => handleChange('mileage', parseInt(e.target.value))}
                  className="field" />
              </div>
            </div>
          </div>

          {/* Last inspection */}
          <div>
            <label className="field-label">Data ostatniego przeglądu szczelności</label>
            <div className="field-icon-wrap">
              <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
              </svg>
              <input type="date" value={formData.lastInspectionDate}
                onChange={e => handleChange('lastInspectionDate', e.target.value)}
                className="field" />
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Opcjonalne — zalecany co 12 miesięcy
            </p>
          </div>

          {/* Dimensions section */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--sand-bg)', border: '1.5px solid var(--field-border)' }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#dbeafe' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 3H3v7h18V3z"/><path d="M21 14H3v7h18v-7z"/><path d="M12 10v4M8 10v4M16 10v4"/>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '.8125rem', color: 'var(--text-primary)', letterSpacing: '-.01em' }}>
                  Wymiary pojazdu / zestawu
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Używane do planowania tras RV i wykrywania ograniczeń
                </p>
              </div>
              <span className="badge badge-sky ml-auto">Trasa RV</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="field-label" style={{ fontSize: '.68rem' }}>
                  Wysokość (cm)
                </label>
                <div className="field-icon-wrap">
                  <svg className="field-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M5 7l7-5 7 5M5 17l7 5 7-5"/>
                  </svg>
                  <input
                    type="number" min="0" max="600" step="1"
                    value={formData.heightCm || ''}
                    onChange={e => handleChange('heightCm', e.target.value ? parseInt(e.target.value) : 0)}
                    className="field" placeholder="np. 310"
                  />
                </div>
              </div>
              <div>
                <label className="field-label" style={{ fontSize: '.68rem' }}>
                  Szerokość (cm)
                </label>
                <div className="field-icon-wrap">
                  <svg className="field-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12h20M7 5l-5 7 5 7M17 5l5 7-5 7"/>
                  </svg>
                  <input
                    type="number" min="0" max="400" step="1"
                    value={formData.widthCm || ''}
                    onChange={e => handleChange('widthCm', e.target.value ? parseInt(e.target.value) : 0)}
                    className="field" placeholder="np. 230"
                  />
                </div>
              </div>
              <div>
                <label className="field-label" style={{ fontSize: '.68rem' }}>
                  Długość (cm)
                </label>
                <div className="field-icon-wrap">
                  <svg className="field-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                  <input
                    type="number" min="0" max="3000" step="1"
                    value={formData.lengthCm || ''}
                    onChange={e => handleChange('lengthCm', e.target.value ? parseInt(e.target.value) : 0)}
                    className="field" placeholder="np. 720"
                  />
                </div>
              </div>
            </div>

            {/* Live summary if filled */}
            {(formData.heightCm > 0 || formData.widthCm > 0 || formData.lengthCm > 0) && (
              <div
                className="mt-3 flex flex-wrap gap-2 items-center"
              >
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Wymiary:</span>
                {formData.heightCm > 0 && (
                  <span className="badge badge-sky">{(formData.heightCm / 100).toFixed(2).replace('.', ',')} m wys.</span>
                )}
                {formData.widthCm > 0 && (
                  <span className="badge badge-sky">{(formData.widthCm / 100).toFixed(2).replace('.', ',')} m szer.</span>
                )}
                {formData.lengthCm > 0 && (
                  <span className="badge badge-sky">{(formData.lengthCm / 100).toFixed(2).replace('.', ',')} m dł.</span>
                )}
              </div>
            )}
          </div>

          <hr className="divider" />

          <button type="submit" className="btn btn-green btn-lg btn-full">
            {isEdit ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                Zapisz zmiany
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Dodaj pojazd
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
