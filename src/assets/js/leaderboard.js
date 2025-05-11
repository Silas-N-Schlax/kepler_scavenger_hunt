document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("/.netlify/functions/generateLeaderboard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamId: localStorage.getItem("teamId")
    })
  });
  const data = await response.json();
  if (data.status === "success") {
    const leaderboard = data.leaderboard;
    const mainDiv = document.querySelector(".content-container");
    const leaderboardDiv = document.createElement("div");
    leaderboardDiv.className = "leaderboard-container";
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    const headerTeam = document.createElement("th");
    headerTeam.textContent = "Team Name";
    const headerScore = document.createElement("th");
    headerScore.textContent = "Score";
    headerRow.appendChild(headerTeam);
    headerRow.appendChild(headerScore);
    table.appendChild(headerRow);
    leaderboard.forEach(team => {
      const row = document.createElement("tr");
      const teamName = document.createElement("td");
      teamName.textContent = team.teamName;
      const score = document.createElement("td");
      score.textContent = team.score;
      row.appendChild(teamName);
      row.appendChild(score);
      table.appendChild(row);
    });
    leaderboardDiv.appendChild(table);
    mainDiv.appendChild(leaderboardDiv);
  } else {
    console.error("Failed to load leaderboard data.");
  }
});