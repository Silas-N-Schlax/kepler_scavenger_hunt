document.addEventListener("DOMContentLoaded", async () => {
  const data = await getAdminInfo();
  if (data.status === "success") {
    loadContent(data.players, data.teams, data.winners, data.accounts, data.teamNames);
  } else {
    console.error("Failed to load game master data.");
  }
});


async function getAdminInfo() {
  const response = await fetch("/.netlify/functions/getAdminInfo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}


function loadContent(players, teams, winners, accounts, teamNames) {
  let mainDiv = document.querySelector(".content-container");

  let playersDiv = document.createElement("div");
  playersDiv.className = "players-container";
  players.forEach((player) => {
    let playerDiv = document.createElement("div");
    playerDiv.className = "player-container";
    const form = document.createElement("form");
    form.className = "player-form";
    form.innerHTML = `
      <label for="playerId">Player ID:</label>
        <span><input type="text" id="playerId" name="playerId" value="${player.playerId}"></span><br>

      <label for="first-name">First Name:</label>
        <span><input type="text" id="first-name" name="first-name" value="${player.firstName}"></span><br>

      <label for="last-name">Last Name:</label>
        <span><input type="text" id="last-name" name="last-name" value="${player.lastName}"></span><br>

      <label for="teamName">Team Name:</label>
        <span><select id="teamName" name="teamName">
          ${teamNames.map(team => `<option value="${team}" ${player.teamName === team ? 'selected' : ''}>${team}</option>`).join('')}
        </select></span><br>
        
      <label for="role">Role:</label>
        <span><select id="role" name="role">
          <option value="Team Captain" ${player.role === "Team Captain" ? 'selected' : ''}>Team Captain</option>
          <option value="Team Member" ${player.role === "Team Member" ? 'selected' : ''}>Team Member</option>
        </select></span><br>

      <label for="profile-picture">Profile Picture:</label>
        <span><input type="text" id="profile-picture" name="profile-picture" value="${player.imageUrl}" readonly></span><br>

      <label for="notes">Notes:</label>
        <span><input type="text" id="notes" name="notes" value="${player.notes}"></span><br>
      
      <label for="register">Registered By:</label>
        <span><input type="text" id="register" name="register" value="${player.userToRegister}"></span><br>

      <div class="buttons">
        <button type="submit" name="delete" >Delete Player</button>
        <button type="submit" name="submit" >Update Player</button>
        <button type="submit" name="add" >Add Player</button>
      </div>
      <hr>
    `
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (event.submitter.name === "delete") {
        const confirmation = confirm("Are you sure you want to delete this clue? This action cannot be undone.");
        if (!confirmation) {
          return;
        }
        const id = player.playerId;
        const response = await fetch("/.netlify/functions/deletePlayer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ playerId: id }),
        });
        const result = await response.json();
        if (result.status === "success") {
          const data = await getAdminInfo();
          if (data.status === "success") {
            loadContent(data.players, data.teams, data.winners, data.accounts, data.teamNames); //! add color here too!
          } else {
            console.error("Failed to load ADMIN data.");
          }
        } else {
          alert("Failed to delete clue.");
        }
      } else if (event.submitter.name === "submit") {
        const data = {
          oldPlayerId: player.playerId,
          playerId: form.querySelector("#playerId").value,
          firstName: form.querySelector("#first-name").value,
          lastName: form.querySelector("#last-name").value,
          team: form.querySelector("#teamName").value,
          role: form.querySelector("#role").value,
          imageUrl: form.querySelector("#profile-picture").value,
          notes: form.querySelector("#notes").value,
          userToUpdate: localStorage.getItem("accountName")
        };
        const response = await fetch("/.netlify/functions/updatePlayer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.status === "success") {
          alert("Clue updated successfully!");
        } else {
          alert("Failed to update clue.");
        }
      } else if (event.submitter.name === "add") {
        confirmation = confirm("Adding a new player must be done form the registration page. Do you want to go there?")
        if (confirmation) {
          window.location.href = "/registration/?token=X9T7P2LJQM";
        } else {
          return;
        }
      } else {
        return;
      }
    });
    playerDiv.appendChild(form);
    playersDiv.appendChild(playerDiv);
  });
  let teamsDiv = document.createElement("div");
  teamsDiv.className = "teams-container";
  teams.forEach((team) => { 
    let teamDiv = document.createElement("div");
    teamDiv.className = "team-container";
    const form = document.createElement("form");
    form.className = "team-form";
    form.innerHTML = `
      <label for="teamId">Team ID:</label>
        <span><input type="text" id="teamId" name="teamId" value="${team.teamId}"></span><br>

      <label for="teamName">Team Name:</label>
        <span><input type="text" id="teamName" name="teamName" value="${team.teamName}"></span><br>

      <label for="members">Members:</label>
        <span><input type="text" id="members" name="members" value="${team.teamMembers.join(", ")}"></span><br>

      <label for="score">Score:</label>
        <span><input type="text" id="score" name="score" value="${team.score}"></span><br>
      
      <label for="key">Key:</label>
        <span><input type="text" id="key" name="key" value="${team.key}"></span><br>

      <label for="token">Token:</label>
        <span><input type="text" id="token" name="token" value="${team.token}"></span><br>
      
      <label for="motto">Motto:</label>
        <span><input type="text" id="motto" name="motto" value="${team.motto}"></span><br>

      <label for="cluesFound">Clues Found:</label><br>
        ${team.cluesFound.map((clue, index) => {
          return `
            <span><input type="checkbox" id="${clue}" name="cluesFound" value="Clue ${index}: ${clue}" ${team.cluesFound.includes(clue) ? 'checked' : ''}>Clue ${index}</span><br>
          `;
        }).join('')}</span><br>
      
      <label for="cluesCompleted">Clues Completed:</label><br>
        ${team.cluesCompleted.map((clue, index) => {
          return `
            <span><input type="checkbox" id="${clue}" name="cluesFound" value="Clue ${index}: ${clue}" ${team.cluesCompleted.includes(clue) ? 'checked' : ''}>Clue ${index}</span><br>
          `;
        }).join('')}</span><br>

      <label for="difficulty">Difficulty:</label>
        <span><select id="role" name="difficulty">
          <option value="easy" ${team.difficulty === "easy" ? 'selected' : ''}>Easy Mode</option>
          <option value="classical" ${team.difficulty === "classical" ? 'selected' : ''}>Classical Mode</option>
        </select></span><br>

      //slider either on of off
      <label for="active">Active:</label>
        <span><input type="checkbox" id="active" name="active" value="active" ${team.active ? 'checked' : ''}></span><br>
      

      <div class="buttons">
        <button type="submit" name="delete" >Delete Team</button>
        <button type="submit" name="submit" >Update Team</button>
        <button type="submit" name="add" >Add Team</button>
      </div>
      <hr>
    `
    form.addEventListener("submit", async (event) => { 

    });

    teamDiv.appendChild(form);
    teamsDiv.appendChild(teamDiv);
    
  });
  mainDiv.appendChild(playersDiv);
  // mainDiv.appendChild(teamsDiv);
}