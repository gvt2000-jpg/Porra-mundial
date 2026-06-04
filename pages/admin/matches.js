import AdminGate from '../../components/AdminGate'

export default function AdminMatches() {
  return (
    <AdminGate>
      <main style={{ minHeight: '100vh', padding: '48px 24px', background: '#f5f7fb' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: 28, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h1 style={{ margin: '0 0 12px', fontSize: 34, fontWeight: 900 }}>Partidos y puntuacion</h1>
          <p style={{ margin: '0 0 22px', color: '#6b7280', lineHeight: 1.6 }}>
            Gestionar partidos se ha fusionado con el panel de puntuacion. Desde ahi puedes meter goles, rojas, bonus y recalcular la porra.
          </p>
          <a
            href="/admin/scoring-dashboard"
            style={{ display: 'inline-block', padding: '12px 18px', borderRadius: 8, background: '#2563eb', color: '#fff', textDecoration: 'none', fontWeight: 800 }}
          >
            Abrir panel unificado
          </a>
        </div>
      </main>
    </AdminGate>
  )
}
