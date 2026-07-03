import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

function formatPoints(value) {
  return Math.round(Number(value || 0))
}

export default function ParticipantDetail() {
  const router = useRouter()
  const name = typeof router.query.name === 'string' ? decodeURIComponent(router.query.name) : ''
  const [leaderboard, setLeaderboard] = useState(null)
  const [pendingScoringStage, setPendingScoringStage] = useState(null)

  useEffect(() => {
    fetch('/api/leaderboard').then((r) => r.json()).then((j) => {
      setLeaderboard(j.leaderboard || [])
      setPendingScoringStage(j.pending_scoring_stage || null)
    })
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
          <p className="page-copy">Detalle de prediccion, equipos vivos, multiplicadores y distancia con la cabeza.</p>
        </header>

        <section className="stat-grid" style={{ marginBottom: 16 }}>
          <div className="stat"><div className="stat-label">Posicion</div><div className="stat-value">#{current.rank}</div></div>
          <div className="stat"><div className="stat-label">Total</div><div className="stat-value" style={{ color: 'var(--accent)' }}>{formatPoints(current.total)}</div></div>
          <div className="stat"><div className="stat-label">Al lider</div><div className="stat-value">{leader ? formatPoints(leader.total - current.total) : 0}</div></div>
          <div className="stat"><div className="stat-label">Siguiente objetivo</div><div className="stat-value">{previous ? formatPoints(previous.total - current.total) : 0}</div></div>
          <div className="stat"><div className="stat-label">Vivos</div><div className="stat-value">{current.active_teams ?? current.breakdown.filter((pick) => !pick.eliminated).length}</div></div>
          <div className="stat"><div className="stat-label">Fuera</div><div className="stat-value">{current.eliminated_teams ?? current.breakdown.filter((pick) => pick.eliminated).length}</div></div>
        </section>

        <section className="panel" style={{ marginBottom: 16 }}>
          <div className="section-head">
            <h2 className="section-title">Top10</h2>
            <a className="ghost-link" href="/leaderboard">Ranking completo</a>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Rank</th><th>Equipo</th><th>Estado</th><th>Pendiente</th><th>Mult</th><th>Equipo pts</th><th>Aporta</th></tr>
              </thead>
              <tbody>
                {current.breakdown.map((pick) => (
                  <tr key={pick.team_id}>
                    <td><strong>#{pick.rank}</strong></td>
                    <td>{pick.flag} {pick.team_name}</td>
                    <td><span className={`team-status-pill ${pick.eliminated ? 'is-out' : 'is-live'}`}>{pick.eliminated ? 'Fuera' : 'Vivo'}</span></td>
                    <td>{pick.pending_current_stage ? pendingScoringStage?.label || 'Si' : '-'}</td>
                    <td>x{pick.multiplier}</td>
                    <td>{formatPoints(pick.team_points)}</td>
                    <td><strong style={{ color: 'var(--accent)' }}>{formatPoints(pick.contributed)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>Diferenciales contra el lider</h2>
          {current.rank === 1 && <p className="muted">Este participante lidera la porra.</p>}
          {current.rank !== 1 && differential.length === 0 && <p className="muted">No tiene equipos diferenciales contra el lider.</p>}
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
