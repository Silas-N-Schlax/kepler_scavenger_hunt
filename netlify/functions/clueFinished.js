const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body.teamId || !body.teamName || !body.clueID) {``
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Missing parameters" }),
    };
  }
  const teamId = body.teamId;
  const teamName = body.teamName;
  const clueId = body.clueID;
  const team = await db.collection("teams").findOne({ teamId: teamId, teamName: teamName });
  if (!team) {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "Unauthorized", finished: false }),  
    };
  } else if (team.cluesCompleted[Number(clueId) - 1] === false) {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "Unauthorized", finished: false }),
    }
  } else {
    const clue = await getClue(clueId, teamId, teamName, db);
    if (!clue) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Clue not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        status: "success", 
        message: "Authorized",
        location: clue.location,
        nextClue: clue.riddle,
        answer: await showerAnswer(clueId, teamId, teamName, clue.answer),
        finished: true,
      }),
    }
  }
};

async function showerAnswer(clueId, teamId, teamName) {
  const db = await database.returnDatabase();
  const clue = await getClue((Number(clueId) + 1).toString(), teamId, teamName, db);
  const team = await db.collection("teams").findOne({ teamId: teamId, teamName: teamName });
  const teamClueStatus = team.cluesCompleted[Number(clueId)];
  console.log("TeamClueStatus: " + teamClueStatus)
  if (!clue) {
    return "⚠️"
  } else if (teamClueStatus === false) {
    return "🔐"
  } else if (teamClueStatus === true){
    const clue = await getClue(clueId, teamId, teamName, db);
    if (!clue) {
      return "⚠️"
    }
    return clue.answer;
  } else if (teamClueStatus === null) {
    return "🚫"
  } else {
    return "⚠️"
  }
}

async function getClue(clueId, teamId, teamName, db) {
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