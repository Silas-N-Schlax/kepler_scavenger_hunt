const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body.teamId || !body.teamName || !body.answer || !body.clueId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Missing parameters" }),
    };
  }
  const teamId = body.teamId;
  const teamName = body.teamName;
  const clueId = body.clueId;
  const answer = body.answer;

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
    await checkIfWon(teamId, teamName, db, await db.collection("teams").findOne({ teamId: teamId, teamName: teamName }));
    const teamData = await db.collection("teams").findOne({ teamId: teamId, teamName: teamName})
    const discordNotification = require("./utils/discordNotifications.js");
    const discord = new discordNotification('1367197526079312014');
    discord.handleEmbeds({
      title: `Clue Completed!`,
      description: `A team has completed ${clueId}!!!`,
      color: '#DDA0DD',
      fields: [
        { name: 'Team:', value: `${teamName}`, inline: false },
        { name: 'Score:', value: `${teamData.score}`, inline: false },
        { name: 'Time:', value: `${new Date()}`, inline: false },
      ],
      footer: `${teamName} has completed clue ${clueId} ✅`,
    })
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

async function checkIfWon(teamId, teamName, db, teamData) {
  if (teamData.cluesCompleted.every((clue) => clue === true)) {
    let winners = await db.collection("winners").findOne({});
    if (!winners) {
      await db.collection("winners").insertOne({ id: "winners", winners: [{ teamId: teamId, teamName: teamName }] });
    } else {
      winners.winners.push({ teamId: teamId, teamName: teamName });
      await db.collection("winners").updateOne({ id: "winners" }, { $set: { winners: winners.winners } });
    }
  } 
}

async function notify(embedData) {
  const discordNotification = require("./utils/discordNotifications.js");
  const discord = new discordNotification('1367197526079312014');
  
  while (!discord.client.readyAt) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  await discord.ping();
  await discord.sendEmbedToChannel(embedData);
  await discord.killClient();
}
