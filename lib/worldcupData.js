export const worldCupGroups2026 = [
  {
    label: 'A',
    teams: ['México', 'Sudáfrica', 'Corea del Sur', 'República Checa']
  },
  {
    label: 'B',
    teams: ['Canadá', 'Bosnia y Herzegovina', 'Catar', 'Suiza']
  },
  {
    label: 'C',
    teams: ['Brasil', 'Marruecos', 'Haití', 'Escocia']
  },
  {
    label: 'D',
    teams: ['Estados Unidos', 'Paraguay', 'Australia', 'Turquía']
  },
  {
    label: 'E',
    teams: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador']
  },
  {
    label: 'F',
    teams: ['Países Bajos', 'Japón', 'Suecia', 'Túnez']
  },
  {
    label: 'G',
    teams: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda']
  },
  {
    label: 'H',
    teams: ['España', 'Cabo Verde', 'Arabia Saudí', 'Uruguay']
  },
  {
    label: 'I',
    teams: ['Francia', 'Senegal', 'Irak', 'Noruega']
  },
  {
    label: 'J',
    teams: ['Argentina', 'Argelia', 'Austria', 'Jordania']
  },
  {
    label: 'K',
    teams: ['Portugal', 'RD Congo', 'Uzbekistán', 'Colombia']
  },
  {
    label: 'L',
    teams: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá']
  }
]

export const worldCupTeams2026 = worldCupGroups2026.flatMap((group) => group.teams)

const pairings = [
  [0, 1],
  [2, 3],
  [0, 2],
  [3, 1],
  [3, 0],
  [1, 2]
]
const matchTimes = ['13:00:00Z', '16:00:00Z', '19:00:00Z', '13:30:00Z', '16:30:00Z', '19:30:00Z']

export function getWorldCupGroupMatches() {
  const matches = []
  for (let groupIndex = 0; groupIndex < worldCupGroups2026.length; groupIndex++) {
    const group = worldCupGroups2026[groupIndex]
    for (let matchIndex = 0; matchIndex < pairings.length; matchIndex++) {
      const [homeIndex, awayIndex] = pairings[matchIndex]
      const baseDay = 11 + (groupIndex % 7)
      const dayOffset = Math.floor(matchIndex / 2) * 7
      const day = baseDay + dayOffset
      const date = new Date(Date.UTC(2026, 5, day))
      const time = matchTimes[matchIndex]
      const starts_at = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}T${time}`
      matches.push({
        home_team_name: group.teams[homeIndex],
        away_team_name: group.teams[awayIndex],
        stage: `group_${group.label}`,
        starts_at
      })
    }
  }
  return matches
}
