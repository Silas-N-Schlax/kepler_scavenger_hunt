const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body); 

  if (!body || !body.playerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Invalid request data."})
    };
  } else {
    const deletedPlayer = await deletePlayer(db, body.playerId);
    if (deletedPlayer === "error" || !deletedPlayer) {
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

async function deletePlayer(db, playerId) {
  try {
    const result = await db.collection("players").deleteOne({ playerId: playerId });
    console.log(result);
    return result
  } catch (error) {
    console.error("Error deleting player:", error);
    return "error";
  }
  
}
