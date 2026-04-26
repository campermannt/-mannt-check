import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Polityka Prywatności — Mannt Check',
  description: 'Polityka Prywatności aplikacji Mannt Check',
};

export default function PolitykaPrywatnosci() {
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
            Polityka Prywatności
          </h1>
          <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: 32 }}>Ostatnia aktualizacja: 19 kwietnia 2025 r.</p>

          <div style={{ color: '#374151', lineHeight: 1.75, fontSize: '.9375rem' }} className="space-y-6">

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>1. Administrator danych</h2>
              <p>Administratorem danych osobowych jest <strong>Mannt Serwis Kielce</strong>.</p>
              <p style={{ marginTop: 8 }}>Kontakt w sprawach prywatności: <a href="mailto:camper@mannt.pl" style={{ color: '#1a4522', fontWeight: 600 }}>camper@mannt.pl</a></p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>2. Jakie dane zbieramy</h2>
              <p>Aplikacja zbiera wyłącznie dane, które Użytkownik sam wprowadza:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc', lineHeight: 2 }}>
                <li><strong>Nick (pseudonim)</strong> — używany jako login, nie jest to imię ani nazwisko</li>
                <li><strong>Hasło</strong> — przechowywane wyłącznie w postaci zaszyfrowanej (SHA-256 + sól)</li>
                <li><strong>Dane pojazdu</strong> — marka, model, rok, przebieg, numer rejestracyjny (opcjonalny)</li>
                <li><strong>Checklisty i wpisy serwisowe</strong> — treści wprowadzone przez Użytkownika</li>
                <li><strong>Dane techniczne sesji</strong> — token sesji (ważny 30 dni), przechowywany w localStorage</li>
              </ul>
              <p style={{ marginTop: 8 }}>Nie zbieramy adresów e-mail, numerów telefonów, adresów zamieszkania ani żadnych innych danych osobowych.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>3. Cel i podstawa przetwarzania</h2>
              <p>Dane przetwarzane są wyłącznie w celu świadczenia usługi Mannt Check (art. 6 ust. 1 lit. b RODO — wykonanie umowy):</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc', lineHeight: 2 }}>
                <li>Uwierzytelnienie Użytkownika (logowanie)</li>
                <li>Synchronizacja danych między urządzeniami</li>
                <li>Przechowywanie historii serwisowej pojazdu</li>
              </ul>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>4. Przechowywanie danych</h2>
              <p>Dane przechowywane są na serwerach Cloudflare (infrastruktura Workers/KV) zlokalizowanych na terenie UE lub w krajach zapewniających odpowiedni poziom ochrony danych zgodnie z RODO.</p>
              <p style={{ marginTop: 8 }}>Dane lokalne (localStorage) przechowywane są wyłącznie na urządzeniu Użytkownika.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>5. Udostępnianie danych</h2>
              <p>Dane Użytkownika <strong>nie są sprzedawane ani udostępniane</strong> osobom trzecim w celach marketingowych ani innych celach komercyjnych.</p>
              <p style={{ marginTop: 8 }}>Dane techniczne mogą być przetwarzane przez dostawcę infrastruktury (Cloudflare) wyłącznie w zakresie niezbędnym do świadczenia usługi hostingowej.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>6. Prawa Użytkownika (RODO)</h2>
              <p>Zgodnie z RODO przysługują Ci następujące prawa:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc', lineHeight: 2 }}>
                <li><strong>Prawo dostępu</strong> — możesz zażądać informacji o przetwarzanych danych</li>
                <li><strong>Prawo do sprostowania</strong> — możesz poprawić swoje dane w aplikacji</li>
                <li><strong>Prawo do usunięcia (prawo do bycia zapomnianym)</strong> — możesz usunąć konto i wszystkie dane jednym kliknięciem w zakładce <em>Pojazd → Ustawienia konta</em>, lub wysyłając e-mail na <a href="mailto:camper@mannt.pl" style={{ color: '#1a4522', fontWeight: 600 }}>camper@mannt.pl</a></li>
                <li><strong>Prawo do przenoszenia danych</strong> — na żądanie udostępnimy dane w formacie JSON</li>
                <li><strong>Prawo do wniesienia skargi</strong> — do Prezesa Urzędu Ochrony Danych Osobowych (UODO)</li>
              </ul>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>7. Pliki cookie i localStorage</h2>
              <p>Aplikacja nie używa plików cookie (cookies) do śledzenia Użytkownika. Korzystamy wyłącznie z <strong>localStorage</strong> przeglądarki do:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc', lineHeight: 2 }}>
                <li>Przechowywania tokenu sesji (logowania)</li>
                <li>Lokalnego cache danych pojazdu i checklisty</li>
                <li>Ustawień interfejsu (tryb ciemny)</li>
              </ul>
              <p style={{ marginTop: 8 }}>Te dane nie opuszczają urządzenia Użytkownika, z wyjątkiem synchronizacji z serwerem po zalogowaniu.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>8. Kontakt w sprawach prywatności</h2>
              <p>W sprawach dotyczących ochrony danych osobowych prosimy o kontakt:</p>
              <div style={{ marginTop: 12, padding: '16px 20px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #86efac' }}>
                <p style={{ fontWeight: 700, color: '#15803d' }}>Mannt Serwis Kielce</p>
                <p style={{ marginTop: 4 }}>E-mail: <a href="mailto:camper@mannt.pl" style={{ color: '#1a4522', fontWeight: 700 }}>camper@mannt.pl</a></p>
                <p style={{ marginTop: 2 }}>Strona: <a href="https://mannt.pl" target="_blank" rel="noopener noreferrer" style={{ color: '#1a4522' }}>mannt.pl</a></p>
              </div>
            </section>

          </div>

          <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/regulamin" style={{ color: '#1a4522', fontWeight: 700, fontSize: '.875rem', textDecoration: 'underline' }}>
              Regulamin
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
