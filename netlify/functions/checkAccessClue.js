const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body.teamId || !body.teamName || !body.clueAuth || !body.clueID) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Missing parameters" }),
    };
  }
  const teamId = body.teamId;
  const teamName = body.teamName;
  const clueAuth = body.clueAuth;
  const clueId = body.clueID;

  const clue = await db.collection("clues").findOne({ clueId: clueId });
  const team = await db.collection("teams").findOne({ teamId: teamId, teamName: teamName });
  if (!clue || !team) {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "Unauthorized" }),
    };
  } else if (team.cluesFound[parseInt(clueId) - 1] === false) {
    if (clue.authKey === clueAuth) {
      let teamClues = team.cluesFound;
      teamClues[parseInt(clueId) - 1] = true;
      await db.collection("teams").updateOne({ teamId: teamId }, { $set: { cluesFound: teamClues } });
      const teamData = await db.collection("teams").findOne({ teamId: teamId, teamName: teamName})
      const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1367197526079312014');
      discord.handleEmbeds({
        title: `Clue Found!`,
        description: `A team has found ${clue.clueId}!!!`,
        color: '#00FFFF',
        fields: [
          { name: 'Team:', value: `${teamName}`, inline: false },
          { name: 'Score:', value: `${teamData.score}`, inline: false },
          { name: 'Time:', value: `${new Date()}`, inline: false },
        ],
        footer: `${teamName} has unlocked clue ${clueId} 🔓`,
      })
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Authorized" }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ status: "error", message: "Unauthorized" }),
      };
    }
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success", message: "Authorized" }),
    }
  }
};


//http://localhost:8888/clues/Clue%201?clueID=1&clueAuth=abc