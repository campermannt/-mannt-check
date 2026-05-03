'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Onboarding } from '@/components/Onboarding';
import { VehicleForm } from '@/components/VehicleForm';
import { Checklist } from '@/components/Checklist';
import { MaintenanceLogComponent } from '@/components/MaintenanceLog';
import { MajsterMannt } from '@/components/MajsterMannt';
import { TravelCalculator } from '@/components/TravelCalculator';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { hasCompletedOnboarding, getVehicles, fetchAndCacheVehicles, getActiveVehicleId, setActiveVehicleId, saveVehicle, removeVehicle } from '@/lib/storage';
import type { Vehicle } from '@/types';

type View = 'dashboard' | 'vehicle' | 'vehicle-new' | 'checklist' | 'maintenance' | 'calculator';

const NAV_ITEMS: { id: View; label: string; icon: React.ReactElement }[] = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
  },
  {
    id: 'checklist', label: 'Checklista',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
  },
  {
    id: 'maintenance', label: 'Serwis',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
  },
  {
    id: 'calculator', label: 'Kalkulator',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="14" y1="18" x2="16" y2="18"/></svg>
  },
  {
    id: 'vehicle', label: 'Pojazd',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14l4 4v4a2 2 0 01-2 2h-2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
  },
];

/* ── Logo ───────────────────────────────────────────────────── */
function ManntLogo({ height = 36, full = false }: { height?: number; full?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={full ? '/logo.png' : '/logo-header.png'} alt="Camper Mannt" style={{ height, width: 'auto', display: 'block' }} />
  );
}

/* ── Dark mode toggle ───────────────────────────────────────── */
function DarkToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={dark ? 'Tryb jasny' : 'Tryb ciemny'}
      className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
      style={{ background: dark ? 'rgba(255,255,255,.10)' : '#F5F0E8', border: 'none', cursor: 'pointer', color: dark ? '#ffa066' : '#1a4522' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  );
}

/* ── Vehicle type icon ──────────────────────────────────────── */
function VehicleIcon({ type, size = 14 }: { type: string; size?: number }) {
  if (type === 'Przyczepa') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="8" width="18" height="10" rx="2"/><circle cx="7" cy="18" r="2"/><circle cx="15" cy="18" r="2"/><path d="M19 12h3l1 3"/><path d="M9 18h4"/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14l4 4v4a2 2 0 01-2 2h-2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
    </svg>
  );
}

/* ── Action tile ────────────────────────────────────────────── */
function ActionTile({ icon, label, desc, bg, fg, border, onClick }: {
  icon: React.ReactElement; label: string; desc: string;
  bg: string; fg: string; border: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card card-lift text-left w-full"
      style={{ border: `1.5px solid ${border}`, cursor: 'pointer', padding: '20px 18px 18px' }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: bg, boxShadow: `0 2px 10px ${border}80` }}>
        <span style={{ color: fg, display: 'flex' }}>{icon}</span>
      </div>
      <p style={{ fontWeight: 800, fontSize: '.9375rem', color: fg, letterSpacing: '-.025em', lineHeight: 1.2 }}>{label}</p>
      <p className="mt-1.5 leading-snug" style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{desc}</p>
    </button>
  );
}

/* ── Service tile ───────────────────────────────────────────── */
function ServiceTile({ icon, title, desc }: { icon: React.ReactElement; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl transition-all" style={{ background: 'var(--sand-bg)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sand-dark)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sand-bg)'; }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-card)', boxShadow: '0 1px 4px rgb(0 0 0 / .07)' }}>
        {icon}
      </div>
      <div>
        <p className="text-sm leading-tight" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
    </div>
  );
}

