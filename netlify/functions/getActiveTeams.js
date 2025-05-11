const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  
  const teams = await db.collection("teams").find({}).toArray();
  const activeTeams = []
  teams.forEach((team) => {
    if (team.active) {
      activeTeams.push(team.teamName);
    }
  })
  activeTeams.sort((a, b) => a.localeCompare(b));
  
  if (!teams) {
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
      teams: activeTeams
    })
  }
};