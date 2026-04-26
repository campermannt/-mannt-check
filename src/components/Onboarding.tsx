'use client';

import { useState } from 'react';
import { ONBOARDING_STEPS } from '@/types';
import { setOnboardingCompleted } from '@/lib/storage';

interface OnboardingProps {
  onComplete: () => void;
}

/* ── Step illustrations ─────────────────────────────────────── */
const STEP_ILLUSTRATION = [
  /* Step 1 — scenic road / adventure */
  <svg key="i1" width="180" height="120" viewBox="0 0 180 120" fill="none">
    {/* Sky */}
    <rect width="180" height="120" rx="16" fill="url(#sky1)"/>
    <defs>
      <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1a4522"/>
        <stop offset="100%" stopColor="#2a7a3a"/>
      </linearGradient>
    </defs>
    {/* Sun / moon glow */}
    <circle cx="145" cy="28" r="16" fill="rgba(255,200,80,.25)"/>
    <circle cx="145" cy="28" r="10" fill="rgba(255,200,80,.5)"/>
    <circle cx="145" cy="28" r="6" fill="#ffd860"/>
    {/* Mountains */}
    <polygon points="0,90 35,35 70,90" fill="#0f2d14"/>
    <polygon points="40,90 80,28 120,90" fill="#0f2d14"/>
    <polygon points="90,90 130,42 170,90" fill="#1a4522"/>
    <polygon points="100,90 135,50 175,90" fill="#0e2510" fillOpacity=".5"/>
    {/* Ground */}
    <rect x="0" y="88" width="180" height="32" rx="0" fill="#0a1f0f"/>
    {/* Road */}
    <polygon points="70,120 110,120 105,88 75,88" fill="#1e2e22"/>
    <rect x="88" y="92" width="4" height="8" rx="2" fill="rgba(255,255,255,.4)"/>
    <rect x="88" y="106" width="4" height="8" rx="2" fill="rgba(255,255,255,.4)"/>
    {/* Stars */}
    <circle cx="20" cy="18" r="1.5" fill="rgba(255,255,255,.7)"/>
    <circle cx="55" cy="10" r="1" fill="rgba(255,255,255,.5)"/>
    <circle cx="100" cy="14" r="1.5" fill="rgba(255,255,255,.6)"/>
    <circle cx="170" cy="22" r="1" fill="rgba(255,255,255,.5)"/>
    {/* Camper van on road */}
    <rect x="60" y="72" width="32" height="16" rx="3" fill="#FF8C42"/>
    <rect x="76" y="65" width="18" height="12" rx="2" fill="#FF8C42"/>
    <rect x="78" y="67" width="8" height="7" rx="1.5" fill="rgba(255,255,255,.5)"/>
    <circle cx="66" cy="88" r="4" fill="#0a1f0f" stroke="rgba(255,255,255,.4)" strokeWidth="1.5"/>
    <circle cx="87" cy="88" r="4" fill="#0a1f0f" stroke="rgba(255,255,255,.4)" strokeWidth="1.5"/>
    {/* Headlights */}
    <ellipse cx="93" cy="79" rx="5" ry="2" fill="rgba(255,240,180,.35)"/>
  </svg>,

  /* Step 2 — maintenance / tools */
  <svg key="i2" width="180" height="120" viewBox="0 0 180 120" fill="none">
    <rect width="180" height="120" rx="16" fill="url(#maint2)"/>
    <defs>
      <linearGradient id="maint2" x1="0" y1="0" x2="180" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1F5F2E"/>
        <stop offset="100%" stopColor="#0f2d14"/>
      </linearGradient>
    </defs>
    {/* Garage floor */}
    <rect x="0" y="90" width="180" height="30" fill="#0a1f0f"/>
    {/* Camper body */}
    <rect x="20" y="52" width="100" height="38" rx="5" fill="#2a7a3a"/>
    <rect x="90" y="38" width="38" height="52" rx="5" fill="#2a7a3a"/>
    {/* Windows */}
    <rect x="30" y="60" width="22" height="16" rx="3" fill="rgba(255,255,255,.22)"/>
    <rect x="60" y="60" width="18" height="16" rx="3" fill="rgba(255,255,255,.18)"/>
    <rect x="94" y="45" width="26" height="18" rx="3" fill="rgba(255,255,255,.2)"/>
    {/* Orange stripe */}
    <rect x="20" y="80" width="108" height="6" rx="3" fill="#FF8C42"/>
    {/* Wheels */}
    <circle cx="44" cy="90" r="10" fill="#0a1f0f" stroke="rgba(255,255,255,.3)" strokeWidth="2"/>
    <circle cx="44" cy="90" r="5" fill="#1a4522"/>
    <circle cx="108" cy="90" r="10" fill="#0a1f0f" stroke="rgba(255,255,255,.3)" strokeWidth="2"/>
    <circle cx="108" cy="90" r="5" fill="#1a4522"/>
    {/* Tool — wrench */}
    <path d="M148 25 C155 18, 165 20, 163 28 L152 42 L146 36 Z" fill="#FF8C42" fillOpacity=".9"/>
    <rect x="140" y="38" width="8" height="30" rx="4" fill="#FF8C42" transform="rotate(-40 144 53)"/>
    {/* Tool — checkmark circle */}
    <circle cx="155" cy="85" r="14" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>
    <path d="M149 85 l4 5 8-9" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Sparkles */}
    <circle cx="18" cy="30" r="2" fill="rgba(255,140,66,.5)"/>
    <circle cx="168" cy="45" r="1.5" fill="rgba(255,255,255,.35)"/>
    <circle cx="10" cy="70" r="1.5" fill="rgba(255,255,255,.25)"/>
  </svg>,

  /* Step 3 — ready to go */
  <svg key="i3" width="180" height="120" viewBox="0 0 180 120" fill="none">
    <rect width="180" height="120" rx="16" fill="url(#ready3)"/>
    <defs>
      <linearGradient id="ready3" x1="0" y1="0" x2="180" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#d96f22"/>
        <stop offset="100%" stopColor="#FF8C42"/>
      </linearGradient>
    </defs>
    {/* Road lines */}
    <rect x="0" y="90" width="180" height="30" fill="rgba(0,0,0,.25)"/>
    <rect x="40" y="102" width="20" height="4" rx="2" fill="rgba(255,255,255,.35)"/>
    <rect x="80" y="102" width="20" height="4" rx="2" fill="rgba(255,255,255,.35)"/>
    <rect x="120" y="102" width="20" height="4" rx="2" fill="rgba(255,255,255,.35)"/>
    {/* Camper */}
    <rect x="28" y="55" width="90" height="35" rx="5" fill="#fff" fillOpacity=".9"/>
    <rect x="90" y="42" width="36" height="48" rx="5" fill="#fff" fillOpacity=".9"/>
    {/* Windows */}
    <rect x="38" y="63" width="20" height="14" rx="3" fill="#d96f22" fillOpacity=".5"/>
    <rect x="65" y="63" width="16" height="14" rx="3" fill="#d96f22" fillOpacity=".4"/>
    <rect x="94" y="48" width="24" height="17" rx="3" fill="#d96f22" fillOpacity=".4"/>
    {/* Orange stripe */}
    <rect x="28" y="82" width="98" height="5" rx="2.5" fill="#d96f22"/>
    {/* Wheels */}
    <circle cx="52" cy="90" r="10" fill="rgba(0,0,0,.35)" stroke="rgba(255,255,255,.5)" strokeWidth="2"/>
    <circle cx="52" cy="90" r="5" fill="rgba(255,255,255,.3)"/>
    <circle cx="112" cy="90" r="10" fill="rgba(0,0,0,.35)" stroke="rgba(255,255,255,.5)" strokeWidth="2"/>
    <circle cx="112" cy="90" r="5" fill="rgba(255,255,255,.3)"/>
    {/* Speed lines */}
    <line x1="2" y1="68" x2="22" y2="68" stroke="rgba(255,255,255,.4)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="2" y1="76" x2="18" y2="76" stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeLinecap="round"/>
    <line x1="2" y1="84" x2="14" y2="84" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Checkmark badge */}
    <circle cx="152" cy="32" r="18" fill="rgba(255,255,255,.18)"/>
    <circle cx="152" cy="32" r="13" fill="rgba(255,255,255,.95)"/>
    <path d="M145 32 l5 6 10-11" stroke="#d96f22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
];

