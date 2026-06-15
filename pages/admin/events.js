import { useEffect, useMemo, useState } from 'react'
import AdminGate from '../../components/AdminGate'
import { adminFetch } from '../../lib/adminClient'

export default function AdminEvents() {
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [form, setForm] = useState({ match_id: '', team_id: '', event_type: 'goal', player_name: '', minute: '' })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    adminFetch('/api/matches')
      .then(r => r.json())
      .then(j => {
        if (j.error) setStatus('Error cargando partidos: ' + j.error)
        setMatches(j.matches || [])
      })
      .catch((e) => setStatus('Error cargando partidos: ' + e.message))
  }, [])
  useEffect(() => { fetch('/api/teams').then(r => r.json()).then(j => setTeams(j.teams || [])) }, [])

  const teamNames = useMemo(() => Object.fromEntries(teams.map(t => [t.id, t.name])), [teams])
  const matchLabels = useMemo(() => {
    return Object.fromEntries(matches.map((m) => [m.id, `${teamNames[m.home_team_id] || m.home_team_id} vs ${teamNames[m.away_team_id] || m.away_team_id} (${m.stage})`]))
  }, [matches, teamNames])

  async function submit(e) {
    e.preventDefault()
    const payload = { ...form, minute: form.minute ? Number(form.minute) : null }
    const res = await adminFetch('/api/match_events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const json = await res.json().catch(() => null)
    if (res.ok) {
      setStatus('Evento creado exitosamente')
      setForm({ match_id: '', team_id: '', event_type: 'goal', player_name: '', minute: '' })
    } else {
      setStatus('Error: ' + (json?.error || 'Error al crear evento'))
    }
  }

  const containerStyle = { padding: '48px 24px', minHeight: '100vh', background: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)' }
  const maxWidthStyle = { maxWidth: 800, margin: '0 auto' }
  const titleStyle = { fontSize: 44, fontWeight: 900, marginBottom: 8 }
  const subtitleStyle = { fontSize: 16, color: '#6b7280', marginBottom: 32 }
  const formStyle = { padding: 32, background: '#fff', borderRadius: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }
  const formGroupStyle = { marginBottom: 20 }
  const labelStyle = { display: 'block', marginBottom: 10, fontWeight: 700, color: '#1f2937' }
  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s' }
  const buttonStyle = { width: '100%', padding: '14px 28px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 16, transition: 'all 0.3s' }
  const messageStyle = { marginTop: 24, padding: 16, borderRadius: 12, background: status?.includes('Error:') ? '#fee2e2' : '#dcfce7', color: status?.includes('Error:') ? '#991b1b' : '#166534', fontWeight: 500 }

  return (
    <AdminGate>
    <main style={containerStyle}>
      <div style={maxWidthStyle}>
        <h1 style={titleStyle}>Eventos del Torneo</h1>
        <p style={subtitleStyle}>Registra goles, asistencias y tarjetas durante los partidos</p>
        
        <div style={formStyle}>
          <form onSubmit={submit}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Partido:</label>
              <select value={form.match_id} onChange={e => setForm({ ...form, match_id: e.target.value })} style={inputStyle}>
                <option value="">-- Selecciona partido --</option>
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>{matchLabels[m.id] || `${m.id} - ${m.stage}`}</option>
                ))}
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Equipo:</label>
              <select value={form.team_id} onChange={e => setForm({ ...form, team_id: e.target.value })} style={inputStyle}>
                <option value="">-- Selecciona equipo --</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Tipo de evento:</label>
              <select value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })} style={inputStyle}>
                <option value="goal">Gol</option>
                <option value="assist">Asistencia</option>
                <option value="red_card">Tarjeta Roja</option>
                <option value="yellow_card">Tarjeta Amarilla</option>
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Jugador:</label>
              <input value={form.player_name} onChange={e => setForm({ ...form, player_name: e.target.value })} placeholder="Nombre del jugador" style={inputStyle} />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Minuto (opcional):</label>
              <input type="number" min="0" max="120" value={form.minute} onChange={e => setForm({ ...form, minute: e.target.value })} placeholder="45" style={inputStyle} />
            </div>
            <button type="submit" style={buttonStyle} onMouseEnter={(e) => (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)')} onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}>Registrar Evento</button>
          </form>
          {status && <p style={messageStyle}>{status}</p>}
        </div>
      </div>
    </main>
    </AdminGate>
  )
}
