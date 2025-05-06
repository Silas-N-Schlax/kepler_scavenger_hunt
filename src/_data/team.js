const fs = require("fs");
const path = require("path");

const teamDir = path.resolve(__dirname, "../content/"); 

try {
  //read all folder names in the content directory
  const folders = fs.readdirSync(teamDir);
  console.log(`📂 Found folders in ${teamDir}:`, folders);
  module.exports = folders;
} catch (error) {
  console.error(`❌ Error loading images from ${imageDir}:`, error);
  module.exports = []; // Ensure Eleventy doesn't break if an error occurs
}

