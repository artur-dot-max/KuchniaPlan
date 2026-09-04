import { NavLink, Route, Routes } from 'react-router-dom'

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

export function App() {
  const placeholderRoutes = navigationItems.slice(1)

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
          <span>Lokalizacja: Kuchnia testowa</span>
          <span>Dzień produkcyjny: 04.09.2026</span>
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

export default App
