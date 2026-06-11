import AdminGate from '../../components/AdminGate'

export default function AdminDashboard() {
  const items = [
    {
      title: 'Partidos y puntuacion',
      desc: 'Mete goles, marca partidos jugados, registra rojas, ajusta bonus de torneo y recalcula puntos desde una sola pantalla.',
      href: '/admin/scoring-dashboard',
      primary: true
    },
    {
      title: 'Predicciones',
<<<<<<< HEAD
      desc: 'Revisa envios, borra duplicados y abre una ventana temporal para rezagados.',
      href: '/admin/predictions'
    },
    {
      title: 'Simulador',
      desc: 'Prueba puntuaciones futuras y revisa como se moveria el ranking.',
      href: '/simulate'
    },
    {
=======
      desc: 'Revisa envios por participante y borra duplicados o nombres mal escritos.',
      href: '/admin/predictions'
    },
    {
>>>>>>> f84f3f17b3d1d09e667e64e5fdd030f9dd1d3ae4
      title: 'Eventos avanzados',
      desc: 'Registra otros eventos de partido cuando necesites detalle extra fuera de las rojas del panel principal.',
      href: '/admin/events'
    },
    {
      title: 'Logros de equipos',
      desc: 'Vista rapida para revisar bonus manuales de cada seleccion.',
      href: '/admin/team-stats'
    },
    {
      title: 'Torneo publico',
      desc: 'Comprueba grupos, estadisticas y bracket tal como lo veran los participantes.',
      href: '/tournament'
    }
  ]

  const containerStyle = { padding: '48px 24px', minHeight: '100vh', background: '#f5f7fb' }
  const maxWidthStyle = { maxWidth: 1120, margin: '0 auto' }
  const titleStyle = { fontSize: 42, fontWeight: 900, margin: '0 0 8px', color: '#111827' }
  const subtitleStyle = { fontSize: 17, color: '#6b7280', margin: '0 0 34px' }
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }
  const cardStyle = { padding: 24, background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(15,23,42,0.05)' }
  const primaryCardStyle = { ...cardStyle, borderColor: '#bfdbfe', background: '#eff6ff' }
  const linkStyle = { display: 'inline-block', padding: '11px 16px', background: '#2563eb', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 800, fontSize: 14 }

  return (
    <AdminGate>
      <main style={containerStyle}>
        <div style={maxWidthStyle}>
          <h1 style={titleStyle}>Panel de administracion</h1>
          <p style={subtitleStyle}>Control de partidos, eventos y puntuaciones de la porra.</p>

          <div style={gridStyle}>
            {items.map((item) => (
              <article key={item.href} style={item.primary ? primaryCardStyle : cardStyle}>
                <h2 style={{ fontSize: item.primary ? 26 : 21, margin: '0 0 10px', color: '#1d4ed8' }}>{item.title}</h2>
                <p style={{ margin: '0 0 20px', color: '#4b5563', lineHeight: 1.55 }}>{item.desc}</p>
                <a href={item.href} style={linkStyle}>Acceder</a>
              </article>
            ))}
          </div>
        </div>
      </main>
    </AdminGate>
  )
}
