export const SCORING_RULES = {
  goalFor: 1,
  goalAgainst: -1,
  redCard: -1,
  win: 3,
  draw: 1,
  groupWinner: 5,
  groupRunnerUp: 2,
  groupThird: 1,
  phaseAdvanced: 5,
  finalist: 10,
  thirdPlace: 5,
  champion: 20
}

export function emptyTeamScore() {
  return {
    goals_for: 0,
    goals_against: 0,
    wins: 0,
    draws: 0,
    red_cards: 0,
    passed_group: false,
    group_finish_position: 0,
    phases_advanced: 0,
    finalist: false,
    third_place: false,
    champion: false,
    points: 0
  }
}

export function calculateTeamPoints(score) {
  return (
    score.goals_for * SCORING_RULES.goalFor +
    score.goals_against * SCORING_RULES.goalAgainst +
    score.red_cards * SCORING_RULES.redCard +
    score.wins * SCORING_RULES.win +
    score.draws * SCORING_RULES.draw +
    (Number(score.group_finish_position || 0) === 1 ? SCORING_RULES.groupWinner : 0) +
    (Number(score.group_finish_position || 0) === 2 ? SCORING_RULES.groupRunnerUp : 0) +
    (Number(score.group_finish_position || 0) === 3 ? SCORING_RULES.groupThird : 0) +
    Number(score.phases_advanced || 0) * SCORING_RULES.phaseAdvanced +
    (score.finalist ? SCORING_RULES.finalist : 0) +
    (score.third_place ? SCORING_RULES.thirdPlace : 0) +
    (score.champion ? SCORING_RULES.champion : 0)
  )
}
