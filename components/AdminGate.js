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
          style={{ position: 'fixed', top: 16, right: 16, zIndex: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
        >
          Salir admin
        </button>
        {children}
      </>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f3f4f6' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 380, padding: 28, background: '#fff', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 28 }}>Admin</h1>
        <p style={{ marginTop: 0, marginBottom: 20, color: '#6b7280' }}>Introduce la contraseña para continuar.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontSize: 16, marginBottom: 12 }}
        />
        {error && <p style={{ margin: '0 0 12px', color: '#b91c1c', fontWeight: 600 }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '12px 16px', border: 0, borderRadius: 10, background: '#4f46e5', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
          Entrar
        </button>
      </form>
    </main>
  )
}
