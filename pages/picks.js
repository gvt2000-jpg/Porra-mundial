import { useEffect, useState } from 'react'
import Top10Picker from '../components/Top10Picker'

export default function Picks() {
  const [status, setStatus] = useState(null)
  const [lock, setLock] = useState({ locked: false, lock_label: '11 de junio de 2026' })

  useEffect(() => {
    fetch('/api/picks-lock')
      .then((res) => res.json())
      .then((data) => setLock(data))
      .catch(() => null)
  }, [])

  async function handleSubmit(payload) {
    setStatus('Guardando...')
    const res = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const json = await res.json().catch(() => null)
    if (res.ok) setStatus('Guardado correctamente. Tu Top10 está registrado.')
    else setStatus(json?.error || 'Error al guardar')
  }

  const ok = status && status.startsWith('Guardado')

  return (
    <main className="page">
      <div className="shell">
        <nav className="top-nav">
          <a className="brand-mark" href="/"><span className="brand-dot">26</span><span>Porra Mundial</span></a>
          <div className="nav-links">
            <a className="nav-link" href="/leaderboard">Ranking</a>
            <a className="nav-link" href="/simulate">Simular</a>
            <a className="nav-link" href="/tournament">Torneo</a>
            <a className="nav-link" href="/compare">Comparar</a>
          </div>
        </nav>

        <header style={{ maxWidth: 820, margin: '0 auto 24px', textAlign: 'center' }}>
          <p className="eyebrow" style={{ color: 'var(--brand)' }}>Predicciones</p>
          <h1 className="page-title">Elige tu Top10</h1>
          <p className="page-copy" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Ordena las selecciones que crees que van a sumar más. Cuanto más arriba las pongas, más multiplican.
          </p>
          <p className={`alert ${lock.locked ? 'alert-error' : 'alert-success'}`} style={{ display: 'inline-block', marginTop: 16 }}>
            {lock.unlock_active && lock.unlocked_until
              ? `Predicciones desbloqueadas hasta ${new Date(lock.unlocked_until).toLocaleString('es-ES')}`
              : `Cierre de predicciones: ${lock.lock_label}`}
          </p>
        </header>

        <Top10Picker onSubmit={handleSubmit} locked={lock.locked} />
        {status && (
          <div className={`alert ${ok ? 'alert-success' : 'alert-error'}`} style={{ maxWidth: 780, margin: '22px auto 0' }}>
            {status}
          </div>
        )}
      </div>
    </main>
  )
}
