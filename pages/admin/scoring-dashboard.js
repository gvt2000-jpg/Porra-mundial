import { useEffect, useMemo, useState } from 'react'
import AdminGate from '../../components/AdminGate'
import { adminFetch } from '../../lib/adminClient'
import { SCORING_RULES } from '../../lib/scoring'

const STAGE_LABELS = {
  group: 'Grupos',
  group_A: 'Grupo A',
  group_B: 'Grupo B',
  group_C: 'Grupo C',
  group_D: 'Grupo D',
  group_E: 'Grupo E',
  group_F: 'Grupo F',
  group_G: 'Grupo G',
  group_H: 'Grupo H',
  group_I: 'Grupo I',
  group_J: 'Grupo J',
  group_K: 'Grupo K',
  group_L: 'Grupo L',
  round_of_32: 'Dieciseisavos',
  round_of_16: 'Octavos',
  quarter_final: 'Cuartos',
  semi_final: 'Semifinales',
  third_place: 'Tercer puesto',
  final: 'Final'
}

const STAGE_ORDER = [
  'group_A',
  'group_B',
  'group_C',
  'group_D',
  'group_E',
  'group_F',
  'group_G',
  'group_H',
  'group_I',
  'group_J',
  'group_K',
  'group_L',
  'group',
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'third_place',
  'final'
]

function stageLabel(stage) {
  return STAGE_LABELS[stage] || stage || 'Sin fase'
}

function sortByDate(a, b) {
  return new Date(a.starts_at || 0).getTime() - new Date(b.starts_at || 0).getTime()
}

