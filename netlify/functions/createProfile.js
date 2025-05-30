const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body.firstName || !body.lastName || !body.notes || !body.team || !body.role || !body.imageUrl || !body.userToRegister) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Missing parameters" }),
    };
  }
  const { firstName, lastName, notes, team, role, imageUrl } = body;
  const checkEditPerms = require("./utils/checkEditPerms.js");
    const checkPerms = await checkEditPerms.checkEditPerms(body.userToRegister);
    if (checkPerms.status === "error" || checkPerms.status === "denied") {
      return {
        statusCode: 403,
        body: JSON.stringify({ status: "error", message: "User does not have edit permissions."})
      }
    }
  
  
  const playerID = generatePlayerID(firstName, lastName);
  const player = {
    playerId: playerID,
    firstName: firstName,
    lastName: lastName,
    notes: notes,
    team: team,
    role: role,
    imageUrl: imageUrl,
    userToRegister: body.userToRegister || "",
  }
  try {
    await db.collection("players").insertOne(player);
  } catch (error) {
    console.error("Error inserting player:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: "Failed to insert player" }),
    };
  }
  try {
    await db.collection("teams").updateOne({
      teamName: team,
    }, {
      $push: {
        teamMembers: playerID,
      },
    })
  } catch (error) {
    console.error("Error updating team:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: "Failed to update team" }),
    };
  }

  notifyAdmin({
    title: 'Successful Profile Creation!',
    description: 'A new player profile has been created!',
    color: '#FFFF00',
    fields: [
      { name: 'Player:', value: `${player.firstName} ${player.lastName}`, inline: false },
      { name: 'Player ID:', value: `${player.playerId}`, inline: false },
      { name: 'Team:', value: `${player.team}`, inline: false },
      { name: 'Role:', value: `${player.role}`, inline: false },
      { name: 'ImageURL:', value: `${player.imageUrl}`, inline: false },
      { name: 'Registered By:', value: `${player.userToRegister}`, inline: false },
      { name: 'Time:', value: `${new Date()}`, inline: false },
    ],
    footer: 'New Player Profile Created ✅',
  })


  return {
    statusCode: 200,
    body: JSON.stringify({ status: "success", message: "Player created successfully", playerID: playerID }),
  };
};


function generatePlayerID(firstName, lastName) {
  const randomString = Math.random().toString(36).substring(2, 22); 
  const reversedLastName = lastName.split("").reverse().join("").toLowerCase();
  const reversedFirstName = firstName.split("").reverse().join("").toLowerCase();
  const playerID = `${randomString}${reversedLastName}${reversedFirstName}`;
  return playerID;
}

async function notifyAdmin(embedData) {
  const discordNotification = require("./utils/discordNotifications.js");
  const discord = new discordNotification('1367197526079312014');
  
  while (!discord.client.readyAt) {
    await new Promise((resolve) => setTimeout(resolve, 10)); // Wait 100ms before checking again
  }
  await discord.sendEmbedToChannel(embedData);
  await discord.killClient();
}
