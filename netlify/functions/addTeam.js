const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);  
  console.log(body);
  if (!body || !body.userToUpdate) {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "Invalid request data."})
    };
  } else {
    const checkEditPerms = require("./utils/checkEditPerms.js");
    const checkPerms = await checkEditPerms.checkEditPerms(body.userToUpdate);
    if (checkPerms.status === "error" || checkPerms.status === "denied") {
      return {
        statusCode: 403,
        body: JSON.stringify({ status: "error", message: "User does not have edit permissions."})
      }
    }
    const addTeam = await addTeamToDatabase(db, body);
    if (addTeam === "error" || !addTeam) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to add team."})
      };
    } else {
      const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbeds({
        title: 'Team Added',
        description: 'Someone has add an Team!',
        color: "#228B22", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Added Team:', value: `${addTeam}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Team Added 🌍',
      })
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Team added successfully."})
      };
    }
  }
}

async function addTeamToDatabase(db, data) {
  const numberOfClues = Number(await db.collection("clues").countDocuments({})) - 1;
  let found = [], completed = [];
  for (let i = 1; i <= numberOfClues; i++) {
    found.push(false);
    completed.push(false);
  }
  const databaseResponse = await db.collection("teams").insertOne({ 
    teamId: "default",
    teamName: "default",
    teamMembers: [],
    score: 0,
    key: "default",
    token: "default",
    motto: "default",
    cluesFound: found,
    cluesCompleted: completed, 
    difficulty: "classical",
    active: false,
    color: "#000000",
    colorText: "#FFFFFF",
    userToUpdate: data.userToUpdate
   });
  if (databaseResponse.acknowledged) {
    return databaseResponse.insertedId;
  } else {
    return "error";
  }
}
