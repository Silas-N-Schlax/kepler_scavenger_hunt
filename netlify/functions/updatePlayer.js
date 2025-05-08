const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body || !body.oldPlayerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Invalid request data."})
    };
  } else {
    const updates = await updateDatabase(db, body);
    console.log(updates);
    if (updates === "error" || !updates) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to update clue."})
      };
    } else {
      notify({
        title: 'Player Updated!',
        description: 'Someone has updated a player!',
        color: "#00FF00", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Player Updated:', value: `${updates.firstName} ${updates.lastName}`, inline: false },
          { name: 'Clue Auth:', value: `${updates.clueAuth}`, inline: false },
          { name: 'Updated Clue:', value: `- Player ID: ${updates.playerId}\n- Name: ${updates.firstName} ${updates.lastName}\n- Team: ${updates.teamName}\n- Role: ${updates.role}\n- Image: ${updates.imageUrl}\n- Notes: ${updates.notes}`, inline: false },
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


async function notify(embedData) {
  const discordNotification = require("./utils/discordNotifications.js");
  const discord = new discordNotification('1369299576430923867');
  console.log("Sending failed login attempt to Discord channel...");
  
  while (!discord.client.readyAt) {
    await new Promise((resolve) => setTimeout(resolve, 10)); 
  }
  await discord.ping();
  await discord.sendEmbedToChannel(embedData);
  await discord.killClient();
}
