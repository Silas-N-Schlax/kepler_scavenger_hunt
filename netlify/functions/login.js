const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
console.log(body);
  if (!body.username || !body.password|| !body.token || !body.attempts || !body.ip) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Missing parameters" }),
    };
  }



  const username = body.username;
  const password = body.password;
  const token = body.token;
  const attempts = body.attempts;

  const accounts = await db.collection("accounts").find({}).toArray();
  const account = accounts.find((account) => account.username === username && account.password === password);

  if (account && account.allowedTokens.includes(token)) {
     const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbedsWithPing({
      title: 'Successful Login!',
      description: 'Someone has logged in successfully!',
      color: "#90EE90",
      fields: [
        { name: 'Username:', value: `${username}`, inline: false },
        { name: 'Page Token:', value: `${token}`, inline: false },
        { name: 'IP:', value: `${body.ip}`, inline: false },
        { name: 'Attempts:', value: `${attempts}`, inline: false },
        { name: 'Time:', value: `${new Date()}`, inline: false },
      ],
      footer: 'Successful login attempt 🔑',
    })
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success", message: "Login successful!" }),
    };
  } else if (!account) {
    if (attempts >= 2) {
      const discordNotification = require("./utils/discordNotifications.js");
      const discord = new discordNotification('1369299576430923867');
      discord.handleEmbedsWithPing({
          title: 'Failed Login Attempt',
          description: 'Someone is trying to log in with invalid credentials!',
          color: "#301934", 
          fields: [
            { name: 'Username:', value: `${username}`, inline: false },
            { name: 'Page Token', value: `${token}`, inline: false },
            { name: 'IP', value: `${body.ip}`, inline: false },
            { name: 'Attempts', value: `${attempts}`, inline: false },
            { name: 'Time', value: `${new Date()}`, inline: false },
          ],
          footer: 'Failed login attempt 🔐',
        })
    
      return {
        statusCode: 401,
        body: JSON.stringify({ status: "error", message: "I have let admin know about your login attempts, if you are allowed to be here, double check your inputs! Note that passwords and username are case sensitive (capitals matter ;)" }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ status: "error", message: "Invalid username or password" }),
      };
    }
  } else if (!account.allowedTokens.includes(token)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "You do not have permissions to access this page, contact Admin for access." }),
    }
  } 
};