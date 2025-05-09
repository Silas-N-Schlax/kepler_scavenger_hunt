const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();

  const colorSchemes = await db.collection("colorSchemes").find({}).toArray();
  if (!colorSchemes) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: "Failed to fetch color schemes" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ status: "success", schemes: colorSchemes }),
  };
}