const STEP_COLORS = [
  { bg: 'linear-gradient(150deg, #0a1f0f 0%, #1a4522 55%, #1F5F2E 100%)', accent: '#35964a' },
  { bg: 'linear-gradient(150deg, #0f2d14 0%, #1F5F2E 50%, #2a7a3a 100%)', accent: '#4ade80' },
  { bg: 'linear-gradient(150deg, #7a3810 0%, #d96f22 55%, #FF8C42 100%)', accent: '#ffd860' },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOnboardingCompleted();
      onComplete();
    }
  };

  const handleSkip = () => {
    setOnboardingCompleted();
    onComplete();
  };

  const step = ONBOARDING_STEPS[currentStep];
  const colors = STEP_COLORS[currentStep];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-5 transition-all duration-500"
      style={{ background: colors.bg }}
    >
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-15%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${colors.accent}30 0%, transparent 65%)`, transition: 'background .5s ease' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,66,.12) 0%, transparent 65%)' }} />
      </div>

      {/* Skip */}
      <button
        onClick={handleSkip}
        className="absolute top-5 right-5 text-xs transition-colors z-10"
        style={{ color: 'rgba(255,255,255,.45)', fontWeight: 600, letterSpacing: '.02em', border: 'none', background: 'transparent', cursor: 'pointer' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.85)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.45)'; }}
      >
        Pomiń →
      </button>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

        {/* Logo */}
        <div className="mb-8 anim-fade-up">
          <div className="px-5 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,.95)', boxShadow: '0 6px 28px rgb(0 0 0 / .28)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Camper Mannt" style={{ height: 40, width: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-6">
          {ONBOARDING_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className="rounded-full transition-all"
              style={{
                width: i === currentStep ? 28 : 8,
                height: 8,
                background: i === currentStep
                  ? '#FF8C42'
                  : i < currentStep
                  ? 'rgba(255,255,255,.50)'
                  : 'rgba(255,255,255,.20)',
                border: 'none', cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          className="w-full anim-scale-in"
          style={{
            background: 'rgba(255,255,255,.09)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,.16)',
            borderRadius: '28px',
            boxShadow: '0 28px 70px rgb(0 0 0 / .28)',
            overflow: 'hidden',
          }}
        >
          {/* Illustration */}
          <div className="flex justify-center pt-6 pb-4 px-6">
            <div className="anim-float" style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 40px rgb(0 0 0 / .28)' }}>
              {STEP_ILLUSTRATION[currentStep]}
            </div>
          </div>

          {/* Text content */}
          <div className="px-7 pb-7 text-center text-white">
            {/* Step badge */}
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4 text-xs"
              style={{ background: 'rgba(255,255,255,.15)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}
            >
              {currentStep + 1} / {ONBOARDING_STEPS.length}
            </div>

            <h2 className="text-white mb-3" style={{ fontWeight: 900, fontSize: '1.375rem', letterSpacing: '-.04em', lineHeight: 1.2 }}>
              {step.title}
            </h2>
            <p style={{ color: 'rgba(255,255,255,.72)', fontSize: '.9375rem', lineHeight: 1.65 }}>
              {step.content}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2.5 w-full">
          <button onClick={handleNext} className="btn btn-amber btn-lg btn-full">
            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14l4 4v4a2 2 0 01-2 2h-2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
                </svg>
                Zacznijmy!
              </>
            ) : 'Dalej →'}
          </button>
          <button
            onClick={handleSkip}
            className="py-2 text-xs transition-colors"
            style={{ color: 'rgba(255,255,255,.38)', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer', letterSpacing: '.01em' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.75)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.38)'; }}
          >
            Pomiń wprowadzenie
          </button>
        </div>
      </div>
    </div>
  );
}
