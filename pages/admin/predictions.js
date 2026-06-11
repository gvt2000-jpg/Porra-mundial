import { useEffect, useState } from 'react'
import AdminGate from '../../components/AdminGate'
import { adminFetch } from '../../lib/adminClient'

export default function AdminPredictions() {
  const [submissions, setSubmissions] = useState([])
  const [lock, setLock] = useState(null)
  const [unlockMinutes, setUnlockMinutes] = useState(60)
  const [setupSql, setSetupSql] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    await Promise.all([loadSubmissions(), loadLock()])
    setLoading(false)
  }

  async function loadSubmissions() {
    const res = await adminFetch('/api/admin-picks')
    const json = await res.json().catch(() => null)
    if (res.ok) {
      setSubmissions(json.submissions || [])
    } else {
      setMessage('Error: ' + (json?.error || 'No se pudieron cargar las predicciones'))
    }
  }

  async function loadLock() {
    const res = await adminFetch('/api/admin-picks-lock')
    const json = await res.json().catch(() => null)
    if (res.ok) {
      setLock(json)
      setSetupSql(json.setup_sql || '')
    } else {
      setMessage('Error: ' + (json?.error || 'No se pudo cargar el cierre de apuestas'))
      setSetupSql(json?.setup_sql || '')
    }
  }

  async function updateLock(action) {
    const res = await adminFetch('/api/admin-picks-lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, minutes: Number(unlockMinutes) || 60 })
    })
    const json = await res.json().catch(() => null)
    if (res.ok) {
      setLock(json)
      setSetupSql('')
      setMessage(action === 'unlock' ? 'Apuestas desbloqueadas temporalmente.' : 'Apuestas cerradas de nuevo.')
    } else {
      setMessage('Error: ' + (json?.error || 'No se pudo actualizar el cierre'))
      setSetupSql(json?.setup_sql || '')
    }
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
            <button type="button" className="btn btn-muted" onClick={loadAll}>Refrescar</button>
          </header>

          {message && <p className={`alert ${message.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>{message}</p>}
          {setupSql && (
            <section className="panel" style={{ marginBottom: 16, background: '#fff7ed', borderColor: '#fed7aa', color: '#9a3412' }}>
              <strong>SQL pendiente en Supabase</strong>
              <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', marginBottom: 0 }}>{setupSql}</pre>
            </section>
          )}

          <section className="panel" style={{ marginBottom: 16 }}>
            <div className="section-head" style={{ marginBottom: 0 }}>
              <div>
                <h2 className="section-title">Cierre de apuestas</h2>
                <p className="page-copy" style={{ marginTop: 8 }}>
                  Estado: <strong>{lock?.locked ? 'cerradas' : 'abiertas'}</strong>
                  {lock?.unlock_active && lock.unlocked_until ? ` hasta ${new Date(lock.unlocked_until).toLocaleString('es-ES')}` : ''}.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900 }}>
                  Minutos
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={unlockMinutes}
                    onChange={(e) => setUnlockMinutes(e.target.value)}
                    style={{ width: 96 }}
                  />
                </label>
                <button type="button" className="btn btn-primary" onClick={() => updateLock('unlock')}>Desbloquear</button>
                <button type="button" className="btn" onClick={() => updateLock('lock')} style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' }}>Cerrar</button>
              </div>
            </div>
          </section>

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
