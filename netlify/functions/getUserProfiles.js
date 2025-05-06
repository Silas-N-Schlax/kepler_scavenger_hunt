const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body.teamId ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Missing parameters" }),
    };
  }
  const teamId = body.teamId;
  const teamName = body.teamName;
  const key = body.key;
  const token = body.token;

  const team = await db.collection("teams").findOne({ teamId: teamId, key: key, token: token, teamName: teamName });
  if (!team) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Invalid teamId, key or token" }),
    };
  }
  const teamMembers = team.teamMembers;
  const profiles = await formatProfiles(teamMembers, db);
  if (!profiles) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "No profiles found" }),
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success", profiles: profiles }),
    };
  }
};


async function formatProfiles(teamMembers, db) {
  const profiles = await Promise.all(teamMembers.map(async (member) => {
    const user = await db.collection("players").findOne({ playerId: member });
    if (user) {
      return {
        playerId: user.playerId,
        firstName: user.firstName,
        lastName: user.lastName,
        teamId: user.team,
        team: user.team,
        imageURL: user.imageUrl,
        role: user.role,
      };
    }
    return null;
  }));
  return profiles.filter(profile => profile !== null);
}