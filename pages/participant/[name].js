import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

export default function ParticipantDetail() {
  const router = useRouter()
  const name = typeof router.query.name === 'string' ? decodeURIComponent(router.query.name) : ''
  const [leaderboard, setLeaderboard] = useState(null)

  useEffect(() => {
    fetch('/api/leaderboard').then((r) => r.json()).then((j) => setLeaderboard(j.leaderboard || []))
  }, [])

  const current = useMemo(() => leaderboard?.find((row) => row.submitter === name), [leaderboard, name])
  const leader = leaderboard?.[0]
  const previous = current ? leaderboard.find((row) => row.rank === current.rank - 1) : null
  const leaderPickIds = new Set((leader?.breakdown || []).map((pick) => pick.team_id))
  const differential = (current?.breakdown || []).filter((pick) => !leaderPickIds.has(pick.team_id))

  if (!leaderboard) {
    return <main className="page"><div className="shell"><div className="panel">Cargando participante...</div></div></main>
  }

  if (!current) {
    return (
      <main className="page">
        <div className="shell">
          <a className="ghost-link" href="/leaderboard">Volver al ranking</a>
          <div className="panel" style={{ marginTop: 16 }}>No encuentro a este participante.</div>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="shell">
        <nav className="top-nav">
          <a className="brand-mark" href="/"><span className="brand-dot">26</span><span>Porra Mundial</span></a>
          <div className="nav-links">
            <a className="nav-link" href="/leaderboard">Ranking</a>
            <a className="nav-link" href="/compare">Comparar</a>
            <a className="nav-link" href="/tournament">Torneo</a>
          </div>
        </nav>

        <header style={{ marginBottom: 20 }}>
          <p className="eyebrow" style={{ color: 'var(--brand)' }}>Participante</p>
          <h1 className="page-title">{current.submitter}</h1>
          <p className="page-copy">Detalle de predicción, multiplicadores y distancia con la cabeza.</p>
        </header>

        <section className="stat-grid" style={{ marginBottom: 16 }}>
          <div className="stat"><div className="stat-label">Posición</div><div className="stat-value">#{current.rank}</div></div>
          <div className="stat"><div className="stat-label">Total</div><div className="stat-value" style={{ color: 'var(--accent)' }}>{current.total.toFixed(1)}</div></div>
          <div className="stat"><div className="stat-label">Al líder</div><div className="stat-value">{leader ? (leader.total - current.total).toFixed(1) : '0.0'}</div></div>
          <div className="stat"><div className="stat-label">Siguiente objetivo</div><div className="stat-value">{previous ? (previous.total - current.total).toFixed(1) : '0.0'}</div></div>
        </section>

        <section className="panel" style={{ marginBottom: 16 }}>
          <div className="section-head">
            <h2 className="section-title">Top10</h2>
            <a className="ghost-link" href="/leaderboard">Ranking completo</a>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Rank</th><th>Equipo</th><th>Mult</th><th>Equipo pts</th><th>Aporta</th></tr>
              </thead>
              <tbody>
                {current.breakdown.map((pick) => (
                  <tr key={pick.team_id}>
                    <td><strong>#{pick.rank}</strong></td>
                    <td>{pick.flag} {pick.team_name}</td>
                    <td>x{pick.multiplier}</td>
                    <td>{pick.team_points}</td>
                    <td><strong style={{ color: 'var(--accent)' }}>{pick.contributed.toFixed(1)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>Diferenciales contra el líder</h2>
          {current.rank === 1 && <p className="muted">Este participante lidera la porra.</p>}
          {current.rank !== 1 && differential.length === 0 && <p className="muted">No tiene equipos diferenciales contra el líder.</p>}
          {differential.map((pick) => (
            <div key={pick.team_id} style={{ padding: '10px 0', borderBottom: '1px solid #eef2f7' }}>
              <strong>{pick.flag} {pick.team_name}</strong>
              <div className="muted">Puede recortar si suma puntos: x{pick.multiplier} para {current.submitter}.</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
