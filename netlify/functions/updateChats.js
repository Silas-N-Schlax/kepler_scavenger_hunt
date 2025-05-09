const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body || !body.userToUpdate) {
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
    if (updates === "error" || !updates) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to update clue."})
      };
    } else {
      const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbeds({
        title: 'Chat Updated!',
        description: 'Someone has updated the chats!',
        color: "#FFA500", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Chat updated 🧐',
      }) 
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue updated successfully."})
      };
    }
  }
}

async function updateDatabase(db, data) {
  if (!data.messages) {
    return "error";
  } else {
    return await db.collection("chatData").updateOne({ id: "messages" }, { $set: { messages: data.messages } });
  }
}


