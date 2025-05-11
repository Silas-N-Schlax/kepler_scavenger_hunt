const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);  
  if (!body || !body.clueId || !body.authKey || !body.userToUpdate || !body.easy || !body.classical) {
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
    const addClue = await addClueToDatabase(db, body);
    if (addClue === "error" || !addClue) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to add clue."})
      };
    } else {
            const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbeds({
        title: 'Clue Added',
        description: 'Someone has add an clue!',
        color: "#228B22", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Added Clue:', value: `${addClue}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Clue Added 🌍',
      })
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue added successfully."})
      };
    }
  }
}

async function addClueToDatabase(db, data) {
  const databaseResponse = await db.collection("clues").insertOne({ 
    clueId: data.clueId,
    authKey: data.authKey,
    easy: {
      location: data.easy.location,
      riddle: data.easy.riddle,
      answer: data.easy.answer
    },
    classical: {
      location: data.classical.location,
      riddle: data.classical.riddle,
      answer: data.classical.answer
    },
   });
  if (databaseResponse.acknowledged) {
    return databaseResponse.insertedId;
  } else {
    return "error";
  }
}
