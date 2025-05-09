const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body || !body.clueId || !body.userToUpdate) {
    return {
      statusCode: 400,
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
    const updates = await updateDatabase(db, body.clueId, body.easy, body.classical, body.authKey, body.userToUpdate);
    if (updates === "error" || !updates) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to update clue."})
      };
    } else {
      const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbedsWithPing({
        title: 'Clue Updated!',
        description: 'Someone has updated a clue!',
        color: "#FFA500", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Clue Updated:', value: `${updates.clueId}`, inline: false },
          { name: 'Clue Auth:', value: `${updates.clueAuth}`, inline: false },
          { name: 'Updated Clue:', value: `
            Easy Mode:\n- Location: ${updates.easy.location}\n- Riddle: ${updates.easy.riddle}\n- Answer: ${updates.easy.answer}\nClassical Mode:\n- Location: ${updates.classical.location}\n- Riddle: ${updates.classical.riddle}\n- Answer: ${updates.classical.answer}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Clue updated 🧐',
      }) 
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue updated successfully."})
      };
    }
  }
}

async function updateDatabase(db, clueId, easy, classical, authKey, userToUpdate) {
  const oldData = await db.collection("clues").findOne({ clueId: clueId });
  if (!oldData) {
    return "error"
  } else {
    const updatedData = {
      clueId: clueId || oldData.clueId,
      authKey: authKey || oldData.authKey,
      easy: {
        location: easy.location || oldData.easy.location,
        riddle: easy.riddle || oldData.easy.riddle,
        answer: easy.answer || oldData.easy.answer
      },
      classical: {
        location: classical.location || oldData.classical.location,
        riddle: classical.riddle || oldData.classical.riddle,
        answer: classical.answer || oldData.classical.answer
      },
      userToUpdate: userToUpdate || "Unknown",
    };
    await db.collection("clues").updateOne({ clueId: clueId }, { $set: updatedData });
    return updatedData;
  }
}