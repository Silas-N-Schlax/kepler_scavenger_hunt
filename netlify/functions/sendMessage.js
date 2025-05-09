const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);  
  const ip =  event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown'

  if (!body.teamName || !body.teamId || !body.message || !ip) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing team name, team id or message" })
    };
  }

  const teamName = body.teamName;
  const teamId = body.teamId;
  const message = body.message;
  const date = new Date().toISOString();
  if (await canSendMessage(ip, db, message)) {
    await db.collection("chatData").updateOne({
      id: "messages"
      }, {
        $push: {
         messages: {
          teamName: teamName,
          teamId: teamId,
          message: removeSlashCommand(message),
          date: date,
          ip: ip,
         } 
        }
      }
    );
    await db.collection("chatData").updateOne( {
      id: "rateLimits"
      }, {
        $push: {
          rateLimits: {
            ip: ip,
            time: new Date().getTime()
          }
        }
      }
    )
    const discordNotification = require("./utils/discordNotifications.js");
    const discord = new discordNotification('1369299499486416966');
    discord.handleEmbedsWithPing({
      title: 'New Message',
      description: 'Someone has sent a message in the chat!',
      color: "#b3f77c", 
      fields: [
        { name: 'Team:', value: `${teamName}`, inline: false },
        { name: 'Message:', value: `${removeSlashCommand(message)}`, inline: false },
        { name: 'Time', value: `${new Date()}`, inline: false },
      ],
      footer: 'New Message 📨',
    }) 
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message sent successfully" })
    }
  } else {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: "You are sending messages too fast. Please wait 5 minutes." })
    };
  }
}

function removeSlashCommand(message) {
  if (message.includes("/bypass")) {
    return message.replace("/bypass", "")
  } else {
    return message
  }
}

async function canSendMessage(ip, db, message) {
  let rateLimits = await db.collection("chatData").findOne({ id: "rateLimits" });
  rateLimits = rateLimits.rateLimits;
  if (!rateLimits) {
    return false; 
  } else if (message.includes("/bypass")) {
    console.log("Bypass message detected, allowing message to be sent")
    return true; 
  } else if (rateLimits.length === 0) {
    return true; 
  } else {
    const rateLimit = rateLimits.find((limit) => limit.ip === ip);
    if (!rateLimit) {
      return true; 
    } else {
      const currentTime = new Date().getTime();
      const difference = currentTime - rateLimit.time;
      const differenceInMinutes = Math.floor(difference / 1000 / 60);
      console.log(differenceInMinutes)
      if (differenceInMinutes >= 5 || differenceInMinutes < 0) {
        rateLimits = rateLimits.filter((limit) => limit.ip !== ip);
        await db.collection("chatData").updateOne( { id: "rateLimits" }, { $set: { rateLimits: rateLimits } }, { upsert: true } );
        return true
      } else {
        return false; 
      }
    }
  }
}