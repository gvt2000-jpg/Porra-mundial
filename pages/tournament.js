import { useEffect, useState } from 'react'

function TeamName({ team, muted = false }) {
  if (!team) return <span style={{ color: '#98a2b3' }}>Por definir</span>
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0, color: muted ? '#667085' : 'var(--ink)' }}>
      <span style={{ fontSize: 21, lineHeight: 1 }}>{team.flag}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</span>
    </span>
  )
}

function Score({ match }) {
  if (!match?.played) return <span className="muted">vs</span>
  return <strong>{match.home_score ?? 0}-{match.away_score ?? 0}</strong>
}

function winnerSide(match) {
  if (!match?.played) return null
  const homeScore = Number(match.home_score || 0)
  const awayScore = Number(match.away_score || 0)
  if (homeScore > awayScore) return 'home'
  if (awayScore > homeScore) return 'away'
  if (match.winner_team_id === match.home_team?.id) return 'home'
  if (match.winner_team_id === match.away_team?.id) return 'away'
  return null
}

function BracketTeam({ team, source }) {
  if (team) return <TeamName team={team} />
  return <span style={{ color: '#98a2b3' }}>{source || 'Por definir'}</span>
}

export default function Tournament() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/tournament')
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error)
        else setData(json)
      })
      .catch((err) => setError(err.message))
  }, [])

  const matchRowStyle = { display: 'grid', gridTemplateColumns: '1fr 48px 1fr', gap: 8, alignItems: 'center', padding: '9px 10px', background: '#fff', border: '1px solid #eef2f7', borderRadius: 8, fontSize: 13, textDecoration: 'none' }
  const bracketMatchStyle = { display: 'block', color: 'inherit', textDecoration: 'none', background: '#fff', border: '1px solid var(--line)', borderLeft: '4px solid var(--brand)', borderRadius: 8, padding: 12, marginBottom: 12, boxShadow: 'var(--shadow-soft)' }
  const bracketRowStyle = { display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center', padding: '7px 0' }

  if (error) {
    return <main className="page"><div className="wide-shell"><p className="alert alert-error">Error cargando torneo: {error}</p></div></main>
  }

  if (!data) {
    return <main className="page"><div className="wide-shell"><div className="panel">Cargando torneo...</div></div></main>
  }

  return (
    <main className="page">
      <div className="wide-shell">
        <nav className="top-nav">
          <a className="brand-mark" href="/"><span className="brand-dot">26</span><span>Porra Mundial</span></a>
          <div className="nav-links">
            <a className="nav-link" href="/picks">Predicciones</a>
            <a className="nav-link" href="/leaderboard">Ranking</a>
            <a className="nav-link" href="/compare">Comparar</a>
          </div>
        </nav>

        <header className="panel" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #0b4f4a, #1d4ed8)', color: '#fff' }}>
          <p className="eyebrow">Mundial 2026</p>
          <h1 className="page-title">Grupos, stats y bracket</h1>
          <p style={{ maxWidth: 760, margin: '14px 0 0', color: 'rgba(255,255,255,0.84)', lineHeight: 1.6 }}>
            Seguimiento del torneo para ver clasificados, resultados y puntos de la porra en una vista única.
          </p>
        </header>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Grupos</h2>
            <span className="muted">Top 2 directo + mejores terceros</span>
          </div>
          <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))' }}>
            {data.groups.map((group) => (
              <article key={group.label} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '13px 16px', background: '#101827', color: '#fff', fontWeight: 950, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Grupo {group.label}</span>
                  <span style={{ opacity: 0.72, fontSize: 13 }}>{group.teams.length} equipos</span>
                </div>
                <div className="table-wrap" style={{ border: 0, borderRadius: 0 }}>
                  <table className="data-table" style={{ minWidth: 0 }}>
                    <thead>
                      <tr><th>Equipo</th><th>PJ</th><th>Pts</th><th>GF</th><th>GC</th><th>DG</th></tr>
                    </thead>
                    <tbody>
                      {group.teams.map((team) => (
                        <tr key={team.id}>
                          <td><TeamName team={team} /></td>
                          <td>{team.played}</td>
                          <td><strong>{team.group_points}</strong></td>
                          <td>{team.goals_for}</td>
                          <td>{team.goals_against}</td>
                          <td>{team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: 12, background: '#f8fafc', display: 'grid', gap: 8 }}>
                  {group.matches.length === 0 && <span className="muted" style={{ fontSize: 13 }}>Calendario pendiente</span>}
                  {group.matches.slice(0, 6).map((match) => (
                    <a key={match.id} href={`/match/${match.id}`} style={matchRowStyle}>
                      <TeamName team={match.home_team} muted={!match.played} />
                      <div style={{ textAlign: 'center' }}><Score match={match} /></div>
                      <div style={{ textAlign: 'right' }}><TeamName team={match.away_team} muted={!match.played} /></div>
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Stats de equipos</h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>Rojas</th><th>Puntos porra</th></tr>
              </thead>
              <tbody>
                {data.standings.map((team) => (
                  <tr key={team.id}>
                    <td><TeamName team={team} /></td>
                    <td>{team.played}</td>
                    <td>{team.wins}</td>
                    <td>{team.draws}</td>
                    <td>{team.losses}</td>
                    <td>{team.goals_for}</td>
                    <td>{team.goals_against}</td>
                    <td>{team.red_cards}</td>
                    <td><strong style={{ color: 'var(--accent)' }}>{team.porra_points}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Bracket</h2>
            <span className="muted">Se actualiza al recalcular desde admin</span>
          </div>
          <div className="bracket-scroll">
            {data.bracket.map((stage) => (
              <div key={stage.key} style={{ minWidth: 230 }}>
                <div style={{ marginBottom: 10, padding: '10px 12px', color: '#fff', background: '#101827', borderRadius: 8, fontWeight: 950 }}>{stage.label}</div>
                {stage.matches.map((match) => {
                  const winner = winnerSide(match)
                  const Tag = match.is_virtual ? 'div' : 'a'
                  return (
                    <Tag key={match.id} href={match.is_virtual ? undefined : `/match/${match.id}`} style={bracketMatchStyle}>
                      <div style={{ ...bracketRowStyle, opacity: winner && winner !== 'home' ? 0.55 : 1 }}>
                        <strong><BracketTeam team={match.home_team} source={match.home_source} /></strong>
                        <strong style={{ color: winner === 'home' ? 'var(--brand)' : 'var(--ink)' }}>{match.played ? match.home_score ?? 0 : '-'}</strong>
                      </div>
                      <div style={{ ...bracketRowStyle, opacity: winner && winner !== 'away' ? 0.55 : 1 }}>
                        <strong><BracketTeam team={match.away_team} source={match.away_source} /></strong>
                        <strong style={{ color: winner === 'away' ? 'var(--brand)' : 'var(--ink)' }}>{match.played ? match.away_score ?? 0 : '-'}</strong>
                      </div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                        {match.starts_at ? new Date(match.starts_at).toLocaleString('es-ES') : `M${match.bracket_order || ''} por definir`}
                      </div>
                    </Tag>
                  )
                })}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
