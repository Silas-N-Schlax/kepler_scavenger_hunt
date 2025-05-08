const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);  
  console.log(body);
  if (!body || !body.clueId || !body.authKey || !body.userToUpdate || !body.easy || !body.classical) {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "Invalid request data."})
    };
  } else {
    const addClue = await addClueToDatabase(db, body);
    if (addClue === "error" || !addClue) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Failed to delete clue."})
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success", message: "Clue deleted successfully."})
      };
    }
  }
}

async function addClueToDatabase(db, data) {
  const databaseResponse = await db.collection("clues").insertOne({ 
    clueId: data.clueId,
    authKey: data.authKey,
    easy: {
      location: data.easy.location,
      riddle: data.easy.riddle,
      answer: data.easy.answer
    },
    classical: {
      location: data.classical.location,
      riddle: data.classical.riddle,
      answer: data.classical.answer
    },
   });
  if (databaseResponse.acknowledged) {
    return databaseResponse.insertedId;
  } else {
    return "error";
  }
}
