import { useEffect, useState } from 'react'

export default function Leaderboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/leaderboard').then((r) => r.json()).then((j) => setData(j.leaderboard || []))
  }, [])

  const containerStyle = { padding: '36px 24px', minHeight: '100vh', background: '#f3f4f6' }
  const headerStyle = { maxWidth: 960, margin: '0 auto 24px' }
  const listStyle = { maxWidth: 960, margin: '0 auto' }
  const itemStyle = { padding: 18, marginBottom: 12, background: '#fff', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }
  const rankStyle = { display: 'inline-block', width: 34, height: 34, lineHeight: '34px', textAlign: 'center', background: '#1d4ed8', color: '#fff', borderRadius: 50, fontWeight: 800, marginRight: 12 }
  const headerRowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 12 }
  const totalStyle = { fontSize: 24, fontWeight: 900, color: '#1d4ed8' }
  const linkStyle = { display: 'inline-block', padding: '9px 12px', background: '#eef2ff', color: '#3730a3', borderRadius: 8, textDecoration: 'none', fontWeight: 800, fontSize: 14 }
  const detailsStyle = { marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }
  const breakdownRowStyle = { display: 'grid', gridTemplateColumns: '1fr 70px 70px 90px', gap: 12, alignItems: 'center', fontSize: 14, padding: 8, borderBottom: '1px solid #f3f4f6' }

  return (
    <main style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ fontSize: 38, marginBottom: 8 }}>Leaderboard Porras 2026</h1>
        <p style={{ fontSize: 16, color: '#57534e', marginBottom: 16 }}>Ranking en tiempo real basado en puntuaciones de equipos.</p>
        <a href="/compare" style={linkStyle}>Comparar participantes</a>
      </div>
      {!data && <div style={listStyle}><p>Cargando ranking...</p></div>}
      {data && data.length === 0 && <div style={listStyle}><p>Todavía no hay envíos.</p></div>}
      {data && data.length > 0 && (
        <div style={listStyle}>
          {data.map((row, i) => (
            <div key={row.submitter} style={itemStyle}>
              <div style={headerRowStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={rankStyle}>#{i + 1}</span>
                  <div>
                    <strong style={{ fontSize: 18 }}>{row.submitter}</strong>
                    <div style={totalStyle}>{row.total.toFixed(1)} pts</div>
                  </div>
                </div>
                <a href={`/participant/${encodeURIComponent(row.submitter)}`} style={linkStyle}>Ver detalle</a>
              </div>
              <details style={detailsStyle}>
                <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Ver desglose ({row.breakdown.length} equipos)</summary>
                <div style={{ marginTop: 12 }}>
                  <div style={{ ...breakdownRowStyle, fontWeight: 800, background: '#f3f4f6', marginBottom: 8 }}>
                    <span>Equipo</span>
                    <span>Rank</span>
                    <span>Mult</span>
                    <span>Puntos</span>
                  </div>
                  {row.breakdown.map((b) => (
                    <div key={b.team_id} style={breakdownRowStyle}>
                      <span>{b.flag} {b.team_name || 'Desconocido'}</span>
                      <span>#{b.rank}</span>
                      <span>x{b.multiplier}</span>
                      <span style={{ fontWeight: 800, color: '#1d4ed8' }}>+{b.contributed.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
