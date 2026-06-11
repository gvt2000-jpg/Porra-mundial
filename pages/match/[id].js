import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const eventLabels = {
  goal: 'Gol',
  assist: 'Asistencia',
  red_card: 'Roja',
  yellow_card: 'Amarilla'
}

export default function MatchDetail() {
  const router = useRouter()
  const { id } = router.query
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/match/${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error)
        else setData(json)
      })
      .catch((err) => setError(err.message))
  }, [id])

  if (error) return <main className="page"><div className="shell"><p className="alert alert-error">Error: {error}</p></div></main>
  if (!data) return <main className="page"><div className="shell"><div className="panel">Cargando partido...</div></div></main>

  const { match } = data
  const tiedKnockout = match.played &&
    !String(match.stage || '').startsWith('group') &&
    Number(match.home_score || 0) === Number(match.away_score || 0)
  const winnerTeam = match.winner_team_id === match.home_team?.id
    ? match.home_team
    : match.winner_team_id === match.away_team?.id
      ? match.away_team
      : null

  return (
    <main className="page">
      <div className="shell">
        <nav className="top-nav">
          <a className="brand-mark" href="/"><span className="brand-dot">26</span><span>Porra Mundial</span></a>
          <div className="nav-links">
            <a className="nav-link" href="/tournament">Torneo</a>
            <a className="nav-link" href="/leaderboard">Ranking</a>
          </div>
        </nav>

        <section className="panel" style={{ marginBottom: 18 }}>
          <div className="muted" style={{ fontWeight: 900, marginBottom: 18 }}>
            {match.stage} · {match.starts_at ? new Date(match.starts_at).toLocaleString('es-ES') : 'Fecha por definir'}
          </div>
          <div className="match-scoreboard">
            <div className="match-team">
              <div className="match-flag">{match.home_team?.flag}</div>
              <h1 className="match-team-name">{match.home_team?.name || 'Local'}</h1>
            </div>
            <div className="match-score">
              <div className="match-score-value">{match.played ? `${match.home_score ?? 0} - ${match.away_score ?? 0}` : 'vs'}</div>
              <div className="muted" style={{ fontWeight: 900 }}>{match.played ? 'Jugado' : 'Pendiente'}</div>
              {tiedKnockout && (
                <div style={{ marginTop: 8, color: winnerTeam ? 'var(--brand)' : 'var(--danger)', fontWeight: 950 }}>
                  {winnerTeam ? `Pasa ${winnerTeam.flag} ${winnerTeam.name}` : 'Falta seleccionar quién pasó'}
                </div>
              )}
            </div>
            <div className="match-team">
              <div className="match-flag">{match.away_team?.flag}</div>
              <h1 className="match-team-name">{match.away_team?.name || 'Visitante'}</h1>
            </div>
          </div>
        </section>

        <div className="split-grid">
          <section className="panel">
            <h2>Eventos</h2>
            {data.events.length === 0 && <p className="muted">Sin eventos registrados.</p>}
            {data.events.map((event) => (
              <div key={event.id} style={{ padding: '10px 0', borderBottom: '1px solid #eef2f7' }}>
                <strong>{event.minute ? `${event.minute}'` : '--'} · {eventLabels[event.event_type] || event.event_type}</strong>
                <div className="muted">{event.flag} {event.team_name}{event.player_name ? ` · ${event.player_name}` : ''}</div>
              </div>
            ))}
          </section>

          <section className="panel">
            <h2>Impacto en equipos</h2>
            {data.team_points.map((team) => (
              <div key={team.team_id} style={{ padding: '10px 0', borderBottom: '1px solid #eef2f7' }}>
                <strong>{team.flag} {team.team_name}</strong>
                <div style={{ color: 'var(--accent)', fontWeight: 950 }}>{team.points} puntos de equipo</div>
              </div>
            ))}
          </section>
        </div>

        <section className="panel" style={{ marginTop: 18 }}>
          <h2>Porras afectadas</h2>
          {data.impacted_participants.length === 0 && <p className="muted">Nadie tiene estos equipos en su Top10.</p>}
          {data.impacted_participants.slice(0, 20).map((row) => (
            <div key={row.submitter} style={{ padding: '10px 0', borderBottom: '1px solid #eef2f7' }}>
              <strong>{row.submitter}</strong>
              <div className="muted">
                {row.teams.map((team) => `${team.flag} ${team.team_name} (#${team.rank}, x${team.multiplier})`).join(' · ')}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
