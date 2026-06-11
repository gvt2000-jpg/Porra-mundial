import { useEffect, useMemo, useState } from 'react'

function pickMap(row) {
  return new Map((row?.breakdown || []).map((pick) => [pick.team_id, pick]))
}

function PickRow({ pick }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #eef2f7' }}>
      <strong>{pick.flag} {pick.team_name}</strong>
      <div className="muted">#{pick.rank} Â· x{pick.multiplier} Â· {pick.contributed.toFixed(1)} pts</div>
    </div>
  )
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

  return (
    <main className="page">
      <div className="shell">
        <nav className="top-nav">
          <a className="brand-mark" href="/"><span className="brand-dot">26</span><span>Porra Mundial</span></a>
          <div className="nav-links">
            <a className="nav-link" href="/leaderboard">Ranking</a>
            <a className="nav-link" href="/simulate">Simular</a>
            <a className="nav-link" href="/picks">Predicciones</a>
            <a className="nav-link" href="/tournament">Torneo</a>
          </div>
        </nav>

        <header style={{ marginBottom: 22 }}>
          <p className="eyebrow" style={{ color: 'var(--brand)' }}>Cara a cara</p>
          <h1 className="page-title">Comparador de porras</h1>
          <p className="page-copy">Encuentra picks comunes, diferenciales y la distancia real de puntos.</p>
        </header>

        <section className="panel" style={{ marginBottom: 16 }}>
          <div className="split-grid">
            <label>
              <strong>Participante A</strong>
              <select className="select" value={leftName} onChange={(e) => setLeftName(e.target.value)} style={{ marginTop: 8 }}>
                {leaderboard.map((row) => <option key={row.submitter} value={row.submitter}>{row.submitter}</option>)}
              </select>
            </label>
            <label>
              <strong>Participante B</strong>
              <select className="select" value={rightName} onChange={(e) => setRightName(e.target.value)} style={{ marginTop: 8 }}>
                {leaderboard.map((row) => <option key={row.submitter} value={row.submitter}>{row.submitter}</option>)}
              </select>
            </label>
          </div>
        </section>

        {!left || !right ? (
          <div className="panel">Cargando participantes...</div>
        ) : (
          <>
            <section className="stat-grid" style={{ marginBottom: 16 }}>
              <div className="stat"><div className="stat-label">{left.submitter}</div><div className="stat-value">{left.total.toFixed(1)}</div><div className="muted">#{left.rank}</div></div>
              <div className="stat"><div className="stat-label">{right.submitter}</div><div className="stat-value">{right.total.toFixed(1)}</div><div className="muted">#{right.rank}</div></div>
              <div className="stat"><div className="stat-label">Diferencia</div><div className="stat-value">{Math.abs(left.total - right.total).toFixed(1)}</div><div className="muted">{left.total >= right.total ? left.submitter : right.submitter} va por delante</div></div>
            </section>

            <section className="split-grid">
              <div className="panel">
                <h2>Comunes ({comparison.common.length})</h2>
                {comparison.common.map(({ left: a, right: b }) => (
                  <div key={a.team_id} style={{ padding: '10px 0', borderBottom: '1px solid #eef2f7' }}>
                    <strong>{a.flag} {a.team_name}</strong>
                    <div className="muted">{left.submitter}: #{a.rank} x{a.multiplier} Â· {right.submitter}: #{b.rank} x{b.multiplier}</div>
                  </div>
                ))}
              </div>
              <div className="panel">
                <h2>Solo {left.submitter} ({comparison.onlyLeft.length})</h2>
                {comparison.onlyLeft.map((pick) => <PickRow key={pick.team_id} pick={pick} />)}
              </div>
              <div className="panel">
                <h2>Solo {right.submitter} ({comparison.onlyRight.length})</h2>
                {comparison.onlyRight.map((pick) => <PickRow key={pick.team_id} pick={pick} />)}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
