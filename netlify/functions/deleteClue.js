const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);  

  if (!body || !body.clueId) {
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
    const deletedClue = await deleteClue(db, body.clueId);
    if (deletedClue === "error" || !deletedClue) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to delete clue."})
      };
    } else {
      const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbedsWithPing({
        title: 'Clue Deleted',
        description: 'Someone has deleted an clue!',
        color: "#8B0000", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Deleted Clue:', value: `${deletedClue}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Clue Deleted 🔫💣',
      })
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue deleted successfully."})
      };
    }
  }
}

async function deleteClue(db, clueId) {
  const result = await db.collection("clues").deleteOne({ clueId: clueId });
  if (result.deletedCount === 1) {
    return clueId;
  } else {
    return "error";
  }
}
