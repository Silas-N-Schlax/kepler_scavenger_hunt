const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  const teamName = body.teamName;
  const teamId = body.teamId;
  if (!teamName || !teamId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing team name or team id" })
    };
  }
  const chatData = await db.collection("chatData").find({}).toArray()
  const allMessages = chatData.find((data) => data.id === "messages")
  const allTeamColors = await loadTeamColors(db)
  if (!chatData || !allMessages ) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No chat data found" })
    };
  }

  
  const formattedMessages = await formatMessages(allMessages.messages, teamName, teamId, allTeamColors) 
  if (!formattedMessages || formattedMessages.length === 0) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No messages found" })
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ messages: formattedMessages })
    }
  }

}

async function formatMessages(messages, teamName, teamId, allTeamColors) {
  const formattedMessages = await Promise.all(messages.map(async (message) => {
    let color = allTeamColors.find((team) => team.teamName === message.teamName)
    if (!color) {
      color = {
        color: null,
        colorText: null
      }
    }
    return {
      teamName: message.teamName,
      teamId: message.teamId,
      message: message.message,
      date: message.date,
      color: color.color,
      colorText: color.colorText,
      side: message.teamId === teamId && message.teamName === teamName ? "right" : "left",
    }
  }))
  return formattedMessages
}

async function loadTeamColors(db) {
  const teamColors = await db.collection("teams").find({}).toArray()
  let allTeamColors = []
  teamColors.forEach((team) => {
    allTeamColors.push({
      teamName: team.teamName,
      color: team.color || null ,
      colorText: team.colorText || null,
    })
  })
  return allTeamColors
}


// const exampleMessage = {
//   teamName: "Team 1",
//   teamId: "1234567890",
//   message: "Hello world",
//   date: "2023-10-01T00:00:00.000Z",
// }