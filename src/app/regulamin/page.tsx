import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
          <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: 32 }}>Ostatnia aktualizacja: 19 kwietnia 2025 r.</p>

          <div style={{ color: '#374151', lineHeight: 1.75, fontSize: '.9375rem' }} className="space-y-6">

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§1. Postanowienia ogólne</h2>
              <p>Niniejszy Regulamin określa zasady korzystania z aplikacji internetowej <strong>Mannt Check</strong> (dalej: „Aplikacja"), dostępnej pod adresem <a href="https://thr-50b4d891-mannt-check.nxcode-io.workers.dev" style={{ color: '#1a4522' }}>mannt-check.nxcode-io.workers.dev</a> oraz jako aplikacja PWA na urządzeniach mobilnych.</p>
              <p style={{ marginTop: 8 }}>Operatorem Aplikacji jest firma <strong>Mannt Serwis Kielce</strong> z siedzibą w Kielcach, świadcząca usługi serwisowe i budowy zabudów kamperów.</p>
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
                <li>Asystent techniczny AI (Majster Mannt)</li>
                <li>Synchronizacja danych między urządzeniami po zalogowaniu</li>
              </ul>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§3. Konto użytkownika</h2>
              <p>Korzystanie z pełni funkcjonalności Aplikacji wymaga założenia konta. Użytkownik podaje nick (pseudonim) oraz hasło. Nie są wymagane dane osobowe takie jak imię, nazwisko czy adres e-mail.</p>
              <p style={{ marginTop: 8 }}>Użytkownik jest zobowiązany do nieudostępniania swojego hasła osobom trzecim. Operator nie ponosi odpowiedzialności za nieuprawniony dostęp wynikający z nieostrożności Użytkownika.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§4. Dane i synchronizacja</h2>
              <p>Dane wprowadzone przez Użytkownika są przechowywane lokalnie na urządzeniu (localStorage) oraz, po zalogowaniu, synchronizowane z serwerem Operatora w celu umożliwienia dostępu z różnych urządzeń.</p>
              <p style={{ marginTop: 8 }}>Operator nie sprzedaje ani nie udostępnia danych Użytkownika osobom trzecim.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§5. Usunięcie konta</h2>
              <p>Użytkownik może w każdej chwili usunąć swoje konto wraz ze wszystkimi danymi. Funkcja dostępna jest w zakładce <strong>Pojazd → Ustawienia konta</strong>. Usunięcie jest nieodwracalne.</p>
              <p style={{ marginTop: 8 }}>Żądanie usunięcia danych można również zgłosić mailowo: <a href="mailto:camper@mannt.pl" style={{ color: '#1a4522', fontWeight: 600 }}>camper@mannt.pl</a></p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§6. Odpowiedzialność</h2>
              <p>Aplikacja jest udostępniana w stanie „takim, jakim jest". Operator dokłada starań, aby działała bez zakłóceń, lecz nie gwarantuje nieprzerwanej dostępności. Operator nie ponosi odpowiedzialności za decyzje podjęte na podstawie danych wprowadzonych przez Użytkownika.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§7. Zmiany Regulaminu</h2>
              <p>Operator zastrzega sobie prawo do zmiany Regulaminu. O istotnych zmianach Użytkownicy zostaną poinformowani poprzez komunikat w Aplikacji.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>§8. Kontakt</h2>
              <p>Wszelkie pytania dotyczące Regulaminu prosimy kierować na adres:</p>
              <p style={{ marginTop: 8 }}><a href="mailto:camper@mannt.pl" style={{ color: '#1a4522', fontWeight: 700, fontSize: '1rem' }}>camper@mannt.pl</a></p>
              <p style={{ marginTop: 4 }}><a href="https://mannt.pl" target="_blank" rel="noopener noreferrer" style={{ color: '#1a4522' }}>mannt.pl</a></p>
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
          © 2025 Mannt Serwis Kielce
        </p>
      </div>
    </div>
  );
}
