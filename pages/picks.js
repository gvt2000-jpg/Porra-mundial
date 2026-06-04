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
    <main style={{ padding: '48px 24px', minHeight: '100vh', background: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)' }}>
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        <header style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 12, color: '#1f2937' }}>Elige tu Top10</h1>
          <p style={{ fontSize: 18, color: '#6b7280', lineHeight: 1.6 }}>
            Selecciona los 10 equipos que crees que tendrán mejor desempeño en el torneo.
          </p>
          <p style={{ display: 'inline-block', marginTop: 10, padding: '10px 14px', borderRadius: 8, background: lock.locked ? '#fee2e2' : '#ecfdf5', color: lock.locked ? '#991b1b' : '#166534', fontWeight: 800 }}>
            Cierre de predicciones: {lock.lock_label}
          </p>
        </header>
        <Top10Picker onSubmit={handleSubmit} locked={lock.locked} />
        {status && (
          <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#166534' : '#991b1b', fontSize: 16, fontWeight: 700 }}>
            {status}
          </div>
        )}
      </div>
    </main>
  )
}
