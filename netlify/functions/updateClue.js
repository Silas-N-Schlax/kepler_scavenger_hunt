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
    const updates = await updateDatabase(db, body.clueId, body.easy, body.classical, body.authKey);
    console.log(updates);
    if (updates === "error" || !updates) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to update clue."})
      };
    } else {
      notify({
        title: 'Clue Updated!',
        description: 'Someone has updated a clue!',
        color: "#00FF00", 
        fields: [
          { name: 'User:', value: `${body.userToUpdate}`, inline: false },
          { name: 'Clue Updated:', value: `${updates.clueId}`, inline: false },
          { name: 'Clue Auth:', value: `${updates.clueAuth}`, inline: false },
          { name: 'Updated Clue:', value: `
            Easy Mode:\n- Location: ${updates.easy.location}\n- Riddle: ${updates.easy.riddle}\n- Answer: ${updates.easy.answer}\nClassical Mode:\n- Location: ${updates.classical.location}\n- Riddle: ${updates.classical.riddle}\n- Answer: ${updates.classical.answer}`, inline: false },
          { name: 'Time', value: `${new Date()}`, inline: false },
        ],
        footer: 'Clue updated 🧐',
      }) 
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue updated successfully."})
      };
    }
  }
}

async function updateDatabase(db, clueId, easy, classical, authKey) {
  const oldData = await db.collection("clues").findOne({ clueId: clueId });
  if (!oldData) {
    return "error"
  } else {
    const updatedData = {
      clueId: clueId || oldData.clueId,
      authKey: authKey || oldData.authKey,
      easy: {
        location: easy.location || oldData.easy.location,
        riddle: easy.riddle || oldData.easy.riddle,
        answer: easy.answer || oldData.easy.answer
      },
      classical: {
        location: classical.location || oldData.classical.location,
        riddle: classical.riddle || oldData.classical.riddle,
        answer: classical.answer || oldData.classical.answer
      },
    };
    await db.collection("clues").updateOne({ clueId: clueId }, { $set: updatedData });
    return updatedData;
  }
}


async function notify(embedData) {
  const discordNotification = require("./utils/discordNotifications.js");
  const discord = new discordNotification('1369299576430923867');
  console.log("Sending failed login attempt to Discord channel...");
  
  while (!discord.client.readyAt) {
    await new Promise((resolve) => setTimeout(resolve, 10)); 
  }
  await discord.ping();
  await discord.sendEmbedToChannel(embedData);
  await discord.killClient();
}
