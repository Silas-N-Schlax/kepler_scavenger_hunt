const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
 

  const team = await db.collection("teams").find({}).toArray();
  let allProfiles = [];
  team.forEach(async (team) => {
    let teamProfiles = [];
    team.teamMembers.forEach((member) => {
      teamProfiles.push(formatProfiles([member], db));
    })
    Promise.all(teamProfiles).then((profiles) => {
      profiles = sortProfiles(profiles);
      allProfiles.push({
        teamId: team._id,
        teamName: team.teamName,
        motto: team.motto,
        teamMembers: profiles,
      });
    });
  })
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  return {
    statusCode: 200,
    status: "success",
    body: JSON.stringify(allProfiles),
  };
};


function sortProfiles(profiles) {
  if (profiles.length === 0) {
    return [];
  }
  let sortedProfiles = []
  profiles.forEach((member) => {
    if (member[0].role === "Team Captain") {
      sortedProfiles.push([member[0]]);
      profiles.splice(profiles.indexOf(member), 1);
    }
  })
  profiles.forEach((member) => {
    sortedProfiles.push([member[0]]);
  })
  return sortedProfiles;
}

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