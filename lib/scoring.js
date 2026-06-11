export const SCORING_RULES = {
  goalFor: 1,
  goalAgainst: -1,
  redCard: -1,
  win: 3,
  draw: 1,
  groupWinner: 5,
  groupRunnerUp: 2,
  groupThird: 1,
  reachRoundOf32: 5,
  reachRoundOf16: 5,
  reachQuarterFinal: 10,
  reachSemiFinal: 15,
  reachFinal: 20,
  thirdPlace: 10,
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
    reached_round_of_32: false,
    reached_round_of_16: false,
    reached_quarter_final: false,
    reached_semi_final: false,
    reached_final: false,
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
    (score.reached_round_of_32 ? SCORING_RULES.reachRoundOf32 : 0) +
    (score.reached_round_of_16 ? SCORING_RULES.reachRoundOf16 : 0) +
    (score.reached_quarter_final ? SCORING_RULES.reachQuarterFinal : 0) +
    (score.reached_semi_final ? SCORING_RULES.reachSemiFinal : 0) +
    (score.reached_final ? SCORING_RULES.reachFinal : 0) +
    (score.third_place ? SCORING_RULES.thirdPlace : 0) +
    (score.champion ? SCORING_RULES.champion : 0)
  )
}
