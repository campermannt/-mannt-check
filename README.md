# Mannt Check - Cyfrowy Opiekun Kampera

Aplikacja PWA dla użytkowników kamperów i przyczep kempingowych, stworzona z pasją przez serwis Mannt w Kielcach.

## Funkcjonalności

### 1. Autoryzacja
- Logowanie przez Google
- Pełna integracja z Nxcode Auth SDK

### 2. Onboarding (3 kroki)
- Witaj w rodzinie! - Wprowadzenie do aplikacji
- Poznaj Majstra Mannta - Prezentacja AI doradcy
- Ruszaj w drogę bez stresu - Informacje o funkcjach

### 3. Profil Pojazdu
Pełne dane techniczne:
- Marka i Model
- Rok produkcji
- Numer rejestracyjny
- Typ (Kamper/Przyczepa)
- DMC (Dopuszczalna Masa Całkowita)
- Przebieg
- Data ostatniego przeglądu szczelności

### 4. Dashboard
- Sekcja "Zaufaj profesjonalistom" z informacjami o serwisie Mannt
- Podsumowanie pojazdu
- Szybkie akcje
- Link do mannt.pl

### 5. System Checklisty
6 kategorii z gotowymi pozycjami:
- Bezpieczeństwo i dokumenty
- Instalacja wodna i gazowa
- Zabezpieczenie wnętrza i bagażu
- Stan techniczny i opony
- Zapasy i kuchnia
- Elektronika i akumulatory

Funkcje:
- Wizualizacja postępu (ogólna + per kategoria)
- Zwijanie/rozwijanie kategorii
- Zapisywanie stanu w localStorage

### 6. Dziennik Serwisowy
6 kategorii konserwacji:
- Silnik i podwozie
- Szczelność zabudowy
- Instalacja elektryczna i fotowoltaika
- Ogrzewanie i gaz
- Układ wodny i sanitarny
- Akcesoria (markizy, bagażniki)

Funkcje:
- Dodawanie wpisów (opis, data, przebieg, koszt)
- Przycisk "Zgłoś do Mannt.pl" - otwiera formularz email
- Historia wszystkich wpisów

### 7. AI Chat - Majster Mannt
Doradca techniczny oparty o Nxcode AI Gateway:
- Pomoc w rozwiązywaniu problemów na trasie
- Porady dotyczące konserwacji
- Prostym, przyjaznym językiem po polsku
- Chat pływający (floating button)
- Streaming odpowiedzi dla płynnego UX

### 8. Kalkulator Kosztów Podróży
Obliczenia:
- Dystans (km)
- Spalanie (l/100km)
- Cena paliwa (PLN/l)
- Dodatkowe koszty (opłaty drogowe, parking)

Wyniki:
- Zużycie paliwa
- Koszt paliwa
- Całkowity koszt podróży

### 9. PWA - Progressive Web App
- Manifest i metadata
- Logika instalacji po 2. akcji użytkownika
- Śledzenie akcji (action counter)
- Elegancki prompt instalacyjny
- Offline-ready architecture

## Technologie

- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS 4.0
- **Autoryzacja**: Nxcode SDK Auth
- **AI**: Nxcode AI Gateway (Gemini fast model)
- **Storage**: localStorage (can be migrated to Supabase)
- **PWA**: Service Workers, Web App Manifest

## Schemat Kolorów

- **Forest Green**: #1a4d2e (główny kolor)
- **Light Forest**: #2d7a4f (akcenty)
- **Beige**: #f5f1e8 (tło)
- **Dark Beige**: #e8dfc8 (granice)
- **Orange**: #ff8c42 (akcje, CTA)
- **Dark Orange**: #e67a32 (hover)

## Typografia

- **Duże czcionki**: 18px bazowa, skalowanie do 40px
- **Wysoki kontrast**: dla czytelności
- **System fonts**: dla szybkiego renderowania

## Struktura Projektu

```
mannt-check/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout z PWA meta
│   │   ├── page.tsx            # Main application page
│   │   └── globals.css         # Custom theme
│   ├── components/
│   │   ├── Onboarding.tsx      # 3-step onboarding
│   │   ├── VehicleForm.tsx     # Vehicle profile form
│   │   ├── Checklist.tsx       # Checklist system
│   │   ├── MaintenanceLog.tsx  # Service log
│   │   ├── MajsterMannt.tsx    # AI chat
│   │   ├── TravelCalculator.tsx # Cost calculator
│   │   └── PWAInstallPrompt.tsx # PWA install UI
│   ├── modules/
│   │   ├── auth/               # Nxcode Auth integration
│   │   └── ai/                 # Nxcode AI integration
│   ├── hooks/
│   │   └── usePWAInstall.ts    # PWA install logic
│   ├── lib/
│   │   └── storage.ts          # localStorage utilities
│   └── types/
│       └── index.ts            # TypeScript types
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icon-info.txt           # Icon requirements
└── package.json
```

## Uruchomienie

```bash
# Zainstaluj zależności
npm install

# Uruchom serwer deweloperski
npm run dev

# Otwórz http://localhost:5173
```

## Deployment

Aplikacja jest gotowa do deployu na Cloudflare Workers za pomocą nxcode CLI:

```bash
nxcode deploy --type frontend
```

## Następne Kroki

### Przed produkcją:
1. **Ikony PWA**: Stwórz icon-192.png i icon-512.png
2. **Supabase**: Opcjonalnie zmigruj z localStorage na Supabase
3. **Service Worker**: Dodaj SW dla offline functionality
4. **Testing**: Przetestuj na różnych urządzeniach
5. **SEO**: Dodaj meta tagi i structured data

### Możliwe rozszerzenia:
- Push notifications dla przypomnień o przeglądach
- Sync danych między urządzeniami
- Galeria zdjęć pojazdu
- Export danych do PDF
- Integracja z kalendarzem (przypomnienia)
- Społeczność użytkowników (forum, tips)

## Wsparcie

Stworzono z ❤️ przez serwis Mannt w Kielcach.

Pytania? Odwiedź [mannt.pl](https://mannt.pl) lub napisz na kontakt@mannt.pl

---

**Technologia**: Powered by Nxcode Platform
