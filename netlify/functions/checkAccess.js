const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);
  if (!body.teamId || !body.key || !body.token || !body.teamName || !body.page) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Missing parameters" }),
    };
  }
  const teamId = body.teamId;
  const key = body.key;
  const token = body.token;
  const teamName = body.teamName;
  const page = body.page;
  let pageName = page.split("/")[2].split("%20")[1];

  const collection = await db.collection("teams").findOne({ teamId: teamId, key: key, token: token, teamName: teamName });
  console.log(collection);
  if (!collection) {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "Unauthorized" }),
    };
  } else if (collection.teamId !== teamId || collection.key !== key || collection.token !== token || collection.teamName !== teamName || teamName !== pageName) {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "Unauthorized" }),
    };
  } else if (collection.active === false) {
    return {
      statusCode: 403,
      body: JSON.stringify({ status: "error", message: "Team is inactive" }),
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success", message: "Authorized" }),
    };
  }
};

//http://localhost:8888/content/Team%20Achilles/home?teamId=123&key=abc&token=xyz&teamName=Achilles