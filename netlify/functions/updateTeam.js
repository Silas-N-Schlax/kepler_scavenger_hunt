const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body || !body.oldTeamId || !body.userToUpdate) {
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
        title: 'Team Updated!',
        description: 'Someone has updated a team!',
        color: "#FFA500", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Team Updated:', value: `${updates.teamName}`, inline: false },
          { name: 'Updated Team:', value: `- Team Id: ${updates.teamId}\n- Key: ${updates.key}\n- Token: ${updates.token}\n- Clues Found: [${updates.cluesFound.join(", ")}]\n- Clues Completed: [${updates.cluesCompleted.join(", ")}]\n- Score: ${updates.score}\n- Team Members: [${updates.teamMembers.join(", ")}]\n- Difficulty: ${updates.difficulty}\n- Motto: ${updates.motto}\n- Active: ${updates.active}\n- Color: ${updates.color}\n- Color Text: ${updates.colorText}\n`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Team updated 🧐',
      }) 
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue updated successfully."})
      };
    }
  }
}

async function updateDatabase(db, data) {
  const oldData = await db.collection("teams").findOne({ teamId: data.oldTeamId });
  if (!oldData) {
    return "error"
  } else {
    const updatedData = {
      teamId: data.teamId || oldData.teamId,
      key: data.key || oldData.key,
      token: data.token || oldData.token,
      teamName: data.teamName || oldData.teamName,
      cluesFound: data.cluesFound || oldData.cluesFound,
      cluesCompleted: data.cluesCompleted || oldData.cluesCompleted,  
      score: Number(data.score) || Number(oldData.score),
      teamMembers: data.teamMembers || oldData.teamMembers,
      difficulty: data.difficulty || oldData.difficulty,
      motto: data.motto || oldData.motto,
      userToUpdate: data.userToUpdate || oldData.userToUpdate,
      color: data.color || oldData.color,
      colorText: data.colorText || oldData.colorText,
      active: data.active,
    };
    await db.collection("teams").updateOne({ teamId: data.oldTeamId }, { $set: updatedData });
    return updatedData;
  }
}