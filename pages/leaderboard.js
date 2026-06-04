import { useEffect, useState } from 'react'

export default function Leaderboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/leaderboard').then((r) => r.json()).then((j) => setData(j.leaderboard || []))
  }, [])

  return (
    <main className="page">
      <div className="shell">
        <nav className="top-nav">
          <a className="brand-mark" href="/"><span className="brand-dot">26</span><span>Porra Mundial</span></a>
          <div className="nav-links">
            <a className="nav-link" href="/picks">Predicciones</a>
            <a className="nav-link" href="/tournament">Torneo</a>
            <a className="nav-link" href="/compare">Comparar</a>
          </div>
        </nav>

        <header className="section-head">
          <div>
            <p className="eyebrow" style={{ color: 'var(--brand)' }}>Ranking vivo</p>
            <h1 className="page-title">Leaderboard</h1>
            <p className="page-copy">Puntuación total de cada participante según los equipos de su Top10.</p>
          </div>
          <a className="btn btn-muted" href="/compare">Comparar participantes</a>
        </header>

        {!data && <div className="panel">Cargando ranking...</div>}
        {data && data.length === 0 && <div className="panel">Todavía no hay envíos.</div>}

        {data && data.length > 0 && (
          <section className="ranking-list">
            {data.map((row, i) => (
              <article key={row.submitter} className="ranking-card">
                <div className="ranking-head">
                  <span className="rank-badge">#{i + 1}</span>
                  <div>
                    <strong style={{ fontSize: 19 }}>{row.submitter}</strong>
                    <div className="muted">{row.breakdown.length} equipos puntuando</div>
                  </div>
                  <div>
                    <div className="score">{row.total.toFixed(1)} pts</div>
                    <a className="ghost-link" href={`/participant/${encodeURIComponent(row.submitter)}`}>Ver detalle</a>
                  </div>
                </div>

                <details style={{ marginTop: 14 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 900 }}>Desglose del Top10</summary>
                  <div className="table-wrap" style={{ marginTop: 12 }}>
                    <table className="data-table">
                      <thead>
                        <tr><th>Equipo</th><th>Rank</th><th>Mult</th><th>Puntos</th></tr>
                      </thead>
                      <tbody>
                        {row.breakdown.map((pick) => (
                          <tr key={pick.team_id}>
                            <td>{pick.flag} {pick.team_name || 'Desconocido'}</td>
                            <td>#{pick.rank}</td>
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
        )}
      </div>
    </main>
  )
}
