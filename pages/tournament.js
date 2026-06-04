import { useEffect, useState } from 'react'

function TeamName({ team, muted = false }) {
  if (!team) return <span style={{ color: '#9ca3af' }}>Por definir</span>
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0, color: muted ? '#6b7280' : '#111827' }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{team.flag}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</span>
    </span>
  )
}

function Score({ match }) {
  if (!match?.played) return <span style={{ color: '#9ca3af' }}>vs</span>
  return (
    <span style={{ fontWeight: 900, color: '#111827' }}>
      {match.home_score ?? 0}-{match.away_score ?? 0}
    </span>
  )
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
  return <span style={{ color: '#9ca3af' }}>{source || 'Por definir'}</span>
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

  const pageStyle = { minHeight: '100vh', background: '#eef2f7', color: '#111827' }
  const heroStyle = { background: 'linear-gradient(135deg, #0f766e 0%, #1d4ed8 58%, #b91c1c 100%)', color: '#fff', padding: '42px 24px 34px' }
  const heroInnerStyle = { maxWidth: 1320, margin: '0 auto' }
  const navStyle = { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }
  const navLinkStyle = { color: '#fff', textDecoration: 'none', fontWeight: 800, padding: '9px 12px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, background: 'rgba(255,255,255,0.12)' }
  const contentStyle = { maxWidth: 1320, margin: '0 auto', padding: '28px 24px 56px' }
  const sectionStyle = { marginBottom: 34 }
  const sectionTitleStyle = { fontSize: 26, margin: '0 0 16px', fontWeight: 900 }
  const groupGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 16 }
  const panelStyle = { background: '#fff', border: '1px solid #dbe3ef', borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)' }
  const panelHeaderStyle = { padding: '13px 16px', background: '#111827', color: '#fff', fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }
  const thStyle = { textAlign: 'right', padding: '9px 8px', color: '#64748b', borderBottom: '1px solid #e5e7eb', fontWeight: 800 }
  const tdStyle = { textAlign: 'right', padding: '9px 8px', borderBottom: '1px solid #f1f5f9' }
  const teamCellStyle = { ...tdStyle, textAlign: 'left', minWidth: 160 }
  const matchesStyle = { padding: 12, background: '#f8fafc', display: 'grid', gap: 8 }
  const matchStyle = { display: 'grid', gridTemplateColumns: '1fr 44px 1fr', gap: 8, alignItems: 'center', padding: '8px 10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }
  const bracketStyle = { display: 'grid', gridTemplateColumns: 'repeat(6, minmax(230px, 1fr))', gap: 16, overflowX: 'auto', paddingBottom: 8, alignItems: 'start' }
  const bracketColumnStyle = { minWidth: 210 }
  const bracketHeaderStyle = { fontWeight: 900, fontSize: 15, marginBottom: 10, padding: '10px 12px', borderRadius: 8, background: '#0f172a', color: '#fff' }
  const bracketMatchStyle = { position: 'relative', display: 'block', color: 'inherit', textDecoration: 'none', background: '#fff', border: '1px solid #dbe3ef', borderLeft: '5px solid #0f766e', borderRadius: 8, padding: 10, marginBottom: 14, boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)' }
  const bracketRowStyle = { display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center', padding: '8px 0' }

  if (error) {
    return (
      <main style={pageStyle}>
        <div style={contentStyle}>
          <p style={{ padding: 16, background: '#fee2e2', color: '#991b1b', borderRadius: 8 }}>Error cargando torneo: {error}</p>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main style={pageStyle}>
        <div style={contentStyle}>Cargando torneo...</div>
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      <header style={heroStyle}>
        <div style={heroInnerStyle}>
          <nav style={navStyle}>
            <a href="/" style={navLinkStyle}>Inicio</a>
            <a href="/picks" style={navLinkStyle}>Predicciones</a>
            <a href="/leaderboard" style={navLinkStyle}>Ranking</a>
          </nav>
          <h1 style={{ fontSize: 46, lineHeight: 1.05, margin: '0 0 10px', fontWeight: 950 }}>Mundial 2026</h1>
          <p style={{ maxWidth: 760, margin: 0, fontSize: 18, lineHeight: 1.5, opacity: 0.94 }}>
            Grupos, estadísticas y eliminatorias de los equipos de la porra, con banderas y seguimiento del torneo.
          </p>
        </div>
      </header>

      <div style={contentStyle}>
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Grupos</h2>
          <div style={groupGridStyle}>
            {data.groups.map((group) => (
              <div key={group.label} style={panelStyle}>
                <div style={panelHeaderStyle}>
                  <span>Grupo {group.label}</span>
                  <span style={{ fontSize: 12, opacity: 0.72 }}>{group.teams.length} equipos</span>
                </div>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, textAlign: 'left', paddingLeft: 16 }}>Equipo</th>
                      <th style={thStyle}>PJ</th>
                      <th style={thStyle}>Pts</th>
                      <th style={thStyle}>GF</th>
                      <th style={thStyle}>GC</th>
                      <th style={thStyle}>DG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.teams.map((team) => (
                      <tr key={team.id}>
                        <td style={teamCellStyle}><TeamName team={team} /></td>
                        <td style={tdStyle}>{team.played}</td>
                        <td style={{ ...tdStyle, fontWeight: 900 }}>{team.group_points}</td>
                        <td style={tdStyle}>{team.goals_for}</td>
                        <td style={tdStyle}>{team.goals_against}</td>
                        <td style={tdStyle}>{team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={matchesStyle}>
                  {group.matches.length === 0 && <span style={{ color: '#6b7280', fontSize: 13 }}>Calendario pendiente</span>}
                  {group.matches.slice(0, 6).map((match) => (
                    <a key={match.id} href={`/match/${match.id}`} style={{ ...matchStyle, color: 'inherit', textDecoration: 'none' }}>
                      <TeamName team={match.home_team} muted={!match.played} />
                      <div style={{ textAlign: 'center' }}><Score match={match} /></div>
                      <div style={{ textAlign: 'right' }}><TeamName team={match.away_team} muted={!match.played} /></div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Stats de Equipos</h2>
          <div style={panelStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign: 'left', paddingLeft: 16 }}>Equipo</th>
                  <th style={thStyle}>PJ</th>
                  <th style={thStyle}>G</th>
                  <th style={thStyle}>E</th>
                  <th style={thStyle}>P</th>
                  <th style={thStyle}>GF</th>
                  <th style={thStyle}>GC</th>
                  <th style={thStyle}>Rojas</th>
                  <th style={thStyle}>Puntos porra</th>
                </tr>
              </thead>
              <tbody>
                {data.standings.map((team) => (
                  <tr key={team.id}>
                    <td style={teamCellStyle}><TeamName team={team} /></td>
                    <td style={tdStyle}>{team.played}</td>
                    <td style={tdStyle}>{team.wins}</td>
                    <td style={tdStyle}>{team.draws}</td>
                    <td style={tdStyle}>{team.losses}</td>
                    <td style={tdStyle}>{team.goals_for}</td>
                    <td style={tdStyle}>{team.goals_against}</td>
                    <td style={tdStyle}>{team.red_cards}</td>
                    <td style={{ ...tdStyle, fontWeight: 900, color: '#1d4ed8' }}>{team.porra_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Bracket</h2>
          <div style={bracketStyle}>
            {data.bracket.map((stage) => (
              <div key={stage.key} style={bracketColumnStyle}>
                <div style={bracketHeaderStyle}>{stage.label}</div>
                {stage.matches.length === 0 && (
                  <div style={{ ...bracketMatchStyle, color: '#6b7280', minHeight: 74, display: 'grid', placeItems: 'center' }}>
                    Pendiente
                  </div>
                )}
                {stage.matches.map((match) => {
                  const winner = winnerSide(match)
                  const Tag = match.is_virtual ? 'div' : 'a'
                  return (
                  <Tag key={match.id} href={match.is_virtual ? undefined : `/match/${match.id}`} style={bracketMatchStyle}>
                    <div style={{ ...bracketRowStyle, opacity: winner && winner !== 'home' ? 0.55 : 1 }}>
                      <strong><BracketTeam team={match.home_team} source={match.home_source} /></strong>
                      <strong style={{ fontSize: 18, color: winner === 'home' ? '#0f766e' : '#111827' }}>{match.played ? match.home_score ?? 0 : '-'}</strong>
                    </div>
                    <div style={{ ...bracketRowStyle, opacity: winner && winner !== 'away' ? 0.55 : 1 }}>
                      <strong><BracketTeam team={match.away_team} source={match.away_source} /></strong>
                      <strong style={{ fontSize: 18, color: winner === 'away' ? '#0f766e' : '#111827' }}>{match.played ? match.away_score ?? 0 : '-'}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                      {match.starts_at ? new Date(match.starts_at).toLocaleString('es-ES') : `M${match.bracket_order || ''} por definir`}
                    </div>
                  </Tag>
                )})}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
