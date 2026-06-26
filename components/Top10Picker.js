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
  const progress = selectedTeamIds.size

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

  return (
    <form onSubmit={submit} className="form-card" style={{ maxWidth: 780 }}>
      <div className="field-row">
        <label className="label">Tu nombre</label>
        <input
          className="input"
          value={submitter}
          onChange={(e) => setSubmitter(e.target.value)}
          placeholder="Nombre público"
          disabled={locked}
        />
      </div>

      <div style={{ margin: '18px 0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8, fontWeight: 850 }}>
          <span>Equipos seleccionados</span>
          <span>{progress}/10</span>
        </div>
        <div style={{ height: 8, background: '#eef2f7', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${progress * 10}%`, height: '100%', background: 'linear-gradient(135deg, var(--brand), var(--accent))' }} />
        </div>
      </div>

      {loading && <p className="alert alert-info">Cargando equipos oficiales...</p>}
      {locked && <p className="alert alert-error">Predicciones cerradas. Ya puedes seguir el ranking y comparar participantes.</p>}
      {error && <p className="alert alert-error">{error}</p>}
      {!loading && teams.length === 0 && <p className="alert alert-info">No hay equipos cargados. Importa equipos desde el panel admin.</p>}

      <div style={{ display: 'grid', gap: 10, marginBottom: 22 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="field-row">
            <div className="label" style={{ color: 'var(--accent)' }}>#{i + 1}</div>
            <select
              className="select"
              value={teamIds[i]}
              onChange={(e) => handleTeamIdChange(i, e.target.value)}
              disabled={disabled}
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

      <button type="submit" disabled={disabled} className="btn btn-primary" style={{ width: '100%', opacity: disabled ? 0.58 : 1 }}>
        Guardar mi Top10
      </button>
    </form>
  )
}
