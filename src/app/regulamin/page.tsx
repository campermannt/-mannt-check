import type { Metadata } from 'next';
import Link from 'next/link';

// Static export compatible

export const metadata: Metadata = {
  title: 'Regulamin — Mannt Check',
  description: 'Regulamin aplikacji Mannt Check',
};

export default function RegulamPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #061610 0%, #0c2416 20%, #153a1e 45%, #1a4d28 70%, #1f5830 100%)' }}>
      <div className="max-w-2xl mx-auto px-5 py-10">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-8"
          style={{ color: 'rgba(255,255,255,.55)', textDecoration: 'none', fontWeight: 600 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Powrót do aplikacji
        </Link>

        <div style={{ background: '#ffffff', borderRadius: 24, padding: '40px 36px', boxShadow: '0 40px 100px rgba(0,0,0,.36)' }}>
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-header.png" alt="Camper Mannt" style={{ height: 40, width: 'auto', marginBottom: 28 }} />

          <h1 style={{ fontWeight: 900, fontSize: '1.75rem', letterSpacing: '-.04em', color: '#111827', marginBottom: 8 }}>
            Regulamin aplikacji Mannt Check
          </h1>
          <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: 32 }}>Ostatnia aktualizacja: 2 maja 2026 r.</p>

          <div style={{ color: '#374151', lineHeight: 1.75, fontSize: '.9375rem' }} className="space-y-6">

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§1. Postanowienia ogólne</h2>
              <p>Niniejszy Regulamin określa zasady korzystania z aplikacji internetowej <strong>Mannt Check</strong> (dalej: „Aplikacja"), której operatorem jest firma <strong>Camper Mannt</strong>.</p>
              <p style={{ marginTop: 8 }}>Kontakt: <a href="mailto:camper@mannt.pl" style={{ color: '#1a4522', fontWeight: 600 }}>camper@mannt.pl</a></p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§2. Zakres usług</h2>
              <p>Aplikacja Mannt Check oferuje następujące funkcje:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc', lineHeight: 2 }}>
                <li>Zarządzanie danymi pojazdu (kampera, przyczepy kempingowej)</li>
                <li>Prowadzenie checklisty przed wyjazdem</li>
                <li>Dziennik serwisowy — rejestracja wykonanych napraw i przeglądów</li>
                <li>Kalkulator kosztów podróży</li>
                <li><strong>Elektroniczne zgłoszenia serwisowe</strong> wraz z możliwością przesyłania dokumentacji fotograficznej</li>
                <li>Asystent techniczny AI (Majster Mannt)</li>
              </ul>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§3. Przesyłanie treści i zdjęć</h2>
              <p>Użytkownik przesyłający zdjęcia w ramach zgłoszenia serwisowego oświadcza, że posiada prawo do dysponowania przesyłanymi materiałami oraz wyraża zgodę na ich przetwarzanie przez Operatora wyłącznie w celu realizacji usługi serwisowej.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§4. Dane i synchronizacja</h2>
              <p>Dane wprowadzone przez Użytkownika są przechowywane lokalnie na urządzeniu oraz synchronizowane z serwerem Operatora. Szczegółowe zasady ochrony danych określa Polityka Prywatności.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§5. Odpowiedzialność</h2>
              <p>Aplikacja jest udostępniana w stanie „takim, jakim jest". Operator nie ponosi odpowiedzialności za treści przesyłane przez Użytkowników ani za decyzje podjęte na podstawie danych w aplikacji.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§6. Kontakt</h2>
              <p>Wszelkie pytania dotyczące Regulaminu prosimy kierować na adres:</p>
              <p style={{ marginTop: 8 }}><a href="mailto:camper@mannt.pl" style={{ color: '#1a4522', fontWeight: 700, fontSize: '1rem' }}>camper@mannt.pl</a></p>
            </section>

          </div>

          <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/polityka-prywatnosci" style={{ color: '#1a4522', fontWeight: 700, fontSize: '.875rem', textDecoration: 'underline' }}>
              Polityka Prywatności
            </Link>
            <Link href="/" style={{ color: '#6b7280', fontWeight: 600, fontSize: '.875rem' }}>
              ← Wróć do aplikacji
            </Link>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,.22)', fontSize: '.7rem', textAlign: 'center', marginTop: 24 }}>
          © 2025 Camper Mannt
        </p>
      </div>
    </div>
  );
}
