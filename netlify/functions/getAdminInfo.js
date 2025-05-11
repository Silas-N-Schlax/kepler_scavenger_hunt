const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
 
  const teams = await getTeams(db);
  const players = await getPlayers(db);
  const winners = await getWinners(db);
  const accounts = await getAccounts(db);
  const teamNames = await getTeamNames(db);
  const colors = await getColorSchemes(db);
  const chatData = await getChatData(db);

  if (!teams || !players || !winners || !accounts || !teamNames || !colors || !chatData) {
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
      teams: teams,
      players: players,
      winners: winners,
      accounts: accounts,
      teamNames: teamNames,
      colors: colors,
      chatData: chatData
    })
  }
}

async function getTeams(db) {
  return await db.collection("teams").find({}).toArray();
}

async function getPlayers(db) {
  return await db.collection("players").find({}).toArray();
}

async function getWinners(db) {
  return await db.collection("winners").find({}).toArray();
}

async function getAccounts(db) {
  return await db.collection("accounts").find({}).toArray();
}

async function getTeamNames(db) {
  const teams = await db.collection("teams").find({}).toArray();
  return teams.map(team => team.teamName);
}

async function getColorSchemes(db) {
  const colorSchemes = await db.collection("colorSchemes").find({}).toArray();
  return colorSchemes.map(scheme => ({ key: scheme.key, color: scheme.color }));
}

async function getChatData(db) {
  return await db.collection("chatData").findOne({ id: "messages" });
}
