import { useEffect, useState } from 'react'
import AdminGate from '../../components/AdminGate'
import { adminFetch } from '../../lib/adminClient'

export default function TeamStats() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [setupSql, setSetupSql] = useState('')

  useEffect(() => {
    loadTeams()
  }, [])

  async function loadTeams() {
    setLoading(true)
    try {
      const res = await adminFetch('/api/team-stats')
      const data = await res.json()
      if (!res.ok || data.error) {
        setTeams([])
        setMessage(data.error || 'Error cargando equipos')
        return
      }

      setTeams(data.teams || data || [])
      setSetupSql(data.schema_missing ? data.setup_sql || '' : '')
      setMessage(data.schema_missing ? 'Falta aplicar la migracion 004 en Supabase. Los bonus manuales no se guardaran hasta entonces.' : '')
    } catch (e) {
      setTeams([])
      setMessage('Error cargando equipos: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateTeamStat(teamId, field, value) {
    const team = teams.find((t) => t.id === teamId)
    if (!team) return

    const updated = {
      ...team,
      [field]: field === 'phases_advanced'
        ? Math.max(0, Number(value) || 0)
        : field === 'group_finish_position'
          ? Math.max(0, Math.min(3, Number(value) || 0))
          : Boolean(value)
    }
    if (field === 'group_finish_position') updated.passed_group = Number(updated.group_finish_position || 0) > 0

    const res = await adminFetch('/api/team-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id: teamId,
        passed_group: updated.passed_group,
        group_finish_position: updated.group_finish_position,
        phases_advanced: updated.phases_advanced,
        reached_round_of_32: updated.reached_round_of_32,
        reached_round_of_16: updated.reached_round_of_16,
        reached_quarter_final: updated.reached_quarter_final,
        reached_semi_final: updated.reached_semi_final,
        reached_final: updated.reached_final,
        finalist: updated.finalist,
        third_place: updated.third_place,
        champion: updated.champion
      })
    })
    const json = await res.json().catch(() => null)

    if (res.ok) {
      setTeams(teams.map((t) => (t.id === teamId ? updated : t)))
      setMessage('Equipo actualizado')
      setTimeout(() => setMessage(''), 1800)
    } else {
      setSetupSql(json?.setup_sql || setupSql)
      setMessage(json?.error || 'Error al actualizar')
    }
  }

  async function recomputePoints() {
    setMessage('Recalculando...')
    const res = await adminFetch('/api/recompute_team_points', { method: 'POST' })
    const json = await res.json()
    if (json.schema_missing) setSetupSql(json.setup_sql || setupSql)
    setMessage(json.ok
      ? (json.schema_missing ? `Puntos recalculados para ${json.computed} equipos sin bonus manuales.` : `Puntos recalculados para ${json.computed} equipos`)
      : `Error: ${json.error}`
    )
  }

  const containerStyle = { padding: '48px 24px', minHeight: '100vh', background: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)' }
  const maxWidthStyle = { maxWidth: 1200, margin: '0 auto' }
  const titleStyle = { fontSize: 44, fontWeight: 900, marginBottom: 8 }
  const subtitleStyle = { fontSize: 16, color: '#6b7280', marginBottom: 32 }
  const buttonStyle = { padding: '14px 28px', marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 16 }
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginBottom: 24, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }
  const cellStyle = { padding: 16, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }
  const headerCellStyle = { ...cellStyle, background: '#f3f4f6', fontWeight: 700, color: '#1f2937' }
  const inputStyle = { padding: 10, width: 90, borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit' }
  const messageStyle = { marginBottom: 24, padding: 16, background: message.startsWith('Error') || message.includes('Falta') ? '#fee2e2' : '#dcfce7', borderRadius: 12, color: message.startsWith('Error') || message.includes('Falta') ? '#991b1b' : '#166534', fontWeight: 500 }
  const sqlStyle = { marginBottom: 24, padding: 16, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, color: '#9a3412' }

  if (loading) return <AdminGate><div style={containerStyle}>Cargando...</div></AdminGate>

  return (
    <AdminGate>
      <main style={containerStyle}>
        <div style={maxWidthStyle}>
          <h1 style={titleStyle}>Logros de Equipos</h1>
          <p style={subtitleStyle}>Los goles, victorias, empates y rojas salen de partidos y eventos. Aqui marcas los bonus de torneo.</p>
          <button onClick={recomputePoints} style={buttonStyle}>Recalcular Puntos de Todos</button>
          {message && <p style={messageStyle}>{message}</p>}
          {setupSql && (
            <div style={sqlStyle}>
              <strong>SQL pendiente en Supabase</strong>
              <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', marginBottom: 0 }}>{setupSql}</pre>
            </div>
          )}
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>Equipo</th>
                <th style={headerCellStyle}>Puesto grupo</th>
                <th style={headerCellStyle}>16vos</th>
                <th style={headerCellStyle}>8vos</th>
                <th style={headerCellStyle}>Cuartos</th>
                <th style={headerCellStyle}>Semis</th>
                <th style={headerCellStyle}>Final</th>
                <th style={headerCellStyle}>Tercer lugar</th>
                <th style={headerCellStyle}>Campeon</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td style={cellStyle}><strong>{team.name}</strong></td>
                  <td style={cellStyle}>
                    <select value={team.group_finish_position || 0} onChange={(e) => updateTeamStat(team.id, 'group_finish_position', e.target.value)} style={inputStyle}>
                      <option value="0">No pasa</option>
                      <option value="1">1º (+5)</option>
                      <option value="2">2º (+2)</option>
                      <option value="3">3º (+1)</option>
                    </select>
                  </td>
                  <td style={cellStyle}><input type="checkbox" checked={Boolean(team.reached_round_of_32)} onChange={(e) => updateTeamStat(team.id, 'reached_round_of_32', e.target.checked)} /></td>
                  <td style={cellStyle}><input type="checkbox" checked={Boolean(team.reached_round_of_16)} onChange={(e) => updateTeamStat(team.id, 'reached_round_of_16', e.target.checked)} /></td>
                  <td style={cellStyle}><input type="checkbox" checked={Boolean(team.reached_quarter_final)} onChange={(e) => updateTeamStat(team.id, 'reached_quarter_final', e.target.checked)} /></td>
                  <td style={cellStyle}><input type="checkbox" checked={Boolean(team.reached_semi_final)} onChange={(e) => updateTeamStat(team.id, 'reached_semi_final', e.target.checked)} /></td>
                  <td style={cellStyle}><input type="checkbox" checked={Boolean(team.reached_final)} onChange={(e) => updateTeamStat(team.id, 'reached_final', e.target.checked)} /></td>
                  <td style={cellStyle}><input type="checkbox" checked={Boolean(team.third_place)} onChange={(e) => updateTeamStat(team.id, 'third_place', e.target.checked)} /></td>
                  <td style={cellStyle}><input type="checkbox" checked={Boolean(team.champion)} onChange={(e) => updateTeamStat(team.id, 'champion', e.target.checked)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </AdminGate>
  )
}
