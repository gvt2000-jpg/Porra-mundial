import { useEffect, useMemo, useState } from 'react'

function computeRanking(participants, pointMap) {
  const rows = participants.map((participant) => {
    const breakdown = participant.picks.map((pick) => {
      const teamPoints = Number(pointMap[pick.team_id] || 0)
      return { ...pick, team_points: teamPoints, contributed: teamPoints * pick.multiplier }
    }).sort((a, b) => a.rank - b.rank)

    return {
      submitter: participant.submitter,
      breakdown,
      total: breakdown.reduce((sum, pick) => sum + pick.contributed, 0)
    }
  }).sort((a, b) => b.total - a.total)

  return rows.map((row, index) => ({ ...row, rank: index + 1 }))
}

function pointColor(value) {
  if (value > 0) return 'var(--success)'
  if (value < 0) return 'var(--danger)'
  return 'var(--muted)'
}

export default function Simulate() {
  const [teams, setTeams] = useState([])
  const [participants, setParticipants] = useState([])
  const [simPoints, setSimPoints] = useState({})
  const [selected, setSelected] = useState('')
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/simulation-data')
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error)
        const loadedTeams = json.teams || []
        const loadedParticipants = json.participants || []
        setTeams(loadedTeams)
        setParticipants(loadedParticipants)
        setSimPoints(Object.fromEntries(loadedTeams.map((team) => [team.id, Number(team.points || 0)])))
        setSelected(loadedParticipants[0]?.submitter || '')
      })
      .catch((err) => setError(err.message || 'No se pudo cargar el simulador'))
      .finally(() => setLoading(false))
  }, [])

  const basePoints = useMemo(() => Object.fromEntries(teams.map((team) => [team.id, Number(team.points || 0)])), [teams])
  const currentRanking = useMemo(() => computeRanking(participants, basePoints), [participants, basePoints])
  const simulatedRanking = useMemo(() => computeRanking(participants, simPoints), [participants, simPoints])
  const currentRow = currentRanking.find((row) => row.submitter === selected)
  const simulatedRow = simulatedRanking.find((row) => row.submitter === selected)
  const selectedPickIds = useMemo(() => new Set((simulatedRow?.breakdown || []).map((pick) => pick.team_id)), [simulatedRow])

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(filter.trim().toLowerCase()))
  const movers = simulatedRanking
    .map((row) => {
      const before = currentRanking.find((item) => item.submitter === row.submitter)
      return { ...row, delta: row.total - Number(before?.total || 0), rankDelta: Number(before?.rank || row.rank) - row.rank }
    })
    .filter((row) => Math.abs(row.delta) > 0.001 || row.rankDelta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 8)

  function setTeamPoints(teamId, value) {
    setSimPoints((current) => ({ ...current, [teamId]: Number(value) || 0 }))
  }

  function bumpTeam(teamId, amount) {
    setSimPoints((current) => ({ ...current, [teamId]: Number(current[teamId] || 0) + amount }))
  }

  function resetAll() {
    setSimPoints(Object.fromEntries(teams.map((team) => [team.id, Number(team.points || 0)])))
  }

  return (
    <main className="page">
      <div className="wide-shell">
        <nav className="top-nav">
          <a className="brand-mark" href="/"><span className="brand-dot">26</span><span>Porra Mundial</span></a>
          <div className="nav-links">
            <a className="nav-link" href="/leaderboard">Ranking</a>
            <a className="nav-link" href="/picks">Predicciones</a>
            <a className="nav-link" href="/compare">Comparar</a>
            <a className="nav-link" href="/tournament">Torneo</a>
          </div>
        </nav>

        <header className="section-head">
          <div>
            <p className="eyebrow" style={{ color: 'var(--brand)' }}>Laboratorio</p>
            <h1 className="page-title">Simulador de puntuaciones</h1>
            <p className="page-copy">Prueba puntos por seleccion y mira como cambiarian tu total y el ranking.</p>
          </div>
          <button type="button" className="btn btn-muted" onClick={resetAll}>Resetear simulacion</button>
        </header>

        {loading && <div className="panel">Cargando simulador...</div>}
        {error && <p className="alert alert-error">{error}</p>}

        {!loading && !error && (
          <>
            <section className="panel" style={{ marginBottom: 16 }}>
              <div className="split-grid">
                <label>
                  <strong>Tu equipo</strong>
                  <select className="select" value={selected} onChange={(e) => setSelected(e.target.value)} style={{ marginTop: 8 }}>
                    {participants.map((participant) => <option key={participant.submitter} value={participant.submitter}>{participant.submitter}</option>)}
                  </select>
                </label>
                <div className="stat-grid">
                  <div className="stat">
                    <div className="stat-label">Ahora</div>
                    <div className="stat-value">{currentRow ? currentRow.total.toFixed(1) : '0.0'}</div>
                    <div className="muted">#{currentRow?.rank || '-'}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-label">Simulado</div>
                    <div className="stat-value">{simulatedRow ? simulatedRow.total.toFixed(1) : '0.0'}</div>
                    <div className="muted">#{simulatedRow?.rank || '-'}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-label">Cambio</div>
                    <div className="stat-value" style={{ color: pointColor(Number(simulatedRow?.total || 0) - Number(currentRow?.total || 0)) }}>
                      {(Number(simulatedRow?.total || 0) - Number(currentRow?.total || 0)).toFixed(1)}
                    </div>
                    <div className="muted">{currentRow && simulatedRow ? `${currentRow.rank - simulatedRow.rank} puestos` : '-'}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="split-grid" style={{ alignItems: 'start' }}>
              <div className="panel">
                <div className="section-head">
                  <div>
                    <h2 className="section-title">Equipos</h2>
                    <p className="page-copy" style={{ marginTop: 8 }}>Los equipos de tu Top10 quedan resaltados.</p>
                  </div>
                  <input className="input" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar" style={{ maxWidth: 220 }} />
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Equipo</th><th>Actual</th><th>Simulado</th><th>Ajustes</th></tr>
                    </thead>
                    <tbody>
                      {filteredTeams.map((team) => {
                        const selectedPick = selectedPickIds.has(team.id)
                        const delta = Number(simPoints[team.id] || 0) - Number(team.points || 0)
                        return (
                          <tr key={team.id} style={{ background: selectedPick ? '#eff6ff' : '#fff' }}>
                            <td><strong>{team.flag} {team.name}</strong>{selectedPick && <div className="muted">En tu Top10</div>}</td>
                            <td>{Number(team.points || 0).toFixed(1)}</td>
                            <td>
                              <input className="input" type="number" value={simPoints[team.id] ?? 0} onChange={(e) => setTeamPoints(team.id, e.target.value)} style={{ width: 92 }} />
                              <div className="muted" style={{ color: pointColor(delta) }}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}</div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {[1, 3, 5, -1].map((amount) => (
                                  <button key={amount} type="button" className="ghost-link" onClick={() => bumpTeam(team.id, amount)} style={{ minHeight: 34, padding: '6px 9px' }}>
                                    {amount > 0 ? `+${amount}` : amount}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <section className="panel">
                  <h2 className="section-title">Ranking simulado</h2>
                  <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
                    {simulatedRanking.slice(0, 12).map((row) => (
                      <div key={row.submitter} style={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr) auto', gap: 10, alignItems: 'center', padding: 12, border: row.submitter === selected ? '2px solid #2563eb' : '1px solid var(--line)', borderRadius: 8, background: '#fff' }}>
                        <strong>#{row.rank}</strong>
                        <span style={{ fontWeight: 900, overflowWrap: 'anywhere' }}>{row.submitter}</span>
                        <strong style={{ color: 'var(--accent)' }}>{row.total.toFixed(1)}</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <h2 className="section-title">Movimientos</h2>
                  {movers.length === 0 && <p className="muted">Sin cambios respecto al ranking actual.</p>}
                  {movers.map((row) => (
                    <div key={row.submitter} style={{ padding: '10px 0', borderBottom: '1px solid #eef2f7' }}>
                      <strong>{row.submitter}</strong>
                      <div className="muted">
                        {row.delta >= 0 ? '+' : ''}{row.delta.toFixed(1)} pts · {row.rankDelta >= 0 ? '+' : ''}{row.rankDelta} puestos
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
