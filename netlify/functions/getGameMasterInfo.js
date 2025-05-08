const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
 
  let clues = await getCluesSorted(db);
  let teams = await getTeamNames(db);
  let clueIds = await getClueIds(db);

  if (!clues || !teams || !clueIds) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        message: "Failed to retrieve data from the database."
      })
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      clues: clues,
      teams: teams,
      clueIds: clueIds
    })
  }
}

async function getCluesSorted(db) {
  const clues = await db.collection("clues").find({}).toArray();
  return clues.sort((a, b) => a.clueId - b.clueId);
}

async function getTeamNames(db) {
  const teams = await db.collection("teams").find({}).toArray();
  return teams.map(team => team.teamName);
}

async function getClueIds(db) {
  const clues = await db.collection("clues").find({}).toArray();
  return clues.map(clue => clue.clueId).filter(clueId => clueId !== "0");
}
