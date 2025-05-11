document.addEventListener("DOMContentLoaded", async function () { 
  const response = await fetch('/.netlify/functions/getActiveTeams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json();
  if (data.status === "success") {
    const teamsDiv = document.querySelector(".content-container");
    data.teams.forEach((teams) => {
      const team = document.createElement("li");
      const teamLink = document.createElement("a");
      teamLink.href = `/content/${teams}/home`;
      teamLink.textContent = `Team ${teams}`;
      teamLink.className = "team-link";
      team.className = "team"
      team.appendChild(teamLink);
      teamsDiv.appendChild(team);
    })
  } else {
    alert("Failed to load active teams data.");
  }
});