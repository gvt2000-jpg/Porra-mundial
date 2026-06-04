export default function Home() {
  const containerStyle = { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }
  const contentStyle = { maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }
  const titleStyle = { fontSize: 56, fontWeight: 900, marginBottom: 16, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }
  const subtitleStyle = { fontSize: 24, marginBottom: 48, opacity: 0.95 }
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }
  const cardStyle = { padding: 32, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s' }
  const cardTitleStyle = { fontSize: 22, fontWeight: 700, marginBottom: 12 }
  const cardDescStyle = { fontSize: 16, opacity: 0.9, marginBottom: 20, lineHeight: 1.6 }
  const buttonStyle = { display: 'inline-block', padding: '14px 32px', background: '#fff', color: '#667eea', borderRadius: 50, textDecoration: 'none', fontWeight: 700, fontSize: 16, transition: 'all 0.3s', cursor: 'pointer', border: 'none' }
  const secondaryButtonStyle = { ...buttonStyle, background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid #fff' }
  const featureListStyle = { textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32 }
  const featureItemStyle = { padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingLeft: 32, position: 'relative' }
  const hoverIn = (e) => {
    e.target.style.transform = 'translateY(-2px)'
    e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
  }
  const hoverOut = (e) => {
    e.target.style.transform = 'translateY(0)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <main style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={titleStyle}>⚽ Porras Mundial 2026</h1>
        <p style={subtitleStyle}>Forma tu Top10 de equipos y compite por el mejor pronóstico</p>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>📊 Selecciona tu Top10</div>
            <p style={cardDescStyle}>Elige los 10 equipos que crees que tendrán mejor desempeño en el torneo. Los mejores rankeados dan más puntos.</p>
            <a href="/picks" style={buttonStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>Enviar Top10 →</a>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>🏆 Ve el leaderboard</div>
            <p style={cardDescStyle}>Consulta el ranking en tiempo real de todos los participantes. Los puntos se calculan automáticamente.</p>
            <a href="/leaderboard" style={buttonStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>Ver Ranking →</a>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>⚔️ Compara porras</div>
            <p style={cardDescStyle}>Enfrenta dos participantes, revisa equipos comunes y encuentra los picks diferenciales.</p>
            <a href="/compare" style={buttonStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>Comparar →</a>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>🌍 Sigue el Mundial</div>
            <p style={cardDescStyle}>Consulta grupos, banderas, estadísticas de equipos y el bracket de eliminatorias en una vista de torneo.</p>
            <a href="/tournament" style={buttonStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>Ver Mundial →</a>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>⚙️ Panel Admin</div>
            <p style={cardDescStyle}>Ingresa resultados, gestiona eventos del torneo y controla el sistema de puntuación.</p>
            <a href="/admin" style={secondaryButtonStyle} onMouseEnter={hoverIn} onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.background = 'rgba(255,255,255,0.2)'
              e.target.style.boxShadow = 'none'
            }}>Acceder Admin →</a>
          </div>
        </div>

        <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px', background: 'rgba(255,255,255,0.08)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)' }}>
          <h2 style={{ fontSize: 28, marginBottom: 24 }}>¿Cómo funciona?</h2>
          <div style={featureListStyle}>
            <div style={featureItemStyle}><span style={{ position: 'absolute', left: 0, fontSize: 24 }}>1</span>Elige 10 equipos oficiales en tu Top10.</div>
            <div style={featureItemStyle}><span style={{ position: 'absolute', left: 0, fontSize: 24 }}>2</span>Los admin cargan resultados, tarjetas y bonus de torneo.</div>
            <div style={featureItemStyle}><span style={{ position: 'absolute', left: 0, fontSize: 24 }}>3</span>El sistema calcula los puntos de cada equipo.</div>
            <div style={featureItemStyle}><span style={{ position: 'absolute', left: 0, fontSize: 24 }}>4</span>Tu puntuación = puntos del equipo × multiplicador del rank.</div>
          </div>
          <div style={{ marginTop: 24, fontSize: 14, opacity: 0.85 }}>
            <strong>Multiplicadores:</strong> Rank #1 = 10x | Rank #5 = 6x | Rank #10 = 1x
          </div>
        </div>
      </div>
    </main>
  )
}
