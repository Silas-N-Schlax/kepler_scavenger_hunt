const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const collection = await db.collection("test").findOne({});

  return {
    statusCode: 200,
    body: JSON.stringify({ message: collection }),
  };
};