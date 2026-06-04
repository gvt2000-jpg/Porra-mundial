import { useEffect, useState } from 'react'
import AdminGate from '../../components/AdminGate'
import { adminFetch } from '../../lib/adminClient'

export default function AdminPredictions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {
    setLoading(true)
    const res = await adminFetch('/api/admin-picks')
    const json = await res.json().catch(() => null)
    if (res.ok) {
      setSubmissions(json.submissions || [])
      setMessage('')
    } else {
      setMessage('Error: ' + (json?.error || 'No se pudieron cargar las predicciones'))
    }
    setLoading(false)
  }

  async function deleteSubmission(submitter) {
    if (!confirm(`¿Borrar todas las predicciones de "${submitter}"?`)) return

    const res = await adminFetch('/api/admin-picks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submitter_name: submitter })
    })
    const json = await res.json().catch(() => null)
    if (res.ok) {
      setSubmissions((current) => current.filter((item) => item.submitter !== submitter))
      setMessage(`Borradas ${json.deleted} predicciones de ${submitter}.`)
    } else {
      setMessage('Error: ' + (json?.error || 'No se pudo borrar'))
    }
  }

  return (
    <AdminGate>
      <main className="page">
        <div className="shell">
          <nav className="top-nav">
            <a className="brand-mark" href="/admin"><span className="brand-dot">26</span><span>Admin</span></a>
            <div className="nav-links">
              <a className="nav-link" href="/admin/scoring-dashboard">Puntuación</a>
              <a className="nav-link" href="/leaderboard">Ranking</a>
            </div>
          </nav>

          <header className="section-head">
            <div>
              <p className="eyebrow" style={{ color: 'var(--brand)' }}>Gestión</p>
              <h1 className="page-title">Predicciones</h1>
              <p className="page-copy">Borra envíos duplicados o nombres mal puestos.</p>
            </div>
            <button type="button" className="btn btn-muted" onClick={loadSubmissions}>Refrescar</button>
          </header>

          {message && <p className={`alert ${message.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>{message}</p>}
          {loading && <div className="panel">Cargando predicciones...</div>}
          {!loading && submissions.length === 0 && <div className="panel">No hay predicciones guardadas.</div>}

          <section className="ranking-list">
            {submissions.map((submission) => (
              <article key={submission.submitter} className="ranking-card">
                <div className="ranking-head">
                  <span className="rank-badge">{submission.count}</span>
                  <div>
                    <strong style={{ fontSize: 19 }}>{submission.submitter}</strong>
                    <div className="muted">{submission.count} picks · {submission.created_at ? new Date(submission.created_at).toLocaleString('es-ES') : 'Sin fecha'}</div>
                  </div>
                  <button type="button" className="btn" onClick={() => deleteSubmission(submission.submitter)} style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' }}>
                    Borrar
                  </button>
                </div>
                <details style={{ marginTop: 14 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 900 }}>Ver Top10</summary>
                  <div className="table-wrap" style={{ marginTop: 12 }}>
                    <table className="data-table">
                      <thead>
                        <tr><th>Rank</th><th>Equipo</th><th>Mult</th></tr>
                      </thead>
                      <tbody>
                        {submission.picks.map((pick) => (
                          <tr key={pick.id}>
                            <td>#{pick.rank}</td>
                            <td>{pick.flag} {pick.team_name}</td>
                            <td>x{pick.multiplier}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </article>
            ))}
          </section>
        </div>
      </main>
    </AdminGate>
  )
}
