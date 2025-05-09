const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);  
  if (!body || !body.userToUpdate) {
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
    const addColor = await addColorToDatabase(db, body);
    if (addColor === "error" || !addColor) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to add account."})
      };
    } else {
      const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbeds({
        title: 'Color Added',
        description: 'Someone has add an color!',
        color: "#228B22", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Added Color:', value: `${addColor}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Color Added 🌍',
      })
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Account added successfully."})
      };
    }
  }
}

async function addColorToDatabase(db, data) {
    const databaseResponse = await db.collection("colorSchemes").insertOne({ 
    key: "--",
    color: "#FFFFFF",
    userToUpdate: data.userToUpdate
   });
  if (databaseResponse.acknowledged) {
    return databaseResponse.insertedId;
  } else {
    return "error";
  }
}
