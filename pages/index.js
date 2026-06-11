import { SCORING_RULES } from '../lib/scoring'

const navItems = [
  ['Predicciones', '/picks'],
  ['Ranking', '/leaderboard'],
  ['Simular', '/simulate'],
  ['Torneo', '/tournament'],
  ['Comparar', '/compare'],
  ['Admin', '/admin']
]

const scoringRows = [
  ['Gol a favor', SCORING_RULES.goalFor],
  ['Gol en contra', SCORING_RULES.goalAgainst],
  ['Tarjeta roja', SCORING_RULES.redCard],
  ['Victoria', SCORING_RULES.win],
  ['Empate', SCORING_RULES.draw],
  ['1º de grupo', SCORING_RULES.groupWinner],
  ['2º de grupo', SCORING_RULES.groupRunnerUp],
  ['3º clasificado', SCORING_RULES.groupThird],
  ['Llegar a 16vos', SCORING_RULES.reachRoundOf32],
  ['Llegar a 8vos', SCORING_RULES.reachRoundOf16],
  ['Llegar a cuartos', SCORING_RULES.reachQuarterFinal],
  ['Llegar a semis', SCORING_RULES.reachSemiFinal],
  ['Llegar a la final', SCORING_RULES.reachFinal],
  ['Tercer puesto', SCORING_RULES.thirdPlace],
  ['Campeón', SCORING_RULES.champion]
]

function formatPoints(value) {
  return value > 0 ? `+${value}` : String(value)
}

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
          <div className="hero-panel" style={{ minHeight: 460 }}>
            <p className="eyebrow">Mundial 2026</p>
            <h1>Haz tu Top10</h1>
            <p className="hero-copy">
              Elige tus selecciones, sigue el ranking y mira cómo cada resultado cambia la porra.
            </p>
            <div className="hero-actions">
              <a className="btn btn-secondary" href="/picks">Enviar predicción</a>
              <a className="btn btn-primary" href="/leaderboard">Ver ranking</a>
              <a className="btn btn-secondary" href="/simulate">Simular puntos</a>
            </div>
          </div>

          <aside className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 18 }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--brand)' }}>Resumen</p>
              <h2 style={{ margin: 0, fontSize: 30, lineHeight: 1.05 }}>Simple: eliges 10 equipos.</h2>
              <p className="muted" style={{ lineHeight: 1.6 }}>
                El #1 multiplica x10, el #2 x9, y así hasta el #10, que multiplica x1. Los puntos salen del rendimiento real de cada equipo.
              </p>
            </div>
            <div className="stat-grid">
              <div className="stat">
                <div className="stat-label">Picks</div>
                <div className="stat-value">10</div>
              </div>
              <div className="stat">
                <div className="stat-label">Máximo mult.</div>
                <div className="stat-value">x10</div>
              </div>
            </div>
            <a className="ghost-link" href="/tournament">Ver grupos y bracket</a>
            <a className="ghost-link" href="/admin">Admin</a>
          </aside>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2 className="section-title">Qué puntúa</h2>
              <p className="page-copy" style={{ marginTop: 8 }}>Cada selección suma o resta puntos. Luego se aplica el multiplicador de tu Top10.</p>
            </div>
            <a className="ghost-link" href="/simulate">Simular puntuaciones</a>
          </div>

          <div className="panel">
            <div className="table-wrap">
              <table className="data-table compact-table">
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th>Puntos de equipo</th>
                  </tr>
                </thead>
                <tbody>
                  {scoringRows.map(([label, points]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>
                        <strong style={{ color: points < 0 ? 'var(--danger)' : 'var(--accent)' }}>
                          {formatPoints(points)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted" style={{ marginBottom: 0 }}>
              Ejemplo: si tu equipo #1 suma 12 puntos, aporta 120 puntos a tu porra.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
