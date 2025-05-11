const database = require("./utils/database.js");


exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body); 

  if (!body || !body.playerId || !body.userToUpdate) {
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
    const deletedPlayer = await deletePlayer(db, body.playerId);
    if (deletedPlayer === "error" || !deletedPlayer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to delete clue."})
      };
    } else {
            const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbedsWithPing({
        title: 'Player Deleted',
        description: 'Someone has deleted an player!',
        color: "#8B0000", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Deleted Player:', value: `${body.playerId}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Player Deleted 🔫💣',
      })
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue deleted successfully."})
      };
    }
  }
}

async function deletePlayer(db, playerId) {
  try {
    let status = await deletePlayerFromTeam(db, playerId);
    if (status === "error") {
      return "error";
    }
    const result = await db.collection("players").deleteOne({ playerId: playerId });
    return result
  } catch (error) {
    console.error("Error deleting player:", error);
    return "error";
  }
}

async function deletePlayerFromTeam(db, playerId) {
  try {
    const teams = await db.collection("teams").find({}).toArray();
    teams.forEach(async (team) => {
      if (team.teamMembers && team.teamMembers.includes(playerId)) {
        await db.collection("teams").updateOne(
          { teamName: team.teamName },
          { $pull: { teamMembers: playerId } }
        );
       return "success";
      };
    });
  } catch (error) {
    console.error("Error deleting player from team:", error);
    return "error";
  }
}
