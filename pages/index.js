const navItems = [
  ['Predicciones', '/picks'],
  ['Ranking', '/leaderboard'],
  ['Torneo', '/tournament'],
  ['Comparar', '/compare']
]

const features = [
  ['Top10 con multiplicadores', 'Cada participante ordena sus diez selecciones. El primer puesto multiplica por 10 y el décimo por 1.'],
  ['Ranking vivo', 'Los puntos se recalculan con goles, resultados, tarjetas y progresión del torneo.'],
  ['Bracket conectado', 'Cuando se cierra una fase, el cuadro se actualiza y arrastra clasificados a la siguiente ronda.'],
  ['Comparador de porras', 'Mira equipos comunes, diferenciales y distancia real entre participantes.']
]

export default function Home() {
  return (
    <main className="page">
      <div className="shell">
        <nav className="top-nav">
          <a className="brand-mark" href="/">
            <span className="brand-dot">26</span>
            <span>Porra Mundial</span>
          </a>
          <div className="nav-links">
            {navItems.map(([label, href]) => <a key={href} className="nav-link" href={href}>{label}</a>)}
          </div>
        </nav>

        <section className="hero">
          <div className="hero-panel">
            <p className="eyebrow">Mundial 2026</p>
            <h1>La porra que se sigue como un torneo real</h1>
            <p className="hero-copy">
              Elige tu Top10, sigue grupos y eliminatorias, compara estrategias y mira cómo cada gol mueve el ranking.
            </p>
            <div className="hero-actions">
              <a className="btn btn-secondary" href="/picks">Enviar Top10</a>
              <a className="btn btn-primary" href="/tournament">Ver torneo</a>
            </div>
          </div>

          <div className="side-stack">
            <div className="feature-card">
              <strong>Reglas claras</strong>
              <p>Goles, victorias, empates, rojas y bonus de fase suman puntos de equipo. Tu ranking multiplica esa puntuación.</p>
            </div>
            <div className="feature-card">
              <strong>Bloqueo de picks</strong>
              <p>Las predicciones se cierran el día del primer partido del Mundial, antes de que empiece la fiesta.</p>
            </div>
            <div className="feature-card">
              <strong>Panel admin</strong>
              <p>Un único sitio para meter goles, rojas, desempates de eliminatoria y recalcular todo.</p>
              <div style={{ marginTop: 16 }}>
                <a className="ghost-link" href="/admin">Entrar al admin</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Cómo se juega</h2>
            <a className="ghost-link" href="/leaderboard">Ver ranking</a>
          </div>
          <div className="card-grid">
            {features.map(([title, copy]) => (
              <article key={title} className="panel">
                <h3>{title}</h3>
                <p className="muted">{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
