const database = require("./database.js");

class CheckEditPerms {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = await database.returnDatabase();
  }

  async checkEditPerms(username) {
    await this.init();
    try {
      const user = await this.db.collection("accounts").findOne({ username: username });
      const allTokens = await this.db.collection("accounts").findOne({ id: "allTokens" });
      const editToken = allTokens.tokens[4][1]
      console.log("Edit Token:", editToken);
      console.log(user.allowedTokens.includes(editToken));
      if (!user) {
        return { status: "error", message: "User not found." };
      } else if (user.allowedTokens.includes(editToken)) {
        return { status: "success", message: "User has edit permissions." };
      } else {
        return { status: "denied", message: "User does not have edit permissions." };
      }
    } catch (error) {
      console.error("Error checking edit permissions:", error);
      return { status: "error", message: "Error checking edit permissions." };
    }
  }
}


module.exports = new CheckEditPerms();