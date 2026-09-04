import { NavLink, Route, Routes } from 'react-router-dom'

import { AuthPage } from './features/auth/AuthPage'
import { SupabaseSetupNotice } from './features/auth/SupabaseSetupNotice'
import { useAuth } from './features/auth/auth-context'
import { useOrganizationContext } from './features/organization/useOrganizationContext'
import { WorkspaceSetup } from './features/organization/WorkspaceSetup'

const navigationItems = [
  { label: 'Dzisiaj', path: '/' },
  { label: 'Planowanie', path: '/planowanie' },
  { label: 'Produkcja', path: '/produkcja' },
  { label: 'Receptury', path: '/receptury' },
  { label: 'Produkty', path: '/produkty' },
  { label: 'Zakupy', path: '/zakupy' },
  { label: 'Raporty', path: '/raporty' },
  { label: 'Ustawienia', path: '/ustawienia' },
]

const todaysSignals = [
  { label: 'Najbliższe wydania', value: '3', tone: 'info' },
  { label: 'Zadania opóźnione', value: '2', tone: 'danger' },
  { label: 'Braki produktów', value: '5', tone: 'warning' },
  { label: 'Stanowiska aktywne', value: '6', tone: 'success' },
]

const stationLoad = [
  { station: 'Zimna kuchnia', load: 72 },
  { station: 'Ciepła kuchnia', load: 88 },
  { station: 'Cukiernia', load: 54 },
  { station: 'Pakowanie', load: 64 },
]

function TodayPage() {
  return (
    <div className="screen-stack">
      <section className="toolbar-band" aria-labelledby="today-heading">
        <div>
          <p className="eyebrow">Piątek, 4 września 2026</p>
          <h1 id="today-heading">Dzisiaj</h1>
          <p className="page-lead">
            Wspólny podgląd wydań, zadań, braków i obciążenia stanowisk dla bieżącego dnia
            produkcyjnego.
          </p>
        </div>
        <button className="primary-action" type="button">
          Dodaj zapotrzebowanie
        </button>
      </section>

      <section className="metrics-grid" aria-label="Najważniejsze sygnały">
        {todaysSignals.map((signal) => (
          <article className={`metric-card metric-card--${signal.tone}`} key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Najbliższe wydania</h2>
            <span className="status-pill status-pill--info">Plan aktywny</span>
          </div>
          <div className="work-list">
            <div className="work-row">
              <strong>07:30</strong>
              <span>Śniadanie hotelowe, 118 osób</span>
              <em>Bufet</em>
            </div>
            <div className="work-row">
              <strong>11:00</strong>
              <span>Coffee break konferencja Alfa</span>
              <em>Event</em>
            </div>
            <div className="work-row">
              <strong>15:30</strong>
              <span>Pakowanie diet 1800 kcal</span>
              <em>Diety</em>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Obciążenie stanowisk</h2>
            <span className="status-pill status-pill--warning">Wymaga uwagi</span>
          </div>
          <div className="load-list">
            {stationLoad.map((item) => (
              <div className="load-row" key={item.station}>
                <div>
                  <span>{item.station}</span>
                  <strong>{item.load}%</strong>
                </div>
                <meter min="0" max="100" value={item.load}>
                  {item.load}%
                </meter>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="toolbar-band" aria-labelledby="placeholder-heading">
      <div>
        <p className="eyebrow">Etap 1</p>
        <h1 id="placeholder-heading">{title}</h1>
        <p className="page-lead">
          Ten obszar ma przygotowaną trasę i miejsce w nawigacji. Szczegółowa logika domenowa
          zostanie dodana w kolejnych etapach.
        </p>
      </div>
    </section>
  )
}

function LoadingScreen() {
  return (
    <main className="auth-layout">
      <section className="auth-panel" aria-live="polite">
        <p className="eyebrow">KuchniaPlan</p>
        <h1>Sprawdzanie sesji</h1>
        <p className="page-lead">Ładuję informacje o zalogowanym użytkowniku.</p>
      </section>
    </main>
  )
}

function ProtectedAppShell() {
  const { signOut, user } = useAuth()
  const organizationContext = useOrganizationContext(user?.id)
  const placeholderRoutes = navigationItems.slice(1)

  if (organizationContext.isLoading && organizationContext.organizations.length === 0) {
    return <LoadingScreen />
  }

  if (organizationContext.organizations.length === 0) {
    return (
      <WorkspaceSetup
        error={organizationContext.error}
        isLoading={organizationContext.isLoading}
        onCreate={organizationContext.createWorkspace}
      />
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Główne obszary">
        <div className="brand">
          <span aria-hidden="true">KP</span>
          <div>
            <strong>KuchniaPlan</strong>
            <small>Plan produkcji</small>
          </div>
        </div>
        <nav>
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end={item.path === '/'}
              key={item.path}
              to={item.path}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="context-bar">
          <label>
            Organizacja
            <select
              onChange={(event) =>
                organizationContext.setSelectedOrganizationId(event.target.value)
              }
              value={organizationContext.selectedOrganization?.id ?? ''}
            >
              {organizationContext.organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lokalizacja
            <select
              onChange={(event) => organizationContext.setSelectedLocationId(event.target.value)}
              value={organizationContext.selectedLocation?.id ?? ''}
            >
              {organizationContext.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          <span>Dzień produkcyjny: 04.09.2026</span>
          <button className="text-action context-action" onClick={signOut} type="button">
            Wyloguj
          </button>
        </header>
        <Routes>
          <Route path="/" element={<TodayPage />} />
          {placeholderRoutes.map((route) => (
            <Route
              element={<PlaceholderPage title={route.label} />}
              key={route.path}
              path={route.path}
            />
          ))}
        </Routes>
      </main>
    </div>
  )
}

export function App() {
  const { status } = useAuth()

  if (status === 'unconfigured') {
    return <SupabaseSetupNotice />
  }

  if (status === 'checking') {
    return <LoadingScreen />
  }

  if (status === 'anonymous') {
    return <AuthPage />
  }

  return <ProtectedAppShell />
}

export default App
