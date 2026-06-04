import { useEffect, useMemo, useState } from 'react'

export default function Top10Picker({ onSubmit, locked = false }) {
  const [teams, setTeams] = useState([])
  const [teamIds, setTeamIds] = useState(Array.from({ length: 10 }, () => ''))
  const [submitter, setSubmitter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/teams')
      .then((res) => res.json())
      .then((data) => setTeams(data.teams || []))
      .catch(() => setError('No se pudieron cargar los equipos.'))
      .finally(() => setLoading(false))
  }, [])

  const selectedTeamIds = useMemo(() => new Set(teamIds.filter(Boolean)), [teamIds])

  function handleTeamIdChange(i, value) {
    const copy = [...teamIds]
    copy[i] = value
    setTeamIds(copy)
  }

  function submit(e) {
    e.preventDefault()
    if (locked) {
      setError('Las predicciones ya están cerradas.')
      return
    }
    if (!submitter.trim()) {
      setError('El nombre del participante es obligatorio.')
      return
    }
    if (teamIds.some((teamId) => !teamId)) {
      setError('Selecciona los 10 equipos antes de enviar.')
      return
    }
    if (selectedTeamIds.size !== 10) {
      setError('Cada equipo debe ser único en tu Top10.')
      return
    }
    setError(null)
    const picks = teamIds.map((team_id, idx) => ({ rank: idx + 1, team_id }))
    onSubmit({ user_name: submitter.trim(), picks })
  }

  const disabled = locked || loading || teams.length === 0
  const formStyle = { maxWidth: 720, margin: '0 auto', padding: 32, background: '#ffffff', borderRadius: 12, boxShadow: '0 16px 40px rgba(0,0,0,0.1)' }
  const rowStyle = { display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12, alignItems: 'center', marginBottom: 16 }
  const labelStyle = { fontWeight: 700, fontSize: 15, color: '#1f2937' }
  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 16, fontFamily: 'inherit', boxSizing: 'border-box' }
  const buttonStyle = { padding: '14px 28px', borderRadius: 10, background: '#4f46e5', color: '#fff', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 16, width: '100%', opacity: disabled ? 0.55 : 1 }
  const errorStyle = { color: '#991b1b', marginBottom: 16, padding: 12, background: '#fee2e2', borderRadius: 10, fontSize: 14, fontWeight: 600 }
  const messageStyle = { marginBottom: 16, padding: 12, background: '#dbeafe', borderRadius: 10, fontSize: 14, color: '#1e40af' }

  return (
    <form onSubmit={submit} style={formStyle}>
      <div style={rowStyle}>
        <label style={labelStyle}>Tu nombre</label>
        <input
          value={submitter}
          onChange={(e) => setSubmitter(e.target.value)}
          placeholder="Nombre público"
          disabled={locked}
          style={inputStyle}
        />
      </div>
      {loading && <p style={messageStyle}>Cargando equipos oficiales...</p>}
      {locked && <p style={errorStyle}>Predicciones cerradas. Ya puedes seguir el ranking y comparar participantes.</p>}
      {error && <p style={errorStyle}>{error}</p>}
      {!loading && teams.length === 0 && <p style={messageStyle}>No hay equipos cargados. Importa equipos desde el panel admin.</p>}
      <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={rowStyle}>
            <div style={{ ...labelStyle, fontSize: 18, color: '#4f46e5' }}>#{i + 1}</div>
            <select
              value={teamIds[i]}
              onChange={(e) => handleTeamIdChange(i, e.target.value)}
              disabled={disabled}
              style={{ ...inputStyle, cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
              <option value="">Selecciona un equipo...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id} disabled={selectedTeamIds.has(team.id) && teamIds[i] !== team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <button type="submit" disabled={disabled} style={buttonStyle}>
        Guardar mi Top10
      </button>
    </form>
  )
}
