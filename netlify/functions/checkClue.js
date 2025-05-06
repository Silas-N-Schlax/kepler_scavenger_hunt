const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body.teamId || !body.teamName) {``
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Missing parameters" }),
    };
  }
  const teamId = body.teamId;
  const teamName = body.teamName;

  const clues = await db.collection("clues").find({}).toArray();
  const team = await db.collection("teams").findOne({ teamId: teamId, teamName: teamName });
  
  if (!clues || !team) {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "Unauthorized" }),
    };
  } else {
    let allClueInfo = []
    clues.forEach(clue => {
      let clueInfo = {
        clueId: clue.clueId,
        status: "🔐",
      }
      if (team.cluesCompleted[Number(clue.clueId) - 1] === true) {
        clueInfo.status = "✅"
      }
      allClueInfo.push(clueInfo)
    })
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        status: "success", 
        message: "Authorized",
        clues: allClueInfo,
      }),
    }
  }
};