export default function ScoringDashboard() {
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [events, setEvents] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [form, setForm] = useState({ home_team_id: '', away_team_id: '', stage: 'group', starts_at: '' })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [setupSql, setSetupSql] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  const teamById = useMemo(() => Object.fromEntries(teams.map((team) => [team.id, team])), [teams])

  const eventsByMatch = useMemo(() => {
    const grouped = {}
    for (const event of events) {
      if (!grouped[event.match_id]) grouped[event.match_id] = []
      grouped[event.match_id].push(event)
    }
    return grouped
  }, [events])

  const groupedMatches = useMemo(() => {
    const groups = {}
    for (const match of [...matches].sort(sortByDate)) {
      const key = match.stage || 'group'
      if (!groups[key]) groups[key] = []
      groups[key].push(match)
    }
    return Object.entries(groups).sort(([a], [b]) => {
      const orderA = STAGE_ORDER.indexOf(a)
      const orderB = STAGE_ORDER.indexOf(b)
      if (orderA === -1 && orderB === -1) return a.localeCompare(b)
      if (orderA === -1) return 1
      if (orderB === -1) return -1
      return orderA - orderB
    })
  }, [matches])

  async function loadAll() {
    setLoading(true)
    await Promise.all([loadTeams(), loadMatches(), loadEvents(), loadLeaderboard()])
    setLoading(false)
  }

  async function loadTeams() {
    try {
      const res = await adminFetch('/api/team-stats')
      const data = await res.json()
      if (!res.ok || data.error) {
        setTeams([])
        setMessage(data.error || 'Error cargando equipos')
        return
      }
      setTeams(data.teams || [])
      setSetupSql(data.schema_missing ? data.setup_sql || '' : '')
      if (data.schema_missing) setMessage('Falta aplicar la migracion 004 en Supabase. Recalcular funcionara sin bonus manuales.')
    } catch (e) {
      setMessage('Error cargando equipos: ' + e.message)
    }
  }

  async function loadMatches() {
    try {
      const res = await adminFetch('/api/matches')
      const data = await res.json()
      if (!res.ok || data.error) {
        setMatches([])
        setMessage(data.error || 'Error cargando partidos')
        return
      }
      setMatches(data.matches || [])
    } catch (e) {
      setMessage('Error cargando partidos: ' + e.message)
    }
  }

  async function loadEvents() {
    try {
      const res = await adminFetch('/api/match_events')
      const data = await res.json()
      if (!res.ok || data.error) {
        setEvents([])
        setMessage(data.error || 'Error cargando eventos')
        return
      }
      setEvents(data.events || [])
    } catch (e) {
      setMessage('Error cargando eventos: ' + e.message)
    }
  }

  async function loadLeaderboard() {
    const res = await fetch('/api/leaderboard')
    const json = await res.json()
    setLeaderboard(json.leaderboard || [])
  }

  async function createMatch(e) {
    e.preventDefault()
    if (!form.home_team_id || !form.away_team_id) {
      setMessage('Selecciona local y visitante para crear el partido.')
      return
    }

    setMessage('Creando partido...')
    const res = await adminFetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const json = await res.json()

    if (res.ok) {
      setMatches((current) => [...current, json.match])
      setForm({ home_team_id: '', away_team_id: '', stage: 'group', starts_at: '' })
      setMessage('Partido creado.')
    } else {
      setMessage('Error: ' + (json?.error || 'Error creando partido'))
    }
  }

  async function updateMatch(id, updates) {
    const res = await adminFetch('/api/matches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    })
    const json = await res.json().catch(() => null)

    if (res.ok) {
      setMatches((current) => current.map((match) => (match.id === id ? json.match : match)))
      setMessage('Partido actualizado.')
      await syncProgression(false)
    } else {
      setMessage('Error: ' + (json?.error || 'Error actualizando partido'))
    }
  }

  async function syncProgression(showMessage = true) {
    const res = await adminFetch('/api/sync_tournament_progression', { method: 'POST' })
    const json = await res.json().catch(() => null)

    if (res.ok) {
      await loadMatches()
      if (showMessage) setMessage(`Bracket sincronizado. Creados ${json.created}, actualizados ${json.updated}.`)
    } else {
      setMessage('Error: ' + (json?.error || 'Error sincronizando bracket'))
    }
  }

  async function addRedCard(match, teamId) {
    const playerName = window.prompt('Jugador expulsado (opcional)', '') || ''
    const minuteRaw = window.prompt('Minuto de la roja (opcional)', '') || ''
    const minute = minuteRaw.trim() === '' ? null : Number(minuteRaw)
    if (minuteRaw.trim() !== '' && Number.isNaN(minute)) {
      setMessage('El minuto debe ser un numero.')
      return
    }

    const res = await adminFetch('/api/match_events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: match.id,
        team_id: teamId,
        event_type: 'red_card',
        player_name: playerName,
        minute
      })
    })
    const json = await res.json().catch(() => null)

    if (res.ok) {
      setEvents((current) => [...current, json.event])
      setMessage('Roja registrada.')
    } else {
      setMessage('Error: ' + (json?.error || 'Error registrando roja'))
    }
  }

  async function deleteEvent(id) {
    const res = await adminFetch('/api/match_events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    const json = await res.json().catch(() => null)

    if (res.ok) {
      setEvents((current) => current.filter((event) => event.id !== id))
      setMessage('Roja eliminada.')
    } else {
      setMessage('Error: ' + (json?.error || 'Error eliminando roja'))
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
        finalist: updated.finalist,
        third_place: updated.third_place,
        champion: updated.champion
      })
    })
    const json = await res.json().catch(() => null)

    if (res.ok) {
      setTeams(teams.map((t) => (t.id === teamId ? updated : t)))
      setMessage('Logro actualizado.')
    } else {
      setSetupSql(json?.setup_sql || setupSql)
      setMessage(json?.error || 'Error actualizando equipo')
    }
  }

  async function recomputePoints() {
    setMessage('Recalculando puntos...')
    const res = await adminFetch('/api/recompute_team_points', { method: 'POST' })
    const json = await res.json()

    if (json.ok) {
      if (json.schema_missing) setSetupSql(json.setup_sql || setupSql)
      setMessage(json.schema_missing
        ? `Puntos recalculados para ${json.computed} equipos sin bonus manuales. Aplica la migracion 004.`
        : `Puntos recalculados para ${json.computed} equipos.`
      )
      await loadAll()
    } else {
      setMessage(`Error: ${json.error}`)
    }
  }

  async function importTeams() {
    setMessage('Importando equipos 2026...')
    const res = await adminFetch('/api/import_world_cup_teams', { method: 'POST' })
    const json = await res.json()

    if (res.ok) {
      setMessage(`Importados ${json.imported} equipos.`)
      await loadTeams()
    } else {
      setMessage('Error: ' + (json?.error || 'Error al importar equipos'))
    }
  }

  async function importMatches() {
    setMessage('Importando partidos oficiales...')
    const res = await adminFetch('/api/import_world_cup_matches', { method: 'POST' })
    const json = await res.json()

    if (res.ok) {
      setMessage(`Importados ${json.imported} partidos.`)
      await Promise.all([loadTeams(), loadMatches()])
    } else {
      setMessage('Error: ' + (json?.error || 'Error al importar partidos'))
    }
  }

  async function resetAll() {
    if (!confirm('Seguro? Esto eliminara todas las estadisticas y picks de usuarios.')) return
    setMessage('Reseteando sistema...')
    const res = await adminFetch('/api/reset-all', { method: 'POST' })
    const json = await res.json()

    if (json.ok) {
      setMessage(`Sistema reseteado. ${json.reset_teams} equipos restaurados.`)
      await loadAll()
    } else {
      setMessage(`Error: ${json.error}`)
    }
  }

  const rules = [
    ['Gol a favor', SCORING_RULES.goalFor],
    ['Gol en contra', SCORING_RULES.goalAgainst],
    ['Tarjeta roja', SCORING_RULES.redCard],
    ['Victoria', SCORING_RULES.win],
    ['Empate', SCORING_RULES.draw],
    ['Primero de grupo', SCORING_RULES.groupWinner],
    ['Segundo de grupo', SCORING_RULES.groupRunnerUp],
    ['Tercero clasificado', SCORING_RULES.groupThird],
    ['Pasar de fase', SCORING_RULES.phaseAdvanced],
    ['Finalista', SCORING_RULES.finalist],
    ['Tercer lugar', SCORING_RULES.thirdPlace],
    ['Campeon', SCORING_RULES.champion]
  ]

  const containerStyle = { padding: '40px 20px', minHeight: '100vh', background: '#f5f7fb' }
  const maxWidthStyle = { maxWidth: 1480, margin: '0 auto' }
  const titleStyle = { fontSize: 42, fontWeight: 900, margin: '0 0 8px', color: '#111827' }
  const subtitleStyle = { fontSize: 16, color: '#6b7280', margin: '0 0 24px' }
  const sectionStyle = { marginBottom: 28, padding: 24, background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(15,23,42,0.05)' }
  const sectionTitleStyle = { fontSize: 22, fontWeight: 850, margin: '0 0 16px', color: '#111827' }
  const toolbarStyle = { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }
  const buttonStyle = { padding: '10px 16px', borderRadius: 8, border: '1px solid transparent', cursor: 'pointer', fontWeight: 750, fontSize: 14, fontFamily: 'inherit' }
  const primaryButtonStyle = { ...buttonStyle, background: '#2563eb', color: '#fff' }
  const quietButtonStyle = { ...buttonStyle, background: '#eef2ff', color: '#3730a3', borderColor: '#c7d2fe' }
  const dangerButtonStyle = { ...buttonStyle, background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' }
  const messageStyle = { margin: '0 0 20px', padding: 14, borderRadius: 8, background: message.startsWith('Error') || message.includes('Falta') ? '#fee2e2' : '#dcfce7', color: message.startsWith('Error') || message.includes('Falta') ? '#991b1b' : '#166534', fontWeight: 650 }
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'inherit', background: '#fff' }
  const smallInputStyle = { ...inputStyle, width: 62, textAlign: 'center', padding: '8px 6px', fontWeight: 800 }
  const tableStyle = { width: '100%', borderCollapse: 'collapse', background: '#fff' }
  const cellStyle = { padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }
  const headerCellStyle = { ...cellStyle, background: '#f9fafb', color: '#374151', fontSize: 13, fontWeight: 800 }

  if (loading) {
    return (
      <AdminGate>
        <main style={containerStyle}>Cargando panel...</main>
      </AdminGate>
    )
  }

  return (
    <AdminGate>
      <main style={containerStyle}>
        <div style={maxWidthStyle}>
          <h1 style={titleStyle}>Partidos y puntuacion</h1>
          <p style={subtitleStyle}>Mete resultados, rojas y bonus de torneo desde una sola pantalla. Despues recalcula para actualizar la porra.</p>

          {message && <p style={messageStyle}>{message}</p>}
          {setupSql && (
            <div style={{ ...sectionStyle, background: '#fff7ed', borderColor: '#fed7aa', color: '#9a3412' }}>
              <strong>SQL pendiente en Supabase</strong>
              <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', marginBottom: 0 }}>{setupSql}</pre>
            </div>
          )}

          <div style={toolbarStyle}>
            <button onClick={recomputePoints} style={primaryButtonStyle}>Recalcular puntos</button>
            <button onClick={() => syncProgression(true)} style={quietButtonStyle}>Sincronizar bracket</button>
            <button onClick={importTeams} style={quietButtonStyle}>Importar equipos</button>
            <button onClick={importMatches} style={quietButtonStyle}>Importar partidos</button>
            <button onClick={loadAll} style={quietButtonStyle}>Refrescar</button>
            <button onClick={resetAll} style={dangerButtonStyle}>Resetear todo</button>
          </div>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Reglas de puntos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              {rules.map(([label, value]) => (
                <div key={label} style={{ padding: 14, borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 650 }}>{label}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: value < 0 ? '#b91c1c' : '#2563eb' }}>{value > 0 ? `+${value}` : value}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Crear partido manual</h2>
            <form onSubmit={createMatch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr)) auto', gap: 12, alignItems: 'end' }}>
              <label style={{ fontWeight: 750 }}>
                Local
                <select value={form.home_team_id} onChange={(e) => setForm({ ...form, home_team_id: e.target.value })} style={{ ...inputStyle, marginTop: 6 }}>
                  <option value="">Selecciona</option>
                  {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </label>
              <label style={{ fontWeight: 750 }}>
                Visitante
                <select value={form.away_team_id} onChange={(e) => setForm({ ...form, away_team_id: e.target.value })} style={{ ...inputStyle, marginTop: 6 }}>
                  <option value="">Selecciona</option>
                  {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </label>
              <label style={{ fontWeight: 750 }}>
                Fase
                <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} style={{ ...inputStyle, marginTop: 6 }}>
                  {STAGE_ORDER.map((stage) => <option key={stage} value={stage}>{stageLabel(stage)}</option>)}
                </select>
              </label>
              <label style={{ fontWeight: 750 }}>
                Inicio
                <input value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} placeholder="2026-06-11T21:00:00Z" style={{ ...inputStyle, marginTop: 6 }} />
              </label>
              <button type="submit" style={primaryButtonStyle}>Crear</button>
            </form>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Partidos, goles y rojas</h2>
            {matches.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No hay partidos cargados.</p>
            ) : (
              groupedMatches.map(([stage, stageMatches]) => (
                <div key={stage} style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: 18, color: '#1f2937' }}>{stageLabel(stage)}</h3>
                  <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={headerCellStyle}>Fecha</th>
                          <th style={headerCellStyle}>Local</th>
                          <th style={headerCellStyle}>Marcador</th>
                          <th style={headerCellStyle}>Visitante</th>
                          <th style={headerCellStyle}>Estado</th>
                          <th style={headerCellStyle}>Rojas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stageMatches.map((match) => {
                          const home = teamById[match.home_team_id]
                          const away = teamById[match.away_team_id]
                          const redCards = (eventsByMatch[match.id] || []).filter((event) => event.event_type === 'red_card')
                          const isGroupMatch = String(match.stage || '').startsWith('group')
                          const isTie = Boolean(match.played) && Number(match.home_score || 0) === Number(match.away_score || 0)
                          const winnerRequired = !isGroupMatch && isTie

                          return (
                            <tr key={match.id}>
                              <td style={cellStyle}>{match.starts_at ? new Date(match.starts_at).toLocaleString('es-ES') : 'Sin fecha'}</td>
                              <td style={cellStyle}><strong>{home?.name || 'Local'}</strong></td>
                              <td style={cellStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <input type="number" min="0" defaultValue={match.home_score ?? 0} onBlur={(e) => updateMatch(match.id, { home_score: Number(e.target.value) })} style={smallInputStyle} />
                                  <span style={{ color: '#6b7280', fontWeight: 900 }}>-</span>
                                  <input type="number" min="0" defaultValue={match.away_score ?? 0} onBlur={(e) => updateMatch(match.id, { away_score: Number(e.target.value) })} style={smallInputStyle} />
                                </div>
                              </td>
                              <td style={cellStyle}><strong>{away?.name || 'Visitante'}</strong></td>
                              <td style={cellStyle}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700 }}>
                                  <input type="checkbox" checked={Boolean(match.played)} onChange={(e) => updateMatch(match.id, { played: e.target.checked })} />
                                  {match.played ? 'Jugado' : 'Pendiente'}
                                </label>
                                {!isGroupMatch && (
                                  <label style={{ display: 'grid', gap: 5, marginTop: 10, fontSize: 12, color: '#4b5563', fontWeight: 750 }}>
                                    Pasa
                                    <select value={match.winner_team_id || ''} onChange={(e) => updateMatch(match.id, { winner_team_id: e.target.value || null })} style={{ ...inputStyle, padding: '7px 8px' }}>
                                      <option value="">Auto por marcador</option>
                                      {home && <option value={home.id}>{home.name}</option>}
                                      {away && <option value={away.id}>{away.name}</option>}
                                    </select>
                                  </label>
                                )}
                                {winnerRequired && !match.winner_team_id && (
                                  <div style={{ marginTop: 8, color: '#b91c1c', fontSize: 12, fontWeight: 800 }}>Selecciona quien paso.</div>
                                )}
                              </td>
                              <td style={cellStyle}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: redCards.length ? 8 : 0 }}>
                                  <button type="button" onClick={() => addRedCard(match, match.home_team_id)} style={dangerButtonStyle}>Roja {home?.name || 'local'}</button>
                                  <button type="button" onClick={() => addRedCard(match, match.away_team_id)} style={dangerButtonStyle}>Roja {away?.name || 'visitante'}</button>
                                </div>
                                {redCards.map((event) => (
                                  <div key={event.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, fontSize: 13, color: '#991b1b' }}>
                                    <span>
                                      {teamById[event.team_id]?.name || 'Equipo'}{event.minute ? `, ${event.minute}'` : ''}{event.player_name ? `, ${event.player_name}` : ''}
                                    </span>
                                    <button type="button" onClick={() => deleteEvent(event.id)} style={{ ...buttonStyle, padding: '4px 8px', background: '#fff', color: '#991b1b', borderColor: '#fecaca' }}>Quitar</button>
                                  </div>
                                ))}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Bonus de torneo</h2>
            <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>Equipo</th>
                    <th style={headerCellStyle}>Puesto grupo</th>
                    <th style={headerCellStyle}>Fases extra</th>
                    <th style={headerCellStyle}>Finalista</th>
                    <th style={headerCellStyle}>Tercero</th>
                    <th style={headerCellStyle}>Campeon</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id}>
                      <td style={cellStyle}><strong>{team.name}</strong></td>
                      <td style={cellStyle}>
                        <select value={team.group_finish_position || 0} onChange={(e) => updateTeamStat(team.id, 'group_finish_position', e.target.value)} style={{ ...inputStyle, padding: '7px 8px' }}>
                          <option value="0">No pasa</option>
                          <option value="1">1º (+5)</option>
                          <option value="2">2º (+2)</option>
                          <option value="3">3º (+1)</option>
                        </select>
                      </td>
                      <td style={cellStyle}><input type="number" min="0" value={team.phases_advanced || 0} onChange={(e) => updateTeamStat(team.id, 'phases_advanced', e.target.value)} style={smallInputStyle} /></td>
                      <td style={cellStyle}><input type="checkbox" checked={Boolean(team.finalist)} onChange={(e) => updateTeamStat(team.id, 'finalist', e.target.checked)} /></td>
                      <td style={cellStyle}><input type="checkbox" checked={Boolean(team.third_place)} onChange={(e) => updateTeamStat(team.id, 'third_place', e.target.checked)} /></td>
                      <td style={cellStyle}><input type="checkbox" checked={Boolean(team.champion)} onChange={(e) => updateTeamStat(team.id, 'champion', e.target.checked)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Leaderboard</h2>
            {leaderboard.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No hay envios aun.</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {leaderboard.slice(0, 12).map((row, idx) => (
                  <div key={`${row.submitter}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: 14, alignItems: 'center', padding: 14, borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <strong>#{idx + 1}</strong>
                    <div>
                      <div style={{ fontWeight: 800 }}>{row.submitter}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{(row.breakdown || []).length} equipos puntuando</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 20, fontWeight: 900, color: '#2563eb' }}>{Number(row.total || 0).toFixed(1)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminGate>
  )
}
