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

Projekt Supabase:
`https://supabase.com/dashboard/project/faoisqiulgowkqmqjumc`

Publiczny adres API:
`https://faoisqiulgowkqmqjumc.supabase.co`

## Zakres aktualnego fundamentu

- główna nawigacja: Dzisiaj, Planowanie, Produkcja, Receptury, Produkty, Zakupy,
  Raporty, Ustawienia;
- ekran Dzisiaj jako pierwszy widok operacyjny;
- podstawowy system wizualny dla pracy na komputerze, tablecie i telefonie;
- konfiguracja PWA z manifestem i automatyczna aktualizacja service workera;
- miejsce na klienta Supabase i lokalna baza IndexedDB dla przyszłego trybu
  offline.

## Etap 2

Pierwsza migracja Supabase znajduje się w
`supabase/migrations/20260904212000_create_access_foundation.sql`. Definiuje
organizacje, lokalizacje, profile użytkowników, członkostwa i podstawowe
polityki RLS oparte na `auth.uid()` oraz aktywnym członkostwie w organizacji.

Po ustawieniu `.env.local` i zastosowaniu migracji aplikacja pokazuje ekran
logowania. Po pierwszym logowaniu użytkownik może utworzyć organizację i
lokalizację, a system zapisze go jako właściciela organizacji.

Migracja `20260904214500_create_initial_workspace_rpc.sql` dodaje funkcję RPC,
która tworzy pierwszą organizację, członkostwo właściciela i lokalizację w jednej
transakcji. Jest potrzebna do poprawnego startu przy włączonym RLS.

## Etap 3

Migracja `20260904221000_create_products_foundation.sql` dodaje fundament kart
produktów: jednostki, alergeny, dostawców, produkty, przeliczniki, opakowania i
historię cen. Tabele są izolowane przez `organization_id` i polityki RLS.

Ekran `Produkty` pozwala dodać pierwsze jednostki, dostawców i podstawowe karty
produktów dla wybranej organizacji.
