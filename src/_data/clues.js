const fs = require("fs");
const path = require("path");

const clueDir = path.resolve(__dirname, "../clues/"); 

try {
  // read the file names in the clues directory (.MD files)
  const files = fs.readdirSync(clueDir).filter(file => file.endsWith(".md"));
  clues = []
  for (let i = 0; i < files.length; i++) {
    clues.push([files[i].replace(".md", ""), i+1]);
  }
  module.exports = clues;
} catch (error) {
  console.error(`❌ Error loading clues from ${clueDir}:`, error);
  module.exports = []; // Ensure Eleventy doesn't break if an error occurs
}

