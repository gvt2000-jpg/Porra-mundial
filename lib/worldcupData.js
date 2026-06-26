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

const groupMatchSchedule = {
  A: [
    [0, 1, '2026-06-11T19:00:00Z'],
    [2, 3, '2026-06-12T02:00:00Z'],
    [3, 1, '2026-06-18T16:00:00Z'],
    [0, 2, '2026-06-19T01:00:00Z'],
    [3, 0, '2026-06-25T01:00:00Z'],
    [1, 2, '2026-06-25T01:00:00Z']
  ],
  B: [
    [0, 1, '2026-06-12T19:00:00Z'],
    [2, 3, '2026-06-13T19:00:00Z'],
    [3, 1, '2026-06-18T19:00:00Z'],
    [0, 2, '2026-06-18T22:00:00Z'],
    [3, 0, '2026-06-24T19:00:00Z'],
    [1, 2, '2026-06-24T19:00:00Z']
  ],
  C: [
    [0, 1, '2026-06-13T22:00:00Z'],
    [2, 3, '2026-06-14T01:00:00Z'],
    [3, 1, '2026-06-19T22:00:00Z'],
    [0, 2, '2026-06-20T00:30:00Z'],
    [3, 0, '2026-06-24T22:00:00Z'],
    [1, 2, '2026-06-24T22:00:00Z']
  ],
  D: [
    [0, 1, '2026-06-13T01:00:00Z'],
    [2, 3, '2026-06-14T04:00:00Z'],
    [0, 2, '2026-06-19T19:00:00Z'],
    [3, 1, '2026-06-20T03:00:00Z'],
    [3, 0, '2026-06-26T02:00:00Z'],
    [1, 2, '2026-06-26T02:00:00Z']
  ],
  E: [
    [0, 1, '2026-06-14T17:00:00Z'],
    [2, 3, '2026-06-14T23:00:00Z'],
    [0, 2, '2026-06-20T20:00:00Z'],
    [3, 1, '2026-06-21T03:00:00Z'],
    [3, 0, '2026-06-25T20:00:00Z'],
    [1, 2, '2026-06-25T20:00:00Z']
  ],
  F: [
    [0, 1, '2026-06-14T20:00:00Z'],
    [2, 3, '2026-06-15T02:00:00Z'],
    [0, 2, '2026-06-20T17:00:00Z'],
    [3, 1, '2026-06-21T04:00:00Z'],
    [1, 2, '2026-06-25T23:00:00Z'],
    [3, 0, '2026-06-25T23:00:00Z']
  ],
  G: [
    [0, 1, '2026-06-15T19:00:00Z'],
    [2, 3, '2026-06-16T01:00:00Z'],
    [0, 2, '2026-06-21T19:00:00Z'],
    [3, 1, '2026-06-22T01:00:00Z'],
    [1, 2, '2026-06-27T03:00:00Z'],
    [3, 0, '2026-06-27T03:00:00Z']
  ],
  H: [
    [0, 1, '2026-06-15T16:00:00Z'],
    [2, 3, '2026-06-15T22:00:00Z'],
    [0, 2, '2026-06-21T16:00:00Z'],
    [3, 1, '2026-06-21T22:00:00Z'],
    [1, 2, '2026-06-27T00:00:00Z'],
    [3, 0, '2026-06-27T00:00:00Z']
  ],
  I: [
    [0, 1, '2026-06-16T19:00:00Z'],
    [2, 3, '2026-06-16T22:00:00Z'],
    [0, 2, '2026-06-22T21:00:00Z'],
    [3, 1, '2026-06-23T00:00:00Z'],
    [3, 0, '2026-06-26T19:00:00Z'],
    [1, 2, '2026-06-26T19:00:00Z']
  ],
  J: [
    [0, 1, '2026-06-17T01:00:00Z'],
    [2, 3, '2026-06-17T04:00:00Z'],
    [0, 2, '2026-06-22T17:00:00Z'],
    [3, 1, '2026-06-23T03:00:00Z'],
    [1, 2, '2026-06-28T02:00:00Z'],
    [3, 0, '2026-06-28T02:00:00Z']
  ],
  K: [
    [0, 1, '2026-06-17T17:00:00Z'],
    [2, 3, '2026-06-18T02:00:00Z'],
    [0, 2, '2026-06-23T17:00:00Z'],
    [3, 1, '2026-06-24T02:00:00Z'],
    [3, 0, '2026-06-27T23:30:00Z'],
    [1, 2, '2026-06-27T23:30:00Z']
  ],
  L: [
    [0, 1, '2026-06-17T20:00:00Z'],
    [2, 3, '2026-06-17T23:00:00Z'],
    [0, 2, '2026-06-23T20:00:00Z'],
    [3, 1, '2026-06-23T23:00:00Z'],
    [3, 0, '2026-06-27T21:00:00Z'],
    [1, 2, '2026-06-27T21:00:00Z']
  ]
}

export function getWorldCupGroupMatches() {
  const matches = []
  for (const group of worldCupGroups2026) {
    for (const [homeIndex, awayIndex, starts_at] of groupMatchSchedule[group.label] || []) {
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
