import type { Metadata } from 'next';
import Link from 'next/link';

// Static export compatible

export const metadata: Metadata = {
  title: 'Polityka Prywatności — Mannt Check',
  description: 'Polityka Prywatności aplikacji Mannt Check',
};

export default function PolitykaPrywatnosci() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #061610 0%, #0c2416 20%, #153a1e 45%, #1a4d28 70%, #1f5830 100%)' }}>
      <div className="max-w-2xl mx-auto px-5 py-10">
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
          <img src="/logo-header.png" alt="Camper Mannt" style={{ height: 40, width: 'auto', marginBottom: 28 }} />

          <h1 style={{ fontWeight: 900, fontSize: '1.75rem', letterSpacing: '-.04em', color: '#111827', marginBottom: 8 }}>
            Polityka Prywatności
          </h1>
          <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: 32 }}>Ostatnia aktualizacja: 2 maja 2026 r.</p>

          <div style={{ color: '#374151', lineHeight: 1.75, fontSize: '.9375rem' }} className="space-y-6">

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>1. Administrator danych</h2>
              <p>Administratorem danych osobowych jest <strong>Camper Mannt</strong>.</p>
              <p style={{ marginTop: 8 }}>Kontakt w sprawach prywatności: <a href="mailto:camper@mannt.pl" style={{ color: '#1a4522', fontWeight: 600 }}>camper@mannt.pl</a></p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>2. Jakie dane zbieramy</h2>
              <p>Aplikacja zbiera dane niezbędne do świadczenia usług serwisowych i prowadzenia konta:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc', lineHeight: 1.8 }}>
                <li><strong>Dane konta:</strong> Nick (pseudonim) oraz zaszyfrowane hasło.</li>
                <li><strong>Dane pojazdu:</strong> Marka, model, rok, przebieg, numer rejestracyjny oraz numer VIN (opcjonalnie).</li>
                <li><strong>Dane zgłoszeń serwisowych:</strong> Adres e-mail kontaktowy, treść zgłoszenia oraz <strong>zdjęcia dokumentujące usterkę</strong> przesyłane przez Użytkownika.</li>
                <li><strong>Dane techniczne:</strong> Token sesji, adres IP (wyłącznie w logach serwera dla bezpieczeństwa).</li>
              </ul>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>3. Cel i podstawa przetwarzania</h2>
              <p>Dane przetwarzane są w celu:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc', lineHeight: 1.8 }}>
                <li>Wykonania umowy o świadczenie usług drogą elektroniczną (art. 6 ust. 1 lit. b RODO).</li>
                <li><strong>Obsługi zgłoszeń serwisowych</strong> i komunikacji z Użytkownikiem (prawnie uzasadniony interes — art. 6 ust. 1 lit. f RODO).</li>
                <li>Zapewnienia bezpieczeństwa aplikacji i ochrony przed nadużyciami.</li>
              </ul>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>4. Odbiorcy danych</h2>
              <p>Dane mogą być przekazywane zaufanym podmiotom współpracującym, wyłącznie w celu realizacji usług:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc', lineHeight: 1.8 }}>
                <li><strong>Cloudflare:</strong> Dostawca infrastruktury hostingowej i bezpieczeństwa.</li>
                <li><strong>Dostawcy usług pocztowych:</strong> W celu przesyłania zgłoszeń serwisowych z załącznikami (zdjęciami) do Operatora.</li>
              </ul>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>5. Przechowywanie zdjęć i plików</h2>
              <p>Zdjęcia przesyłane w zgłoszeniach serwisowych są przekazywane bezpośrednio do Operatora i nie są publicznie udostępniane. Operator przechowuje je przez okres niezbędny do realizacji zgłoszenia lub do czasu wycofania zgody przez Użytkownika.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <section>
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 10 }}>6. Prawa Użytkownika</h2>
              <p>Przysługuje Ci prawo do dostępu, sprostowania, usunięcia danych, ograniczenia przetwarzania, przenoszenia danych oraz wniesienia sprzeciwu. W celu realizacji praw skontaktuj się z nami pod adresem: <a href="mailto:camper@mannt.pl" style={{ color: '#1a4522', fontWeight: 600 }}>camper@mannt.pl</a>.</p>
            </section>

            <section style={{ marginTop: 30, padding: '20px', background: '#f9fafb', borderRadius: 16, border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '.85rem', color: '#4b5563' }}>Korzystając z formularza zgłoszenia serwisowego i załączając zdjęcia, dobrowolnie wyrażasz zgodę na ich przetwarzanie przez Mannt Serwis Kielce w celu obsługi Twojego zapytania.</p>
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
      </div>
    </div>
  );
}
