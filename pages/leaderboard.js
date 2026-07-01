import { useEffect, useState } from 'react'

function movementLabel(delta) {
  if (delta === null || delta === undefined) return 'Nuevo'
  if (delta > 0) return `+${delta} puestos`
  if (delta < 0) return `${delta} puestos`
  return 'Sin cambios'
}

function movementClass(delta) {
  if (delta === null || delta === undefined) return 'is-new'
  if (delta > 0) return 'is-up'
  if (delta < 0) return 'is-down'
  return 'is-flat'
}

function formatDeltaPoints(delta) {
  if (delta === null || delta === undefined) return 'Primera lectura'
  if (Math.abs(delta) < 0.05) return '0.0 pts'
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)} pts`
}

function compactRankDelta(delta) {
  if (delta === null || delta === undefined) return 'new'
  if (delta > 0) return `+${delta}`
  if (delta < 0) return String(delta)
  return '0'
}

export default function Leaderboard() {
  const [data, setData] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [referenceAt, setReferenceAt] = useState(null)
  const [pendingScoringStage, setPendingScoringStage] = useState(null)
  const [snapshotMissing, setSnapshotMissing] = useState(false)

  useEffect(() => {
    fetch('/api/leaderboard').then((r) => r.json()).then((j) => {
      setData(j.leaderboard || [])
      setUpdatedAt(j.updated_at || null)
      setReferenceAt(j.movement_reference_at || null)
      setPendingScoringStage(j.pending_scoring_stage || null)
      setSnapshotMissing(Boolean(j.snapshot_schema_missing))
    })
  }, [])

  const podium = data?.slice(0, 3) || []
  const movers = (data || []).filter((row) => row.rankDelta !== null && row.rankDelta !== 0)
  const biggestRise = movers.filter((row) => row.rankDelta > 0).sort((a, b) => b.rankDelta - a.rankDelta)[0]
  const biggestFall = movers.filter((row) => row.rankDelta < 0).sort((a, b) => a.rankDelta - b.rankDelta)[0]
  const leaderGap = data && data.length > 1 ? Number(data[0].total || 0) - Number(data[1].total || 0) : 0
  const topScore = Math.max(1, Number(data?.[0]?.total || 1))

  return (
    <main className="page">
      <div className="shell">
        <nav className="top-nav">
          <a className="brand-mark" href="/"><span className="brand-dot">26</span><span>Porra Mundial</span></a>
          <div className="nav-links">
            <a className="nav-link" href="/picks">Predicciones</a>
            <a className="nav-link" href="/simulate">Simular</a>
            <a className="nav-link" href="/tournament">Torneo</a>
            <a className="nav-link" href="/compare">Comparar</a>
          </div>
        </nav>

        <header className="section-head">
          <div>
            <p className="eyebrow" style={{ color: 'var(--brand)' }}>Ranking vivo</p>
            <h1 className="page-title">Leaderboard</h1>
            <p className="page-copy">Puntuacion total, cambios de posicion y pelea por la cima desde el ultimo recalculo.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a className="btn btn-muted" href="/simulate">Simular puntos</a>
            <a className="btn btn-muted" href="/compare">Comparar participantes</a>
          </div>
        </header>

        {!data && <div className="panel">Cargando ranking...</div>}
        {data && data.length === 0 && <div className="panel">Todavia no hay envios.</div>}
        {snapshotMissing && <div className="alert alert-info" style={{ marginBottom: 14 }}>Falta crear el historico de rankings. Ejecuta la migracion 010 para activar subidas y bajadas globales.</div>}

        {data && data.length > 0 && (
          <>
            <section className="leaderboard-stage">
              <div className="podium-strip">
                {podium.map((row, index) => (
                  <a key={row.submitter} className={`podium-card podium-${index + 1}`} href={`/participant/${encodeURIComponent(row.submitter)}`}>
                    <span className="podium-rank">#{row.rank}<em className={`rank-change-mini ${movementClass(row.rankDelta)}`}>{compactRankDelta(row.rankDelta)}</em></span>
                    <strong>{row.submitter}</strong>
                    <span>{row.total.toFixed(1)} pts</span>
                    <em className={`movement-pill ${movementClass(row.rankDelta)}`}>{movementLabel(row.rankDelta)}</em>
                  </a>
                ))}
              </div>

              <div className="leaderboard-stats">
                <div className="stat-tile">
                  <span>Distancia al 2o</span>
                  <strong>{leaderGap.toFixed(1)} pts</strong>
                </div>
                <div className="stat-tile">
                  <span>Mayor subida</span>
                  <strong>{biggestRise ? `+${biggestRise.rankDelta}` : '-'}</strong>
                  <small>{biggestRise?.submitter || 'Sin cambios'}</small>
                </div>
                <div className="stat-tile">
                  <span>Mayor bajada</span>
                  <strong>{biggestFall ? biggestFall.rankDelta : '-'}</strong>
                  <small>{biggestFall?.submitter || 'Sin cambios'}</small>
                </div>
                <div className="stat-tile">
                  <span>Referencia cambios</span>
                  <strong>{referenceAt ? new Date(referenceAt).toLocaleDateString('es-ES') : '-'}</strong>
                </div>
                <div className="stat-tile">
                  <span>Ultimo recalculo</span>
                  <strong>{updatedAt ? new Date(updatedAt).toLocaleDateString('es-ES') : '-'}</strong>
                </div>
                <div className="stat-tile">
                  <span>Fase pendiente</span>
                  <strong>{pendingScoringStage?.label || '-'}</strong>
                </div>
              </div>
            </section>

            <section className="ranking-list">
              {data.map((row, i) => (
                <article key={row.submitter} className={`ranking-card ${i < 3 ? 'ranking-card-featured' : ''}`}>
                  <div className="ranking-head">
                    <span className="rank-badge">#{row.rank}<em className={`rank-change-mini ${movementClass(row.rankDelta)}`}>{compactRankDelta(row.rankDelta)}</em></span>
                    <div>
                      <strong style={{ fontSize: 19 }}>{row.submitter}</strong>
                      <div className="ranking-meta">
                        <span>{row.active_teams ?? row.breakdown.length} vivos</span>
                        <span>{row.eliminated_teams ?? 0} fuera</span>
                        <span>{row.scoring_teams ?? 0} con puntos</span>
                        <span>{row.pending_scoring_teams ?? 0} pendientes{pendingScoringStage?.label ? ` en ${pendingScoringStage.label}` : ''}</span>
                        <span className={`movement-pill ${movementClass(row.rankDelta)}`}>{movementLabel(row.rankDelta)}</span>
                        <span className="points-delta">{formatDeltaPoints(row.pointsDelta)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="score">{row.total.toFixed(1)} pts</div>
                      <a className="ghost-link" href={`/participant/${encodeURIComponent(row.submitter)}`}>Ver detalle</a>
                    </div>
                  </div>

                  <div className="momentum-bar" aria-hidden="true">
                    <span style={{ width: `${Math.min(100, Math.max(8, Number(row.total || 0) / topScore * 100))}%` }} />
                  </div>

                  <details style={{ marginTop: 14 }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 900 }}>Desglose del Top10</summary>
                    <div className="table-wrap" style={{ marginTop: 12 }}>
                      <table className="data-table">
                        <thead>
                          <tr><th>Equipo</th><th>Rank</th><th>Estado</th><th>Pendiente</th><th>Mult</th><th>Puntos</th></tr>
                        </thead>
                        <tbody>
                          {row.breakdown.map((pick) => (
                            <tr key={pick.team_id}>
                              <td>{pick.flag} {pick.team_name || 'Desconocido'}</td>
                              <td>#{pick.rank}</td>
                              <td><span className={`team-status-pill ${pick.eliminated ? 'is-out' : 'is-live'}`}>{pick.eliminated ? 'Fuera' : 'Vivo'}</span></td>
                              <td>{pick.pending_current_stage ? pendingScoringStage?.label || 'Si' : '-'}</td>
                              <td>x{pick.multiplier}</td>
                              <td><strong style={{ color: 'var(--accent)' }}>+{pick.contributed.toFixed(1)}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
