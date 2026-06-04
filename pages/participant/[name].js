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

  const pageStyle = { minHeight: '100vh', background: '#f3f4f6', padding: '36px 24px' }
  const wrapStyle = { maxWidth: 980, margin: '0 auto' }
  const panelStyle = { background: '#fff', borderRadius: 10, padding: 20, marginBottom: 18, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }
  const statStyle = { ...panelStyle, marginBottom: 0 }
  const rowStyle = { display: 'grid', gridTemplateColumns: '70px 1fr 80px 90px 90px', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eef2f7' }

  if (!leaderboard) return <main style={pageStyle}><div style={wrapStyle}>Cargando participante...</div></main>
  if (!current) {
    return (
      <main style={pageStyle}>
        <div style={wrapStyle}>
          <a href="/leaderboard">← Volver al ranking</a>
          <div style={panelStyle}>No encuentro a este participante.</div>
        </div>
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      <div style={wrapStyle}>
        <a href="/leaderboard" style={{ color: '#1d4ed8', fontWeight: 800, textDecoration: 'none' }}>← Volver al ranking</a>
        <h1 style={{ fontSize: 40, margin: '18px 0 8px' }}>{current.submitter}</h1>
        <p style={{ color: '#6b7280', marginTop: 0 }}>Detalle de predicción, multiplicadores y distancia con la cabeza.</p>

        <div style={gridStyle}>
          <div style={statStyle}>
            <div style={{ color: '#6b7280', fontWeight: 700 }}>Posición</div>
            <div style={{ fontSize: 30, fontWeight: 950 }}>#{current.rank}</div>
          </div>
          <div style={statStyle}>
            <div style={{ color: '#6b7280', fontWeight: 700 }}>Total</div>
            <div style={{ fontSize: 30, fontWeight: 950, color: '#1d4ed8' }}>{current.total.toFixed(1)}</div>
          </div>
          <div style={statStyle}>
            <div style={{ color: '#6b7280', fontWeight: 700 }}>Al líder</div>
            <div style={{ fontSize: 30, fontWeight: 950 }}>{leader ? (leader.total - current.total).toFixed(1) : '0.0'}</div>
          </div>
          <div style={statStyle}>
            <div style={{ color: '#6b7280', fontWeight: 700 }}>Siguiente objetivo</div>
            <div style={{ fontSize: 30, fontWeight: 950 }}>{previous ? (previous.total - current.total).toFixed(1) : '0.0'}</div>
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>Top10</h2>
          <div style={{ ...rowStyle, fontWeight: 900, color: '#6b7280' }}>
            <span>Rank</span><span>Equipo</span><span>Mult</span><span>Equipo pts</span><span>Aporta</span>
          </div>
          {current.breakdown.map((pick) => (
            <div key={pick.team_id} style={rowStyle}>
              <strong>#{pick.rank}</strong>
              <span>{pick.flag} {pick.team_name}</span>
              <span>x{pick.multiplier}</span>
              <span>{pick.team_points}</span>
              <strong style={{ color: '#1d4ed8' }}>{pick.contributed.toFixed(1)}</strong>
            </div>
          ))}
        </div>

        <div style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>Diferenciales contra el líder</h2>
          {current.rank === 1 && <p>Este participante lidera la porra.</p>}
          {current.rank !== 1 && differential.length === 0 && <p>No tiene equipos diferenciales contra el líder.</p>}
          {differential.map((pick) => (
            <div key={pick.team_id} style={{ padding: '8px 0', borderBottom: '1px solid #eef2f7' }}>
              <strong>{pick.flag} {pick.team_name}</strong> puede recortar si suma puntos: x{pick.multiplier} para {current.submitter}.
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
