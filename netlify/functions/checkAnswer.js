const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  console.log(body)
  if (!body.teamId || !body.teamName || !body.answer || !body.clueId) {``
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Missing parameters" }),
    };
  }
  const teamId = body.teamId;
  const teamName = body.teamName;
  const clueId = body.clueId;
  const answer = body.answer;
  console.log(answer)

  const clue = await getClue(Number(clueId - 1).toString(), teamId, teamName, db);
  const team = await db.collection("teams").findOne({ teamId: teamId, teamName: teamName });
  if (!clue || !team) {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "Unauthorized" }),
    };
  } else if (answer.toLowerCase() === clue.answer.toLowerCase()) {
    let teamClues = team.cluesCompleted;
    teamClues[Number(clueId) - 1] = true;
    await db.collection("teams").updateOne({ teamId: teamId }, { $set: { cluesCompleted: teamClues } });
    await db.collection("teams").updateOne({ teamId: teamId }, { $inc: { score: 1}} );
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success", message: "Authorized" }),
    };
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "Unauthorized" }),
    }
  }
};


async function getClue(clueId, teamId, teamName, db) {
  console.log("ClueID:" + clueId)
  let team = await db.collection("teams").findOne({ teamId: teamId, teamName: teamName });
  let clue = await db.collection("clues").findOne({ clueId: clueId });
  if (!team || !clue) {
    return null;
  } else if (team.difficulty === "easy") {
    return {
      location: clue.easy.location,
      riddle: clue.easy.riddle,
      answer: clue.easy.answer,
    }
  } else if (team.difficulty === "classical") {
    return {
      location: clue.classical.location,
      riddle: clue.classical.riddle,
      answer: clue.classical.answer,
    }
  } else {
    return null
  }
}