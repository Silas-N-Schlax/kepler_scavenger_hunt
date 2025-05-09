const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body || !body.oldUsername || !body.userToUpdate) {
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
      discord.handleEmbedsWithPing({
        title: 'Account Updated!',
        description: 'Someone has updated an account!',
        color: "#FFA500", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Account Updated:', value: `${updates.username}`, inline: false },
          ...updates.allowedTokens.map(token => ({ name: `Token Allowed:`, value: `- ${token}`, inline: false })),
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Account updated 🧐',
      }) 
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue updated successfully."})
      };
    }
  }
}

async function updateDatabase(db, data) {
  const oldData = await db.collection("accounts").findOne({ username: data.oldUsername });
  if (!oldData) {
    return "error"
  } else {
    const updatedData = {
      username: data.username || oldData.username,
      password: data.password || oldData.password,
      allowedTokens: data.allowedTokens || oldData.allowedTokens,
    };
    await db.collection("accounts").updateOne({ username: data.oldUsername }, { $set: updatedData });
    return updatedData;
  }
}
