const { MongoClient } = require('mongodb');

class Database {
  constructor() {
    this.db = null;
    this.client = null;
  }

  async connectToDatabase() {
    if (this.db) {
      return this.db;
    }

    try {
      const url = process.env.MONGODB_URI;
      const dbName = "KeplerGames";

      this.client = new MongoClient(url);
      await this.client.connect();

      this.db = this.client.db(dbName);
      return this.db;
    } catch (error) {
      console.error("Error connecting to the database:", error);
      return null;
    }
  }

  async returnDatabase() {
    // Ensure the database connection is established before returning it
    if (!this.db) {
      await this.connectToDatabase();
    }
    return this.db;
  }

  async closeConnection() {
    if (this.client) {
      await this.client.close();
      this.db = null;
      this.client = null;
    }
  }
}

// Export an instance of the Database class
module.exports = new Database();