const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);  

  if (!body || !body.username || !body.userToUpdate) {
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
    const deletedAccount = await deleteAccount(db, body.username);
    if (deletedAccount === "error" || !deletedAccount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to delete account"})
      };
    } else {
      const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbeds({
        title: 'Account Deleted',
        description: 'Someone has deleted an account!',
        color: "#8B0000", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Deleted Account:', value: `${deletedAccount}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Account Deleted 🔫💣',
      })
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Account deleted successfully."})
      };
    }
  }
}

async function deleteAccount(db, username) {
  const result = await db.collection("accounts").deleteOne({ username: username });
  if (result.deletedCount === 1) {
    return username;
  } else {
    return "error";
  }
}