/* ── Vehicle switcher card ──────────────────────────────────── */
function VehicleSwitcher({
  vehicles, activeId, onSwitch, onAdd, onEdit, onDelete,
}: {
  vehicles: Vehicle[];
  activeId: string | null;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onEdit: (v: Vehicle) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="card anim-fade-up" style={{ overflow: 'hidden' }}>
      {/* Header row */}
      <div className="flex items-center justify-between" style={{ padding: '18px 20px 14px' }}>
        <p style={{ fontWeight: 800, fontSize: '.875rem', color: 'var(--text-primary)', letterSpacing: '-.02em' }}>
          Moje pojazdy (v2.2.3-LIVE-CHECK)
        </p>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs transition-all"
          style={{ background: 'linear-gradient(135deg, #2a7a3a, #1F5F2E)', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700, boxShadow: '0 2px 8px rgb(31 95 46 / .22)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgb(31 95 46 / .32)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgb(31 95 46 / .22)'; }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Dodaj pojazd
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--divider)' }}>
        {vehicles.map((v, idx) => {
          const isActive = v.id === activeId;
          return (
            <div
              key={v.id}
              style={{ borderTop: idx > 0 ? '1px solid var(--divider)' : 'none' }}
            >
              <div
                className="flex items-center gap-3 transition-all"
                style={{ padding: '14px 20px', background: isActive ? 'var(--sand-bg)' : 'transparent' }}
              >
                {/* Active indicator + icon */}
                <button
                  onClick={() => onSwitch(v.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #1a4522, #2a7a3a)'
                        : 'var(--bg-card)',
                      boxShadow: isActive ? '0 2px 10px rgb(31 95 46 / .25)' : '0 1px 4px rgb(0 0 0 / .07)',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      transition: 'all .2s ease',
                    }}
                  >
                    <VehicleIcon type={v.type} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, fontSize: '.875rem', color: isActive ? '#1a4522' : 'var(--text-primary)', letterSpacing: '-.02em' }}>
                        {v.brand} {v.model}
                      </span>
                      {isActive && (
                        <span className="badge badge-green" style={{ fontSize: '.60rem', padding: '.15rem .55rem' }}>Aktywny</span>
                      )}
                    </div>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                      {v.type} · {v.year} · {v.mileage.toLocaleString()} km
                    </p>
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onEdit(v)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: 'var(--sand-bg)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sand-dark)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sand-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                    title="Edytuj"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  {vehicles.length > 1 && (
                    confirmDelete === v.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { onDelete(v.id); setConfirmDelete(null); }}
                          className="rounded-xl px-2 py-1 text-xs transition-all"
                          style={{ background: '#dc2626', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700 }}
                        >
                          Usuń
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-xl px-2 py-1 text-xs"
                          style={{ background: 'var(--sand-bg)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600 }}
                        >
                          Nie
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(v.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: 'var(--sand-bg)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2'; (e.currentTarget as HTMLElement).style.color = '#dc2626'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sand-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                        title="Usuń pojazd"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── App footer ─────────────────────────────────────────────── */
function AppFooter({ dark = false }: { dark?: boolean }) {
  const linkColor = dark ? 'rgba(255,255,255,.38)' : 'var(--text-muted)';
  const textColor = dark ? 'rgba(255,255,255,.22)' : 'var(--text-muted)';
  return (
    <div className="text-center" style={{ padding: '16px 0 8px' }}>
      <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: textColor }}>
        <span>© 2025 Mannt Serwis Kielce</span>
        <span style={{ opacity: .4 }}>·</span>
        <a href="https://mannt.pl" target="_blank" rel="noopener noreferrer" style={{ color: linkColor, textDecoration: 'none', fontWeight: 600 }}>mannt.pl</a>
        <span style={{ opacity: .4 }}>·</span>
        <a href="/regulamin" style={{ color: linkColor, textDecoration: 'none', fontWeight: 600 }}>Regulamin</a>
        <span style={{ opacity: .4 }}>·</span>
        <a href="/polityka-prywatnosci" style={{ color: linkColor, textDecoration: 'none', fontWeight: 600 }}>Polityka Prywatności</a>
        <span style={{ opacity: .4 }}>·</span>
        <a href="mailto:camper@mannt.pl" style={{ color: linkColor, textDecoration: 'none', fontWeight: 600 }}>camper@mannt.pl</a>
      </div>
    </div>
  );
}

/* ── PWA install button ──────────────────────────────────────── */
function PWAInstallButton({ onInstall, style }: { onInstall: () => void; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onInstall}
      className="flex items-center justify-center gap-2.5 w-full rounded-2xl transition-all"
      style={{
        padding: '13px 20px',
        fontWeight: 700,
        fontSize: '.875rem',
        border: '1.5px solid rgba(255,255,255,.18)',
        cursor: 'pointer',
        background: 'rgba(255,255,255,.10)',
        color: '#fff',
        backdropFilter: 'blur(8px)',
        letterSpacing: '-.01em',
        ...style,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.16)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.10)'; }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
        <path d="M9 7h6M12 7v6M9 13l3 3 3-3"/>
      </svg>
      Zainstaluj aplikację na telefon
    </button>
  );
}

/* ── Login / Register screen ────────────────────────────────── */
function LoginScreen({ onLogin, onRegister, accountDeleted, onInstallPWA, canInstallPWA }: {
  onLogin: (nick: string, password: string) => Promise<any>
  onRegister: (nick: string, password: string) => Promise<any>
  accountDeleted?: boolean
  onInstallPWA?: () => void
  canInstallPWA?: boolean
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength — only used in register mode
  const pwStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0–5
  })();
  const pwStrengthLabel = ['', 'Bardzo słabe', 'Słabe', 'Średnie', 'Silne', 'Bardzo silne'][pwStrength];
  const pwStrengthColor = ['', '#dc2626', '#f97316', '#eab308', '#22c55e', '#16a34a'][pwStrength];
  const pwIsStrong = pwStrength === 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && !pwIsStrong) {
      setError('Hasło jest za słabe. Użyj min. 12 znaków, dużej litery, małej litery, cyfry i znaku specjalnego.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === 'register') {
        await onRegister(nick, password);
      } else {
        await onLogin(nick, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Coś poszło nie tak. Spróbuj ponownie.');
    } finally {
      setBusy(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 14,
    border: '1.5px solid #e5e7eb',
    fontSize: '.9375rem',
    fontWeight: 500,
    color: '#111827',
    background: '#f9fafb',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .15s',
  };

  const ostyleFocus = (el: HTMLInputElement) => { el.style.borderColor = '#1a4522'; };
  const ostyleBlur = (el: HTMLInputElement) => { el.style.borderColor = '#e5e7eb'; };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #061610 0%, #0c2416 20%, #153a1e 45%, #1a4d28 70%, #1f5830 100%)' }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(42,122,58,.22) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,66,.09) 0%, transparent 60%)' }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-12">

        {/* Logo */}
        <div className="mb-8 anim-fade-up flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-header.png" alt="Camper Mannt" style={{ height: 80, width: 'auto', display: 'block', maxWidth: 220, filter: 'brightness(0) invert(1) drop-shadow(0 4px 20px rgba(0,0,0,.45))' }} />
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.7rem', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700 }}>
            Serwis & Zabudowy Kamperów · Kielce
          </p>
        </div>

        {/* Card */}
        <div className="w-full anim-fade-up-1" style={{ maxWidth: 400, background: '#ffffff', borderRadius: 28, padding: '36px 28px 28px', boxShadow: '0 40px 100px rgba(0,0,0,.36), 0 8px 24px rgba(0,0,0,.16)' }}>

          {/* Account deleted banner */}
          {accountDeleted && (
            <div className="mb-5 p-4 rounded-2xl flex items-start gap-3" style={{ background: '#f0fdf4', border: '1.5px solid #86efac' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <div>
                <p style={{ fontWeight: 700, fontSize: '.875rem', color: '#15803d' }}>Konto zostało usunięte</p>
                <p style={{ fontSize: '.75rem', color: '#16a34a', marginTop: 2 }}>Wszystkie Twoje dane zostały trwale usunięte z serwerów.</p>
              </div>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex rounded-2xl p-1 mb-7" style={{ background: '#f3f4f6' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className="flex-1 rounded-xl py-2.5 text-sm transition-all"
                style={{
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#1a4522' : '#6b7280',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.10)' : 'none',
                }}
              >
                {m === 'login' ? 'Zaloguj się' : 'Załóż konto'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} method="post" action="#">
            {/* Nick */}
            <div className="mb-4">
              <label htmlFor="mannt-nick" style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                Nick
              </label>
              <input
                id="mannt-nick"
                name="username"
                type="text"
                value={nick}
                onChange={e => setNick(e.target.value)}
                placeholder="Twój nick"
                autoComplete="username"
                style={inputStyle}
                onFocus={e => ostyleFocus(e.target as HTMLInputElement)}
                onBlur={e => ostyleBlur(e.target as HTMLInputElement)}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label htmlFor="new-password" style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                Hasło
              </label>
              {mode === 'register' && (
                <p style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>
                  Użyj silnego, unikalnego hasła. Przeglądarka automatycznie zaproponuje bezpieczne hasło.
                </p>
              )}
              <input
                id="new-password"
                name="new-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Min. 12 znaków, A-z, 0-9, !@#…' : 'Twoje hasło'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                data-lpignore="true"
                aria-autocomplete="none"
                style={inputStyle}
                onFocus={e => ostyleFocus(e.target as HTMLInputElement)}
                onBlur={e => ostyleBlur(e.target as HTMLInputElement)}
                required
              />
              {/* Password strength meter — register only */}
              {mode === 'register' && password.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {/* Bar */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        style={{
                          flex: 1, height: 5, borderRadius: 99,
                          background: i <= pwStrength ? pwStrengthColor : '#e5e7eb',
                          transition: 'background .2s',
                        }}
                      />
                    ))}
                  </div>
                  {/* Label + requirements */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '.75rem', fontWeight: 700, color: pwStrengthColor }}>
                      {pwStrengthLabel}
                    </p>
                    {!pwIsStrong && (
                      <p style={{ fontSize: '.7rem', color: '#9ca3af' }}>
                        {[
                          password.length < 12 && '12+ znaków',
                          !/[A-Z]/.test(password) && 'duża litera',
                          !/[a-z]/.test(password) && 'mała litera',
                          !/[0-9]/.test(password) && 'cyfra',
                          !/[^A-Za-z0-9]/.test(password) && 'znak spec.',
                        ].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Terms checkbox — only for register */}
            {mode === 'register' && (
              <div className="mb-4">
                <label
                  className="flex items-start gap-3 cursor-pointer"
                  style={{ userSelect: 'none' }}
                >
                  <div style={{ position: 'relative', flexShrink: 0, marginTop: 1 }}>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    />
                    <div
                      style={{
                        width: 20, height: 20, borderRadius: 6,
                        border: termsAccepted ? 'none' : '2px solid #d1d5db',
                        background: termsAccepted ? 'linear-gradient(135deg, #1a4522, #2a7a3a)' : '#f9fafb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .15s',
                        boxShadow: termsAccepted ? '0 2px 8px rgba(26,69,34,.30)' : 'none',
                      }}
                    >
                      {termsAccepted && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: '.8125rem', color: '#374151', lineHeight: 1.5 }}>
                    Akceptuję{' '}
                    <a href="/regulamin" target="_blank" rel="noopener noreferrer" style={{ color: '#1a4522', fontWeight: 700, textDecoration: 'underline' }}>
                      Regulamin
                    </a>
                    {' '}i{' '}
                    <a href="/polityka-prywatnosci" target="_blank" rel="noopener noreferrer" style={{ color: '#1a4522', fontWeight: 700, textDecoration: 'underline' }}>
                      Politykę Prywatności
                    </a>
                  </span>
                </label>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-xl text-center" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '.8rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy || (mode === 'register' && (!termsAccepted || !pwIsStrong))}
              className="w-full rounded-2xl transition-all"
              style={{
                padding: '15px 20px',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: (busy || (mode === 'register' && (!termsAccepted || !pwIsStrong))) ? 'not-allowed' : 'pointer',
                background: (busy || (mode === 'register' && (!termsAccepted || !pwIsStrong))) ? '#9db8a3' : 'linear-gradient(135deg, #1a4522, #2a7a3a)',
                color: '#fff',
                letterSpacing: '-.01em',
                boxShadow: (busy || (mode === 'register' && (!termsAccepted || !pwIsStrong))) ? 'none' : '0 4px 20px rgba(26,69,34,.35)',
                opacity: 1,
              }}
            >
              {busy ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}><circle cx="12" cy="12" r="10" strokeOpacity=".3"/><path d="M12 2a10 10 0 010 20" strokeLinecap="round"/></svg>
                  Proszę czekać…
                </span>
              ) : (
                mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'
              )}
            </button>
          </form>
        </div>

        {/* PWA Install button */}
        {canInstallPWA && onInstallPWA && (
          <div className="w-full anim-fade-up-2" style={{ maxWidth: 400 }}>
            <PWAInstallButton onInstall={onInstallPWA} />
          </div>
        )}

        {/* Footer */}
        <div className="w-full anim-fade-up-2" style={{ maxWidth: 400 }}>
          <AppFooter dark />
        </div>
      </div>
    </div>
  );
}

/* ── Delete account modal ───────────────────────────────────── */
function DeleteAccountModal({ onConfirm, onCancel }: {
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'warn' | 'confirm'>('warn');

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Podaj hasło, aby potwierdzić.'); return; }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(password);
    } catch (err: any) {
      setError(err?.message || 'Wystąpił błąd. Spróbuj ponownie.');
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="w-full anim-scale-in"
        style={{ maxWidth: 420, background: 'var(--bg-card)', borderRadius: 24, padding: '32px 28px 28px', boxShadow: '0 32px 80px rgba(0,0,0,.30)' }}
      >
        {step === 'warn' ? (
          <>
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-3xl mx-auto mb-5" style={{ background: '#fef2f2' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>

            <h3 className="text-center mb-3" style={{ fontWeight: 900, fontSize: '1.125rem', letterSpacing: '-.03em', color: 'var(--text-primary)' }}>
              Usunąć konto?
            </h3>
            <p className="text-sm text-center mb-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Ta operacja jest <strong style={{ color: '#dc2626' }}>nieodwracalna</strong>. Zostaną trwale usunięte:
            </p>
            <ul className="text-sm mb-6 space-y-1.5" style={{ color: 'var(--text-muted)', paddingLeft: 0, listStyle: 'none' }}>
              {['Konto i dane logowania', 'Wszystkie pojazdy', 'Checklisty i wpisy serwisowe', 'Historia tras'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setStep('confirm')}
                className="btn btn-full"
                style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '.9375rem' }}
              >
                Rozumiem — usuń moje konto
              </button>
              <button
                onClick={onCancel}
                className="btn btn-ghost btn-full"
                style={{ fontWeight: 600 }}
              >
                Anuluj
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-center mb-2" style={{ fontWeight: 900, fontSize: '1.125rem', letterSpacing: '-.03em', color: 'var(--text-primary)' }}>
              Potwierdź hasłem
            </h3>
            <p className="text-sm text-center mb-5" style={{ color: 'var(--text-muted)' }}>
              Wpisz swoje hasło, aby potwierdzić usunięcie konta.
            </p>
            <form onSubmit={handleDelete}>
              <input
                type="password"
                name="delete-confirm-password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Twoje hasło"
                className="field mb-4"
                style={{ width: '100%', boxSizing: 'border-box' }}
                autoFocus
              />
              {error && (
                <div className="mb-4 p-3 rounded-xl text-center text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600 }}>
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-full"
                  style={{ background: busy ? '#ef9999' : '#dc2626', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer', fontSize: '.9375rem', opacity: busy ? .7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {busy ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}><circle cx="12" cy="12" r="10" strokeOpacity=".3"/><path d="M12 2a10 10 0 010 20" strokeLinecap="round"/></svg>
                      Usuwanie…
                    </>
                  ) : 'Usuń konto na stałe'}
                </button>
                <button type="button" onClick={() => setStep('warn')} className="btn btn-ghost btn-full" style={{ fontWeight: 600 }}>
                  Wróć
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────── */
export default function Home() {
  const { user, isLoading, isAuthenticated, login, register, logout, deleteAccount } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleIdState] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);
  const { showInstallPrompt, installApp, dismissPrompt, trackAction, canInstall } = usePWAInstall();
  const [dark, setDark] = useState(false);

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) ?? vehicles[0] ?? null;

  useEffect(() => {
    const saved = localStorage.getItem('mannt-dark');
    if (saved === '1') { setDark(true); document.documentElement.classList.add('dark'); }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    if (next) { document.documentElement.classList.add('dark'); localStorage.setItem('mannt-dark', '1'); }
    else       { document.documentElement.classList.remove('dark'); localStorage.setItem('mannt-dark', '0'); }
  };

  useEffect(() => {
    if (!isLoading) {
      setShowOnboarding(!hasCompletedOnboarding());
    }
  }, [isLoading]);

  // Reload vehicles whenever auth state changes (login, logout, page load)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setIsLoadingVehicles(true);
      fetchAndCacheVehicles().then(vs => {
        setVehicles(vs);
        setActiveVehicleIdState(getActiveVehicleId() ?? vs[0]?.id ?? null);
        setIsLoadingVehicles(false);
      });
    } else if (!isLoading && !isAuthenticated) {
      setVehicles([]);
      setActiveVehicleIdState(null);
      setIsLoadingVehicles(false);
    }
  }, [isLoading, isAuthenticated]);

  const handleAction = () => trackAction();

  const handleDeleteAccount = useCallback(async (password: string) => {
    await deleteAccount(password);
    setShowDeleteModal(false);
    setAccountDeleted(true);
  }, [deleteAccount]);

  const handleSwitchVehicle = (id: string) => {
    setActiveVehicleId(id);
    setActiveVehicleIdState(id);
    handleAction();
  };

  const handleDeleteVehicle = async (id: string) => {
    await removeVehicle(id);
    const vs = getVehicles();
    setVehicles(vs);
    const newActiveId = getActiveVehicleId() ?? vs[0]?.id ?? null;
    setActiveVehicleIdState(newActiveId);
    handleAction();
  };

  /* Loading */
  if (isLoading || isLoadingVehicles) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 anim-scale-in">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #1a4522, #1F5F2E)', boxShadow: '0 8px 32px rgb(31 95 46 / .35)' }}>
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
            <circle cx="12" cy="12" r="10" strokeOpacity=".2" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)', letterSpacing: '.04em', fontWeight: 500 }}>
          {isLoadingVehicles ? 'Synchronizowanie danych…' : 'Ładowanie…'}
        </p>
      </div>
    </div>
  );

  if (showOnboarding) return <Onboarding onComplete={() => setShowOnboarding(false)} />;

  /* Login */
  if (!isAuthenticated) return (
    <LoginScreen
      onLogin={login}
      onRegister={register}
      accountDeleted={accountDeleted}
      canInstallPWA={canInstall}
      onInstallPWA={installApp}
    />
  );

  /* Add first vehicle */
  if (vehicles.length === 0 || currentView === 'vehicle-new') return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app-gradient)' }}>
      <header style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--bg-header-border)', padding: '12px 20px', boxShadow: '0 2px 12px rgb(0 0 0 / .06)' }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <ManntLogo height={36} />
          <div className="flex items-center gap-2">
            {currentView === 'vehicle-new' && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs"
                style={{ background: 'var(--sand-bg)', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}
              >
                ← Powrót
              </button>
            )}
            <DarkToggle dark={dark} onToggle={toggleDark} />
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-5 py-10">
        <div className="text-center mb-8 anim-fade-up">
          <h1 className="text-2xl mb-2" style={{ fontWeight: 900, letterSpacing: '-.04em', color: 'var(--text-primary)' }}>
            {vehicles.length === 0 ? 'Witaj w Mannt Check!' : 'Nowy pojazd'}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {vehicles.length === 0 ? 'Zacznij od dodania swojego pojazdu' : 'Dodaj kolejny pojazd do swojej floty'}
          </p>
        </div>
        <div className="anim-fade-up-1">
          <VehicleForm
            userId={user?.id || ''}
            onSave={async (v) => {
              await saveVehicle(v);
              const vs = getVehicles();
              setVehicles(vs);
              setActiveVehicleIdState(v.id);
              setCurrentView('dashboard');
              handleAction();
            }}
          />
        </div>
      </div>
    </div>
  );

  /* Edit existing vehicle */
  if (editingVehicle) return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app-gradient)' }}>
      <header style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--bg-header-border)', padding: '12px 20px', boxShadow: '0 2px 12px rgb(0 0 0 / .06)' }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <ManntLogo height={36} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingVehicle(null)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs"
              style={{ background: 'var(--sand-bg)', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}
            >
              ← Powrót
            </button>
            <DarkToggle dark={dark} onToggle={toggleDark} />
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-5 py-10">
        <div className="anim-fade-up">
          <VehicleForm
            userId={user?.id || ''}
            initialData={editingVehicle}
            onSave={async (v) => {
              await saveVehicle(v);
              const vs = getVehicles();
              setVehicles(vs);
              setActiveVehicleIdState(v.id);
              setEditingVehicle(null);
              setCurrentView('dashboard');
              handleAction();
            }}
          />
        </div>
      </div>
    </div>
  );

  /* ── Main app ────────────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app-gradient)' }}>

      {/* Header */}
      <header className="sticky top-0 z-20" style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--bg-header-border)', boxShadow: '0 2px 16px rgb(0 0 0 / .07)' }}>
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <ManntLogo height={36} />
          <div className="flex items-center gap-2">
            {/* Active vehicle pill */}
            {activeVehicle && (
              <div
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs"
                style={{ background: 'var(--sand-bg)', fontWeight: 600, letterSpacing: '-.01em', color: 'var(--text-secondary)' }}
              >
                <VehicleIcon type={activeVehicle.type} size={13} />
                {activeVehicle.brand} {activeVehicle.model} · {activeVehicle.year}
              </div>
            )}
            <DarkToggle dark={dark} onToggle={toggleDark} />
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition-colors"
              style={{ background: 'var(--sand-bg)', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"/></svg>
              <span className="hidden sm:inline">Wyloguj</span>
            </button>
          </div>
        </div>

        {/* Nav */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {NAV_ITEMS.filter(n => n.id !== 'vehicle-new').map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => { setCurrentView(id); handleAction(); }}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: currentView === id ? '2.5px solid #FF8C42' : '2.5px solid transparent',
                  color: currentView === id ? '#1F5F2E' : 'var(--text-muted)',
                  fontWeight: 600, fontSize: '.8125rem', padding: '.7rem 1.1rem',
                  whiteSpace: 'nowrap', flexShrink: 0, transition: 'color .15s',
                  display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '-.01em',
                }}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-5 py-6 pb-28">

        {/* Dashboard */}
        {currentView === 'dashboard' && activeVehicle && (
          <div className="space-y-6">

            {/* Vehicle hero card */}
            <div
              className="relative overflow-hidden rounded-3xl anim-fade-up"
              style={{
                background: 'linear-gradient(145deg, #0a1f0f 0%, #1a4522 35%, #1F5F2E 65%, #2a7a3a 100%)',
                boxShadow: '0 24px 64px rgb(15 45 20 / .45), 0 4px 16px rgb(0 0 0 / .12)',
                padding: '32px 28px 28px',
              }}
            >
              {/* Background orbs */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 65%)' }} />
                <div style={{ position: 'absolute', bottom: '-20px', right: '50px', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,66,.14) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', top: '35%', left: '-30px', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(53,150,74,.10) 0%, transparent 70%)' }} />
              </div>

              {/* Subtle corner glow — replaces decorative SVG */}
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle at 80% 90%, rgba(255,140,66,.10) 0%, transparent 60%)', pointerEvents: 'none' }} />

              <div className="relative z-10 flex items-stretch gap-6">

                {/* ── LEFT: vehicle data ────────────────────────── */}
                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="badge badge-white text-[.68rem]" style={{ backdropFilter: 'blur(8px)', gap: 4 }}>
                      <VehicleIcon type={activeVehicle.type} size={10} />
                      {activeVehicle.type}
                    </span>
                    {activeVehicle.lastInspectionDate && (
                      <span style={{ background: 'rgba(255,140,66,.22)', color: '#fcd8a8', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', padding: '.22rem .75rem', borderRadius: '9999px', backdropFilter: 'blur(8px)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        Przegląd OK
                      </span>
                    )}
                  </div>

                  {/* Vehicle name */}
                  <p style={{ color: 'rgba(255,255,255,.42)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 5 }}>Twój pojazd</p>
                  <h2 className="text-white mb-5" style={{ fontWeight: 900, fontSize: '1.875rem', letterSpacing: '-.05em', lineHeight: 1.05 }}>
                    {activeVehicle.brand} {activeVehicle.model}
                  </h2>

                  {/* Stats grid */}
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {[
                      { label: 'Rok', val: String(activeVehicle.year) },
                      { label: 'Przebieg', val: `${activeVehicle.mileage.toLocaleString()} km` },
                      { label: 'DMC', val: `${activeVehicle.dmc.toLocaleString()} kg` },
                      ...(activeVehicle.registrationNumber ? [{ label: 'Nr rej.', val: activeVehicle.registrationNumber }] : []),
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <p style={{ color: 'rgba(255,255,255,.38)', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase' }}>{label}</p>
                        <p className="text-white" style={{ fontWeight: 700, fontSize: '.9375rem', letterSpacing: '-.015em', marginTop: 2 }}>{val}</p>
                      </div>
                    ))}
                  </div>

                  {activeVehicle.lastInspectionDate && (
                    <div className="mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs" style={{ background: 'rgba(255,255,255,.10)', backdropFilter: 'blur(10px)', color: 'rgba(255,255,255,.75)', border: '1px solid rgba(255,255,255,.10)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      Przegląd szczelności:{' '}
                      <strong style={{ color: '#fff' }}>{new Date(activeVehicle.lastInspectionDate).toLocaleDateString('pl-PL')}</strong>
                    </div>
                  )}
                </div>

                {/* ── RIGHT: logo ───────────────────────────────── */}
                <div
                  className="flex-shrink-0 flex items-center justify-center self-stretch"
                  style={{
                    borderLeft: '1px solid rgba(255,255,255,.15)',
                    paddingLeft: 24,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-header.png"
                    alt="Camper Mannt"
                    style={{
                      height: 70,
                      width: 'auto',
                      display: 'block',
                      maxWidth: 160,
                      filter: 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,.4))',
                    }}
                  />
                </div>

              </div>
            </div>

            {/* Vehicle switcher (only when multiple vehicles) */}
            <VehicleSwitcher
              vehicles={vehicles}
              activeId={activeVehicleId}
              onSwitch={handleSwitchVehicle}
              onAdd={() => setCurrentView('vehicle-new')}
              onEdit={(v) => setEditingVehicle(v)}
              onDelete={handleDeleteVehicle}
            />

            {/* Quick actions */}
            <div className="anim-fade-up-1">
              <p className="text-xs uppercase mb-4" style={{ fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.10em' }}>
                Szybkie akcje
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <ActionTile
                  onClick={() => { setCurrentView('checklist'); handleAction(); }}
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
                  label="Checklista" desc="Przed wyjazdem"
                  bg="linear-gradient(135deg, #d6edd9, #a8d5b5)" fg="#1a4522" border="#a8d5b5"
                />
                <ActionTile
                  onClick={() => { setCurrentView('maintenance'); handleAction(); }}
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>}
                  label="Serwis" desc="Historia napraw"
                  bg="linear-gradient(135deg, #ede6d8, #ddd0b8)" fg="#5c3d14" border="#ddd0b8"
                />
                <ActionTile
                  onClick={() => { setCurrentView('calculator'); handleAction(); }}
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 9h5a2 2 0 010 4H9v3h6"/></svg>}
                  label="Kalkulator" desc="Koszty podróży"
                  bg="linear-gradient(135deg, #fff4ec, #ffd9b8)" fg="#7a3810" border="#ffd9b8"
                />
                <ActionTile
                  onClick={() => setEditingVehicle(activeVehicle)}
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
                  label="Edytuj pojazd" desc="Aktualizuj dane"
                  bg="linear-gradient(135deg, #dbeafe, #bfdbfe)" fg="#1e3a8a" border="#bfdbfe"
                />
              </div>
            </div>

            {/* AI promo */}
            <div
              className="card anim-fade-up-2"
              style={{ border: '1.5px solid #d6edd9', background: 'linear-gradient(135deg, var(--bg-card) 0%, #f0fbf2 100%)', padding: '20px 24px' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 anim-pulse-glow"
                  style={{ background: 'linear-gradient(150deg, #2a7a3a, #1F5F2E)', boxShadow: '0 4px 16px rgb(31 95 46 / .28)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontWeight: 800, fontSize: '.9375rem', color: 'var(--text-primary)', letterSpacing: '-.02em' }}>Majster Mannt</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    AI doradca techniczny — kliknij przycisk w prawym dolnym rogu
                  </p>
                </div>
                <span className="badge badge-green flex-shrink-0" style={{ fontSize: '.68rem' }}>AI</span>
              </div>
            </div>

            {/* Trust section */}
            <div className="card anim-fade-up-3" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '28px 28px 24px', borderBottom: '1px solid var(--divider)' }}>
                <h2 style={{ fontWeight: 900, fontSize: '1.1875rem', letterSpacing: '-.04em', lineHeight: 1.2, color: 'var(--text-primary)', marginBottom: 10 }}>
                  Zaufaj profesjonalistom<br />z Camper Mannt Kielce
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)', maxWidth: 420 }}>
                  Serwisujemy i budujemy zabudowy kamperów z pasją od ponad 15 lat. Specjalizujemy się w zabudowach custom, instalacjach i naprawach wszelkich typów kamperów i przyczep kempingowych.
                </p>
              </div>
              <div style={{ padding: '20px 20px 4px' }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <ServiceTile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a4522" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>} title="Serwis i naprawy" desc="Przeglądy, diagnostyka" />
                  <ServiceTile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a4522" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>} title="Zabudowy custom" desc="Projekty na zamówienie" />
                  <ServiceTile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a4522" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 00-6.88 17.25M12 2v4M12 22a10 10 0 006.88-17.25M12 22v-4"/></svg>} title="Instalacje wod.-gaz." desc="Woda, gaz, solar" />
                  <ServiceTile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a4522" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} title="Uszczelnianie dachu" desc="Hydroizolacja profes." />
                  <ServiceTile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a4522" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>} title="Fotowoltaika" desc="Panele + akumulatory" />
                  <ServiceTile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a4522" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg>} title="Ogrzewanie JP Heater" desc="Montaż i serwis" />
                </div>
              </div>
              <div style={{ padding: '20px 20px 20px' }}>
                <a
                  href="https://mannt.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-amber btn-full btn-lg"
                  style={{ textDecoration: 'none', display: 'flex' }}
                >
                  Odwiedź mannt.pl
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {currentView === 'checklist'   && <div className="anim-fade-up"><Checklist onAction={handleAction} vehicleId={activeVehicle?.id} /></div>}
        {currentView === 'maintenance' && <div className="anim-fade-up"><MaintenanceLogComponent userId={user?.id || ''} vehicleId={activeVehicle?.id || ''} onAction={handleAction} /></div>}
        {currentView === 'calculator'  && <div className="anim-fade-up"><TravelCalculator onAction={handleAction} /></div>}

        {/* App footer */}
        <div className="mt-8">
          <AppFooter />
        </div>
        {currentView === 'vehicle'     && activeVehicle && (
          <div className="anim-fade-up space-y-6">
            <VehicleForm
              userId={user?.id || ''}
              initialData={activeVehicle}
              onSave={(v) => {
                saveVehicle(v);
                const vs = getVehicles();
                setVehicles(vs);
                setActiveVehicleIdState(v.id);
                setCurrentView('dashboard');
                handleAction();
              }}
            />

            {/* Account settings — RODO */}
            <div className="card" style={{ border: '1.5px solid #fee2e2', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--divider)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef2f2' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '.875rem', color: 'var(--text-primary)', letterSpacing: '-.02em' }}>Ustawienia konta</p>
                    <p style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 1 }}>Zalogowany jako: <strong>{user?.name}</strong></p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 24px 20px' }} className="space-y-3">
                {/* PWA install */}
                {canInstall && (
                  <button
                    onClick={() => installApp()}
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm transition-all"
                    style={{ background: 'linear-gradient(135deg, #d6edd9, #a8d5b5)', border: '1.5px solid #a8d5b5', color: '#1a4522', fontWeight: 700, cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(.95)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/><path d="M9 7h6M12 7v6M9 13l3 3 3-3"/>
                    </svg>
                    Zainstaluj aplikację na telefon
                  </button>
                )}

                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Zgodnie z RODO (prawo do bycia zapomnianym) możesz w każdej chwili trwale usunąć swoje konto oraz wszystkie powiązane dane z naszych serwerów.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm transition-all"
                  style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', fontWeight: 700, cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                  Usuń konto i wszystkie moje dane
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <MajsterMannt onAction={handleAction} />

      {showInstallPrompt && (
        <PWAInstallPrompt onInstall={async () => { await installApp(); }} onDismiss={dismissPrompt} />
      )}

      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
