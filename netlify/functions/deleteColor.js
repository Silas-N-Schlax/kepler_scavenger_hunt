const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body || !body.key || !body.userToUpdate) {
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
    const deletedColor = await deleteColor(db, body.key);
    if (deletedColor === "error" || !deletedColor) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to delete clue."})
      };
    } else {
            const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbeds({
        title: 'Color Deleted',
        description: 'Someone has deleted an color!',
        color: "#8B0000", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Deleted Color:', value: `${deletedColor}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Color Deleted 🔫💣',
      })
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue deleted successfully."})
      };
    }
  }
}

async function deleteColor(db, key) {
  const result = await db.collection("colorSchemes").deleteOne({ key: key });
  if (result.deletedCount === 1) {
    return key;
  } else {
    return "error";
  }
}