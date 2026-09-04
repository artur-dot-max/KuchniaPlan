export function SupabaseSetupNotice() {
  return (
    <main className="auth-layout">
      <section className="auth-panel" aria-labelledby="setup-heading">
        <p className="eyebrow">Konfiguracja</p>
        <h1 id="setup-heading">Połącz Supabase</h1>
        <p className="page-lead">
          Utwórz plik `.env.local`, wpisz publiczny adres projektu oraz `anon key`, a potem uruchom
          aplikację ponownie.
        </p>
        <pre className="code-block">
          VITE_SUPABASE_URL=https://faoisqiulgowkqmqjumc.supabase.co{'\n'}
          VITE_SUPABASE_ANON_KEY=...
        </pre>
      </section>
    </main>
  )
}
