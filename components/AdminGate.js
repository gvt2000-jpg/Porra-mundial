import { useEffect, useState } from 'react'
import { ADMIN_PASSWORD } from '../lib/adminAuth'
import { clearAdminPassword, hasAdminSession, setAdminPassword } from '../lib/adminClient'

export default function AdminGate({ children }) {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setAuthorized(hasAdminSession())
  }, [])

  function submit(e) {
    e.preventDefault()
    if (password !== ADMIN_PASSWORD) {
      setError('Contraseña incorrecta')
      return
    }
    setAdminPassword(password)
    setAuthorized(true)
    setError('')
  }

  function logout() {
    clearAdminPassword()
    setPassword('')
    setAuthorized(false)
  }

  if (authorized) {
    return (
      <>
        <button
          type="button"
          onClick={logout}
          className="ghost-link"
          style={{ position: 'fixed', top: 16, right: 16, zIndex: 20, background: '#fff' }}
        >
          Salir admin
        </button>
        {children}
      </>
    )
  }

  return (
    <main className="page" style={{ display: 'grid', placeItems: 'center' }}>
      <form onSubmit={submit} className="form-card" style={{ maxWidth: 400 }}>
        <div className="brand-mark" style={{ marginBottom: 22 }}>
          <span className="brand-dot">26</span>
          <span>Admin Porra</span>
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 950 }}>Acceso privado</h1>
        <p className="muted" style={{ marginTop: 0, lineHeight: 1.55 }}>Introduce la contraseña para gestionar partidos, rojas y puntuaciones.</p>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          style={{ marginBottom: 12 }}
        />
        {error && <p className="alert alert-error">{error}</p>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Entrar
        </button>
      </form>
    </main>
  )
}
