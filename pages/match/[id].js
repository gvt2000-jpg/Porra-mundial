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

  const pageStyle = { minHeight: '100vh', background: '#f3f4f6', padding: '36px 24px' }
  const wrapStyle = { maxWidth: 1040, margin: '0 auto' }
  const panelStyle = { background: '#fff', borderRadius: 10, padding: 20, marginBottom: 18, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }
  const teamStyle = { display: 'grid', placeItems: 'center', gap: 8, textAlign: 'center' }
  const listRowStyle = { padding: '10px 0', borderBottom: '1px solid #eef2f7' }

  if (error) return <main style={pageStyle}><div style={wrapStyle}><p style={panelStyle}>Error: {error}</p></div></main>
  if (!data) return <main style={pageStyle}><div style={wrapStyle}>Cargando partido...</div></main>

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
    <main style={pageStyle}>
      <div style={wrapStyle}>
        <a href="/tournament" style={{ color: '#1d4ed8', fontWeight: 800, textDecoration: 'none' }}>← Volver al torneo</a>

        <section style={{ ...panelStyle, marginTop: 18 }}>
          <div style={{ color: '#6b7280', fontWeight: 800, marginBottom: 18 }}>{match.stage} · {match.starts_at ? new Date(match.starts_at).toLocaleString('es-ES') : 'Fecha por definir'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'center' }}>
            <div style={teamStyle}>
              <div style={{ fontSize: 58 }}>{match.home_team?.flag}</div>
              <h1 style={{ margin: 0, fontSize: 28 }}>{match.home_team?.name || 'Local'}</h1>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 46, fontWeight: 950 }}>{match.played ? `${match.home_score ?? 0} - ${match.away_score ?? 0}` : 'vs'}</div>
              <div style={{ color: '#6b7280', fontWeight: 800 }}>{match.played ? 'Jugado' : 'Pendiente'}</div>
              {tiedKnockout && (
                <div style={{ marginTop: 8, color: winnerTeam ? '#0f766e' : '#b91c1c', fontWeight: 900 }}>
                  {winnerTeam ? `Pasa ${winnerTeam.flag} ${winnerTeam.name}` : 'Falta seleccionar quien paso'}
                </div>
              )}
            </div>
            <div style={teamStyle}>
              <div style={{ fontSize: 58 }}>{match.away_team?.flag}</div>
              <h1 style={{ margin: 0, fontSize: 28 }}>{match.away_team?.name || 'Visitante'}</h1>
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          <section style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>Eventos</h2>
            {data.events.length === 0 && <p style={{ color: '#6b7280' }}>Sin eventos registrados.</p>}
            {data.events.map((event) => (
              <div key={event.id} style={listRowStyle}>
                <strong>{event.minute ? `${event.minute}'` : '--'} · {eventLabels[event.event_type] || event.event_type}</strong>
                <div>{event.flag} {event.team_name}{event.player_name ? ` · ${event.player_name}` : ''}</div>
              </div>
            ))}
          </section>

          <section style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>Impacto en equipos</h2>
            {data.team_points.map((team) => (
              <div key={team.team_id} style={listRowStyle}>
                <strong>{team.flag} {team.team_name}</strong>
                <div style={{ color: '#1d4ed8', fontWeight: 900 }}>{team.points} puntos de equipo</div>
              </div>
            ))}
          </section>
        </div>

        <section style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>Porras afectadas</h2>
          {data.impacted_participants.length === 0 && <p style={{ color: '#6b7280' }}>Nadie tiene estos equipos en su Top10.</p>}
          {data.impacted_participants.slice(0, 20).map((row) => (
            <div key={row.submitter} style={listRowStyle}>
              <strong>{row.submitter}</strong>
              <div style={{ color: '#6b7280' }}>
                {row.teams.map((team) => `${team.flag} ${team.team_name} (#${team.rank}, x${team.multiplier})`).join(' · ')}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
