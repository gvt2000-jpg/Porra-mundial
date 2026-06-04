import { useEffect, useMemo, useState } from 'react'

function pickMap(row) {
  return new Map((row?.breakdown || []).map((pick) => [pick.team_id, pick]))
}

export default function Compare() {
  const [leaderboard, setLeaderboard] = useState([])
  const [leftName, setLeftName] = useState('')
  const [rightName, setRightName] = useState('')

  useEffect(() => {
    fetch('/api/leaderboard').then((r) => r.json()).then((j) => {
      const rows = j.leaderboard || []
      setLeaderboard(rows)
      setLeftName(rows[0]?.submitter || '')
      setRightName(rows[1]?.submitter || rows[0]?.submitter || '')
    })
  }, [])

  const left = leaderboard.find((row) => row.submitter === leftName)
  const right = leaderboard.find((row) => row.submitter === rightName)
  const comparison = useMemo(() => {
    const leftMap = pickMap(left)
    const rightMap = pickMap(right)
    const common = []
    const onlyLeft = []
    const onlyRight = []

    for (const pick of left?.breakdown || []) {
      if (rightMap.has(pick.team_id)) common.push({ left: pick, right: rightMap.get(pick.team_id) })
      else onlyLeft.push(pick)
    }
    for (const pick of right?.breakdown || []) {
      if (!leftMap.has(pick.team_id)) onlyRight.push(pick)
    }
    return { common, onlyLeft, onlyRight }
  }, [left, right])

  const pageStyle = { minHeight: '100vh', background: '#f3f4f6', padding: '36px 24px' }
  const wrapStyle = { maxWidth: 1100, margin: '0 auto' }
  const panelStyle = { background: '#fff', borderRadius: 10, padding: 20, marginBottom: 18, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }
  const selectStyle = { width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }
  const columnsStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }
  const rowStyle = { padding: '9px 0', borderBottom: '1px solid #eef2f7' }

  return (
    <main style={pageStyle}>
      <div style={wrapStyle}>
        <a href="/leaderboard" style={{ color: '#1d4ed8', fontWeight: 800, textDecoration: 'none' }}>← Volver al ranking</a>
        <h1 style={{ fontSize: 40, margin: '18px 0 8px' }}>Comparador de porras</h1>
        <p style={{ color: '#6b7280', marginTop: 0 }}>Compara equipos comunes, picks diferenciales y distancia de puntos.</p>

        <div style={{ ...panelStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <label>
            <strong>Participante A</strong>
            <select value={leftName} onChange={(e) => setLeftName(e.target.value)} style={selectStyle}>
              {leaderboard.map((row) => <option key={row.submitter} value={row.submitter}>{row.submitter}</option>)}
            </select>
          </label>
          <label>
            <strong>Participante B</strong>
            <select value={rightName} onChange={(e) => setRightName(e.target.value)} style={selectStyle}>
              {leaderboard.map((row) => <option key={row.submitter} value={row.submitter}>{row.submitter}</option>)}
            </select>
          </label>
        </div>

        {left && right && (
          <>
            <div style={columnsStyle}>
              <div style={panelStyle}>
                <h2 style={{ marginTop: 0 }}>{left.submitter}</h2>
                <div style={{ fontSize: 32, fontWeight: 950, color: '#1d4ed8' }}>{left.total.toFixed(1)} pts</div>
                <div>#{left.rank}</div>
              </div>
              <div style={panelStyle}>
                <h2 style={{ marginTop: 0 }}>{right.submitter}</h2>
                <div style={{ fontSize: 32, fontWeight: 950, color: '#1d4ed8' }}>{right.total.toFixed(1)} pts</div>
                <div>#{right.rank}</div>
              </div>
              <div style={panelStyle}>
                <h2 style={{ marginTop: 0 }}>Diferencia</h2>
                <div style={{ fontSize: 32, fontWeight: 950 }}>{Math.abs(left.total - right.total).toFixed(1)} pts</div>
                <div>{left.total >= right.total ? left.submitter : right.submitter} va por delante</div>
              </div>
            </div>

            <div style={columnsStyle}>
              <div style={panelStyle}>
                <h2 style={{ marginTop: 0 }}>Comunes ({comparison.common.length})</h2>
                {comparison.common.map(({ left: a, right: b }) => (
                  <div key={a.team_id} style={rowStyle}>
                    <strong>{a.flag} {a.team_name}</strong>
                    <div style={{ color: '#6b7280' }}>{left.submitter}: #{a.rank} x{a.multiplier} · {right.submitter}: #{b.rank} x{b.multiplier}</div>
                  </div>
                ))}
              </div>
              <div style={panelStyle}>
                <h2 style={{ marginTop: 0 }}>Solo {left.submitter} ({comparison.onlyLeft.length})</h2>
                {comparison.onlyLeft.map((pick) => <div key={pick.team_id} style={rowStyle}>{pick.flag} {pick.team_name} · #{pick.rank} x{pick.multiplier}</div>)}
              </div>
              <div style={panelStyle}>
                <h2 style={{ marginTop: 0 }}>Solo {right.submitter} ({comparison.onlyRight.length})</h2>
                {comparison.onlyRight.map((pick) => <div key={pick.team_id} style={rowStyle}>{pick.flag} {pick.team_name} · #{pick.rank} x{pick.multiplier}</div>)}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
