const DiscordNotification = require("./utils/discordNotifications.js");

exports.handler = async function (event, context) {
  // types of embeds:
  // 2. clue found (index 0)
  // 1. clue finished (index 1)
  // 3. login (index 2)
  const body = JSON.parse(event.body);
  // Data in the following format:
  // data = {
  //   type: 0, // 0 = clue found, 1 = clue finished, 2 = login
  //   teamId: body.teamId,
  //   teamName: body.teamName,
  //   clueId: body.clueId, //sometimes present
  //   clueAuth: body.clueAuth, //sometimes present
  //   finished: body.finished,
  //   ip: body.ip, //sometimes present
  //   userName: body.userName, //sometimes present
  //   accessPoint: body.accessPoint, //sometimes present
  // }
  const discordNotification = new DiscordNotification();

  // Wait until the client is ready
  while (!discordNotification.client.readyAt) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms before checking again
  }

  // Send the message
  await discordNotification.sendToChannel("This is a test message!");

  await discordNotification.sendEmbedToChannel();

  await discordNotification.killClient();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Notification sent!" }),
  };
};