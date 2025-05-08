const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);

  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Missing parameters" }),
    };
  }

  const teams = await db.collection("teams").find({}).toArray(); 
  const winners = await db.collection("winners").find({}).toArray();
  let scores = teams.map(team => {
    return {
      teamId: team.teamId,
      teamName: team.teamName,
      score: team.score,
    };
  });
  scores.sort((a, b) => b.score - a.score); // Sort by score in descending order
  scores = orderWinners(scores, winners)
  if (!scores) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: "Failed to fetch leaderboard" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ status: "success", leaderboard: scores }),
  };
};


function orderWinners(scores, winners) {
  let finalOrder = []
  console.log(scores)
  console.log(winners[0].winners)
  winners[0].winners.forEach((winner) => {
    if (scores.map(score => score.teamName).includes(winner.teamName)) {
      finalOrder.push({
        teamId: winner.teamId,
        teamName: winner.teamName,
        score: scores.find(score => score.teamName === winner.teamName).score,
      })
      scores = scores.filter(score => score.teamName !== winner.teamName)
      console.log(scores)
    }
  })
  return finalOrder.concat(scores)
}
