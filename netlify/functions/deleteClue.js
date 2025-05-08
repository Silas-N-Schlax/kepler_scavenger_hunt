const database = require("./utils/database.js");

exports.handler = async function(event, context) {
  const db = await database.returnDatabase();
  const body = JSON.parse(event.body);  

  if (!body || !body.clueId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "error", message: "Invalid request data."})
    };
  } else {
    const deletedClue = await deleteClue(db, body.clueId);
    if (deletedClue === "error" || !deletedClue) {
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

async function deleteClue(db, clueId) {
  const result = await db.collection("clues").deleteOne({ clueId: clueId });
  if (result.deletedCount === 1) {
    return clueId;
  } else {
    return "error";
  }
}
