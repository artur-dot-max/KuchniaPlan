# KuchniaPlan

KuchniaPlan to aplikacja PWA do planowania produkcji gastronomicznej dla hoteli,
cateringu eventowego i cateringu dietetycznego. Repozytorium zawiera fundament
Etapu 1: React, TypeScript, Vite, routing, PWA, testy i podstawowy interfejs
operacyjny.

## Stos

- React + TypeScript + Vite
- React Router
- Supabase client
- IndexedDB przez `idb`
- Vite PWA
- ESLint, Prettier, Vitest, Playwright

## Uruchomienie

```powershell
npm install
npm run dev
```

## Weryfikacja

```powershell
npm run lint
npm run format
npm run test
npm run build
npm run test:e2e
```

## Zmienne środowiskowe

Skopiuj `.env.example` do `.env.local` i uzupełnij publiczny URL oraz klucz anon
Supabase. Klucza administracyjnego Supabase nie wolno umieszczać w aplikacji ani
w repozytorium.

## Zakres aktualnego fundamentu

- główna nawigacja: Dzisiaj, Planowanie, Produkcja, Receptury, Produkty, Zakupy,
  Raporty, Ustawienia;
- ekran Dzisiaj jako pierwszy widok operacyjny;
- podstawowy system wizualny dla pracy na komputerze, tablecie i telefonie;
- konfiguracja PWA z manifestem i automatyczna aktualizacja service workera;
- miejsce na klienta Supabase i lokalna baza IndexedDB dla przyszłego trybu
  offline.
