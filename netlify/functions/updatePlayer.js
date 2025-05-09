const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body || !body.oldPlayerId || !body.userToUpdate) {
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
    const updates = await updateDatabase(db, body);
    console.log(updates);
    if (updates === "error" || !updates) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to update clue."})
      };
    } else {
      const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbeds({
        title: 'Player Updated!',
        description: 'Someone has updated a player!',
        color: "#FFA500", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Player Updated:', value: `${updates.firstName} ${updates.lastName}`, inline: false },
          { name: 'Updated Player Data:', value: `- Player ID: ${updates.playerId}\n- Name: ${updates.firstName} ${updates.lastName}\n- Team: ${updates.teamName}\n- Role: ${updates.role}\n- Image: ${updates.imageUrl}\n- Notes: ${updates.notes}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Player updated 🧐',
      }) 
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue updated successfully."})
      };
    }
  }
}

async function updateDatabase(db, data) {
  const oldData = await db.collection("players").findOne({ playerId: data.oldPlayerId });
  if (!oldData) {
    return "error"
  } else {
    const updatedData = {
      playerId: data.playerId || oldData.playerId,
      firstName: data.firstName || oldData.firstName,
      lastName: data.lastName || oldData.lastName,  
      teamName: data.team || oldData.teamName,
      role: data.role || oldData.role,
      imageUrl: data.imageUrl || oldData.imageUrl,
      notes: data.notes || oldData.notes,
      userToUpdate: data.userToUpdate || oldData.userToUpdate,
    };
    await db.collection("players").updateOne({ playerId: data.oldPlayerId }, { $set: updatedData });
    return updatedData;
  }
}
