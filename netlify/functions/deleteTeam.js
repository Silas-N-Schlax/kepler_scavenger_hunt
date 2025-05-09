const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body); 

  if (!body || !body.teamId || !body.userToUpdate) {
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
    const deletedTeam = await deleteTeam(db, body.teamId);
    if (deletedTeam === "error" || !deletedTeam) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to delete clue."})
      };
    } else {
            const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbedsWithPing({
        title: 'Team Deleted',
        description: 'Someone has deleted an team!',
        color: "#8B0000", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Deleted Team:', value: `${body.teamId}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Team Deleted 🔫💣',
      })
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue deleted successfully."})
      };
    }
  }
}

async function deleteTeam(db, teamId) {
  try {
    let status = await setPlayersToNewTeam(db, teamId);
    if (status === "error") {
      return "error";
    }
    const result = await db.collection("teams").deleteOne({ teamId: teamId });
    return result
  } catch (error) {
    console.error("Error deleting player:", error);
    return "error";
  }
}

async function setPlayersToNewTeam(db, teamId) {
  try {
    const team = await db.collection("teams").findOne({ teamId: teamId }); 
    const teams = await db.collection("teams").find({}).toArray();
    const allTeamMembers = team.teamMembers.concat(teams[0].teamMembers);
    await db.collection("teams").updateOne({ teamId: teams[0].teamId }, { $set: { teamMembers: allTeamMembers}})
  } catch (error) {
    console.error("Error deleting player from team:", error);
    return "error";
  }
}
