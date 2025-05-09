document.addEventListener("DOMContentLoaded", async () => {
  const data = await getAdminInfo();
  if (data.status === "success") {
    await loadSelectedMenu();
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

async function loadSelectedMenu() {
  const selectMenuDiv = document.querySelector(".select-menu-container");
  selectMenuDiv.innerHTML = "";
  const selectForm = document.createElement("form");
  selectForm.className = "select-menu-form";
  selectForm.innerHTML = `
      <select id="menu" name="menu">
        <option value="" disabled selected>Select an option</option>
        <option value="players">Players</option>
        <option value="teams">Teams</option>
        <option value="winners">Winners</option>
        <option value="colors">Colors</option>
        <option value="chat">Chat</option>
        <option value="accounts">Accounts</option>
        <option value="clear">Clear All Local Storage</option>
      </select>
  `;
  selectMenuDiv.appendChild(selectForm);

  selectForm.addEventListener("change", async (event) => {
    const selectedMenu = event.target.value;
    const data = await getAdminInfo();
    if (selectedMenu === "players") {
      loadPlayerContent(data.players, data.teamNames);
    } else if (selectedMenu === "teams") {
      loadTeamContent(data.teams);
    } else if (selectedMenu === "winners") {
      loadWinnersContent(data.winners[0]);
    } else if (selectedMenu === "colors") {
      loadColorsContent(data.colors);
    } else if (selectedMenu === "chat") {
      loadChatContent(data.chatData.messages);
    } else if (selectedMenu === "accounts") {
      loadAccountsContent(data.accounts);
    } else if (selectedMenu === "clear") {
      const confirmation = confirm("Are you sure you want to clear all local storage? This action cannot be undone.");
      if (confirmation) {
        localStorage.clear();
        alert("Local storage cleared!");
        window.location.reload();
      } else {
        return;
      }
    } else {
      alert("Invalid selection. Please try again.");
    }
  });

}


function loadPlayerContent(players, teamNames) {
  let mainDiv = document.querySelector(".content-container");
  mainDiv.innerHTML = ""; 
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
        <button id="delete" type="submit" name="delete" >Delete Player</button>
        <button id="submit" type="submit" name="submit" >Update Player</button>
        <button id="add" type="submit" name="add" >Add Player</button>
      </div>
      <hr>
    `
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (event.submitter.name === "delete") {
        const confirmation = confirm("Are you sure you want to delete this player? This action cannot be undone.");
        if (!confirmation) {
          return;
        }
        const id = player.playerId;
        const response = await fetch("/.netlify/functions/deletePlayer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ playerId: id, userToUpdate: localStorage.getItem("accountName") }),
        });
        const result = await response.json();
        if (result.status === "success") {
          const data = await getAdminInfo();
          if (data.status === "success") {
            loadPlayerContent(data.players, data.teamNames);
          } else {
            console.error("Failed to load ADMIN data.");
          }
        } else {
          alert("Failed to delete player :(");
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
          alert("Player updated successfully! 🕺");
        } else {
          alert("Failed to update player :(");
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
  mainDiv.appendChild(playersDiv);
}

function loadTeamContent(teams) {
  let mainDiv = document.querySelector(".content-container");
  mainDiv.innerHTML = "";
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

      <label for="color">Color:</label>
        <span><input type="text" id="color" name="color" value="${team.color}"></span><br>
      
      <label for="colorText">Color Text:</label>
        <span><input type="text" id="colorText" name="colorText" value="${team.colorText}"></span><br>

      <label for="cluesFound">Clues Found:</label><br>
        ${team.cluesFound.map((clue, index) => {
          return `
            <span><input type="checkbox" id="${clue}" name="cluesFound" value="Clue ${index}: ${clue}" ${team.cluesFound[index] === true ? 'checked' : ''}>Clue ${index}</span><br>
          `;
        }).join('')}</span><br>
      
      <label for="cluesCompleted">Clues Completed:</label><br>
        ${team.cluesCompleted.map((clue, index) => {
          return `
            <span><input type="checkbox" id="${clue}" name="cluesCompleted" value="Clue ${index}: ${clue}" ${team.cluesCompleted[index] === true ? 'checked' : ''}>Clue ${index}</span><br>
          `;
        }).join('')}</span><br>

      <label for="difficulty">Difficulty:</label>
        <span><select id="difficulty" name="difficulty">
          <option value="easy" ${team.difficulty === "easy" ? 'selected' : ''}>Easy Mode</option>
          <option value="classical" ${team.difficulty === "classical" ? 'selected' : ''}>Classical Mode</option>
        </select></span><br>

      <label for="userToUpdate">User to Update:</label>
        <span><input type="text" id="userToUpdate" name="userToUpdate" value="${team.userToUpdate || "Not Updated yet"}"></span><br>

      <label for="active">Active:</label>
        <span><input type="checkbox" id="active" name="active" value="active" ${team.active ? 'checked' : ''}></span><br>
      

      <div class="buttons">
        <button id="delete" type="submit" name="delete" >Delete Team</button>
        <button id="submit" type="submit" name="submit" >Update Team</button>
        <button id="add" type="submit" name="add" >Add Team</button>
      </div>
      <hr>
    `
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (event.submitter.name === "delete") {
        const confirmation = confirm("Are you sure you want to delete this team? This action cannot be undone.");
        if (!confirmation) {
          return;
        }
        const id = team.teamId;
        const response = await fetch("/.netlify/functions/deleteTeam", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamId: id, userToUpdate: localStorage.getItem("accountName") }),
        });
        const result = await response.json();
        if (result.status === "success") {
          const data = await getAdminInfo();
          if (data.status === "success") {
            loadTeamContent(data.teams);
          } else {
            console.error("Failed to load admin data :(");
          }
        } else {
          alert("Failed to delete team :(");
        }
      } else if (event.submitter.name === "submit") {
        let cluesFound = Array.from(form.querySelectorAll('input[name="cluesFound"]:checked')).map(input => input.value);
        let cluesCompleted = Array.from(form.querySelectorAll('input[name="cluesCompleted"]:checked')).map(input => input.value);
        cluesFound.forEach((clue, index) => {
          cluesFound[index] = clue.includes('true') ? true : false;
        })
        cluesCompleted.forEach((clue, index) => {
          cluesCompleted[index] = clue.includes('true') ? true : false;
        })

        const data = {
          oldTeamId: team.teamId,
          teamId: form.querySelector("#teamId").value,
          teamName: form.querySelector("#teamName").value,
          teamMembers: form.querySelector("#members").value.split(",").map(member => member.trim()),
          score: form.querySelector("#score").value,
          key: form.querySelector("#key").value,
          token: form.querySelector("#token").value,
          motto: form.querySelector("#motto").value,
          cluesFound: cluesFound,
          cluesCompleted: cluesCompleted,
          difficulty: form.querySelector("#difficulty").value,
          active: form.querySelector('input[name="active"]:checked') ? true : false,
          color: form.querySelector("#color").value,
          colorText: form.querySelector("#colorText").value,
          userToUpdate: localStorage.getItem("accountName")
        };
        const response = await fetch("/.netlify/functions/updateTeam", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.status === "success") {
          alert("Team updated successfully! 🕺");
        } else {
          alert("Failed to update team :(");
        }
      } else if (event.submitter.name === "add") {
        const data = {
          userToUpdate: localStorage.getItem("accountName"),
        };
        const response = await fetch("/.netlify/functions/addTeam", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.status === "success") {
          const data = await getAdminInfo();
          if (data.status === "success") {
            alert("Team added successfully! Scroll down to see the new team, in its default state!");
            loadTeamContent(data.teams);
            const teams = document.querySelectorAll(".team-form");
            const lastTeam = teams[teams.length - 1];
            lastTeam.scrollIntoView({ behavior: "smooth" });
          } else {
            console.error("Failed to load admin data.");
          }
        } else {
          alert("Failed to add team :(");
        }
      } else {
        return;
      }
    });

    teamDiv.appendChild(form);
    teamsDiv.appendChild(teamDiv);
  });
  mainDiv.appendChild(teamsDiv);
}

function loadWinnersContent(winners) {
  console.log(winners.winners);
  let mainDiv = document.querySelector(".content-container");
  mainDiv.innerHTML = ""; 
  let winnersDiv = document.createElement("div");
  winnersDiv.className = "winners-container";
  let winnersForm = document.createElement("form");
  winnersForm.className = "winners-form"
  winnersForm.innerHTML = `
    <label for="winners">Winners:</label><br>
      ${winners.winners.map((winner) => { 
        return `
          <span class="winners"><input type="text" id="winners-id" name="winners" value="${winner.teamId}">
          <input type="text" id="winners-name" name="winners-name" value="${winner.teamName}"></span><br>
        `;
      }).join(' ')}</span><br>
    
    <div class="buttons">
      <button id="delete" type="submit" name="delete" >Delete Winners</button>
      <button id="submit" type="submit" name="submit" >Update Winners</button>
      <button id="add" type="submit" name="add" >Add Winners</button>
    </div>
    <hr>
  `
  winnersForm.addEventListener("submit", async (event) => { 
    event.preventDefault();
    if (event.submitter.name === "delete") {
      const confirmation = confirm("Are you sure you want to delete the winners? This action cannot be undone.");
      if (!confirmation) {
        return;
      }
      let index = prompt("Enter the index of the winner to delete (0 = first winner):");
      if (index === null || index === "") {
        return;
      }
      index = parseInt(index);
      if (isNaN(index) || index < 0 || index >= winners.winners.length) {
        alert("Invalid index. Please try again:");
        return;
      }
      winners.winners.splice(index, 1);
      loadWinnersContent(winners);
      alert("Winner has been marked for deletion! Make sure to click update to finish deleting!");
    } else if (event.submitter.name === "submit") {
      const winners = Array.from(winnersForm.querySelectorAll('.winners')).map((winner) => {
        return {
          teamId: winner.querySelector('input[name="winners"]').value,
          teamName: winner.querySelector('input[name="winners-name"]').value,
        };
      });
      const data = {
        winners: winners,
        userToUpdate: localStorage.getItem("accountName")
      };
      const response = await fetch("/.netlify/functions/updateWinners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.status === "success") {
        alert("Winners updated successfully! 🕺");
      } else {
        alert("Failed to update winners :(");
      }
    } else if (event.submitter.name === "add") {
      winners.winners.push({ teamId: "", teamName: "" });
      loadWinnersContent(winners);
      alert("Added a new winner! Scroll down to see the new winner, make sure to fill in the details and click update to save!");
      const winnersForm = document.querySelectorAll(".winners-form");
      const lastWinner = winnersForm[winnersForm.length - 1];
      lastWinner.scrollIntoView({ behavior: "smooth" });
    } else {
      return;
    }
  });

  winnersDiv.appendChild(winnersForm);
  mainDiv.appendChild(winnersDiv);
} 

function loadColorsContent(colors) {
  let mainDiv = document.querySelector(".content-container");
  mainDiv.innerHTML = ""; 
  let colorsDiv = document.createElement("div");
  colorsDiv.className = "color-container";
  colors.forEach((color) => {
    let colorDiv = document.createElement("div");
    colorDiv.className = "color-container";
    const form = document.createElement("form");
    form.className = "color-form";
    form.innerHTML = `
      <span class="winners"><input type="text" id="color-key" name="color-key" value="${color.key}">
      <input type="text" id="color-color" name="color-color" value="${color.color}"></span><br>

      <div class="buttons">
        <button id="delete" type="submit" name="delete" >Delete Color</button>
        <button id="submit" type="submit" name="submit" >Update Color</button>
        <button id="add" type="submit" name="add" >Add Color</button>
      </div>
      <hr>
    `
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (event.submitter.name === "delete") {
        const confirmation = confirm("Are you sure you want to delete this color? This action cannot be undone.");
        if (!confirmation) {
          return;
        }
        const id = color.key;
        const response = await fetch("/.netlify/functions/deleteColor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: id, userToUpdate: localStorage.getItem("accountName") }),
        });
        const result = await response.json();
        if (result.status === "success") {
          const data = await getAdminInfo();
          if (data.status === "success") {
            loadColorsContent(data.colors, );
          } else {
            console.error("Failed to load ADMIN data.");
          }
        } else {
          alert("Failed to delete color :(");
        }
      } else if (event.submitter.name === "submit") {
        const data = {
          oldKey: color.key,
          key: form.querySelector("#color-key").value,
          color: form.querySelector("#color-color").value,
          userToUpdate: localStorage.getItem("accountName")
        };
        const response = await fetch("/.netlify/functions/updateColor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.status === "success") {
          alert("Color updated successfully! 🕺");
        } else {
          alert("Failed to update color :(");
        }
      } else if (event.submitter.name === "add") {
        const response = await fetch("/.netlify/functions/addColor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userToUpdate: localStorage.getItem("accountName") }),
        });
        const result = await response.json();
        if (result.status === "success") {
          const data = await getAdminInfo();
          if (data.status === "success") {
            alert("Color added successfully! Scroll down to see the new color, in its default state!");
            loadColorsContent(data.colors);
            const colors = document.querySelectorAll(".color-form");
            const lastColor = colors[colors.length - 1];
            lastColor.scrollIntoView({ behavior: "smooth" });
          } else {
            console.error("Failed to load admin data.");
          }
        } else {
          alert("Failed to add color :(");
        }
      } else {
        return;
      }
    });
    colorDiv.appendChild(form);
    colorsDiv.appendChild(colorDiv);
  });
  mainDiv.appendChild(colorsDiv);
}

async function checkUserAuthentication() {
  if (localStorage.getItem("lastLogin") && localStorage.getItem("lastLogin") > Date.now() - 1000 * 60 * 15) { // 15 mins, stops the user from logging in again, but stops console use for new devices
    return "valid"; 
  }
  const res = await fetch('https://api.ipify.org?format=json');
  const data = await res.json();
  const ip = data.ip

  const Userdata = {
    username: prompt("Please enter your username to access accounts panel:"),
    password: prompt("Please enter your password to access accounts panel:"),
    token: "X7L9M2QJH",
    attempts: localStorage.getItem("attempts") || 0,
    ip: ip, 
  }

  const response = await fetch("/.netlify/functions/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Userdata),
  });
  if (response.ok) {
    localStorage.setItem("attempts", 0); 
    localStorage.setItem("accountName", Userdata.username);
    localStorage.setItem("lastLogin", Date.now());
    return "valid";
  } else {
    localStorage.setItem("attempts", parseInt(localStorage.getItem("attempts")) + 1); 
    return "invalid";
  }
}

async function loadAccountsContent(accounts) {
  const validUse = await checkUserAuthentication()
  if (validUse === "invalid") {
    alert("You are not authorized to access this page. Please contact the admin for access 🪖");
    const mainDiv = document.querySelector(".content-container");
    mainDiv.innerHTML = "<h1>Access Denied</h1>";
    return;
  }
  let mainDiv = document.querySelector(".content-container");
  mainDiv.innerHTML = "";
  let allTokens = null
  accounts.findIndex((act) => { 
    if (act.id === "allTokens") {
      allTokens = act; 
      accounts = accounts.filter((a) => a.id !== "allTokens");
      return true;
    }
  })
  console.log(allTokens);
  console.log(accounts);
  let accountsDiv = document.createElement("div");
  accountsDiv.className = "accounts-container";
  accounts.forEach((account) => { 
    let accountDiv = document.createElement("div");
    accountDiv.className = "account-container";
    const form = document.createElement("form");
    form.className = "account-form";
    form.innerHTML = `
      <label for="username">Username:</label>
        <span><input type="text" id="username-${account.username}" name="username" value="${account.username}"></span><br>

      <label for="password">Password:</label>
        <span><input type="password" id="password-${account.username}" name="password" value="${account.password}" ></span><br>

      <label for="allowed-pages">Allowed Pages:</label><br>
        ${allTokens.tokens.map((token) => { 
          return `
            <span><input type="checkbox" id="${token}-${account.username}" name="allowed-pages" value="${token}-${account.username}" ${account.allowedTokens.includes(token[1]) ? 'checked' : ''}>${token[0]} - ${token[1]}</span><br>
          `;
        }).join('')}</span><br>
        


      <div class="buttons">
        <button id="delete" type="submit" name="delete" >Delete Account</button>
        <button id="submit" type="submit" name="submit" >Update Account</button>
        <button type="submit" name="show" >Show Password</button>
        <button id="add" type="submit" name="add" >Add Account</button>
      </div>
      <hr>
    `
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (event.submitter.name === "delete") {
        const confirmation = confirm("Are you sure you want to delete this account? This action cannot be undone.");
        if (!confirmation) {
          return;
        }
        const id = account.username;
        const response = await fetch("/.netlify/functions/deleteAccount", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: id, userToUpdate: localStorage.getItem("accountName") }),
        });
        const result = await response.json();
        if (result.status === "success") {
          const data = await getAdminInfo();
          if (data.status === "success") {
            loadAccountsContent(data.accounts);
          } else {
            console.error("Failed to load admin data.");
          }
        } else {
          alert("Failed to delete account :(");
        }
      } else if (event.submitter.name === "submit") {
        const data = {
          oldUsername: account.username,
          username: form.querySelector(`#username-${account.username}`).value,
          password: form.querySelector(`#password-${account.username}`).value,
          allowedTokens: Array.from(form.querySelectorAll('input[name="allowed-pages"]:checked')).map(input => input.value.split(",")[1].split("-")[0]),
          userToUpdate: localStorage.getItem("accountName")
        };
        const response = await fetch("/.netlify/functions/updateAccount", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.status === "success") {
          alert("Account updated successfully! 🕺");
        } else {
          alert("Failed to update account :(");
        }
      } else if (event.submitter.name === "add") {
        const data = {
          userToUpdate: localStorage.getItem("accountName"),
        };
        const response = await fetch("/.netlify/functions/addAccount", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.status === "success") {
          const data = await getAdminInfo();
          if (data.status === "success") {
            alert("Account added successfully! Scroll down to see the new team, in its default state!");
            loadAccountsContent(data.accounts);
            const newAccount = document.querySelectorAll(".account-form");
            const lastAccount = newAccount[newAccount.length - 1];
            lastAccount.scrollIntoView({ behavior: "smooth" });
          } else {
            console.error("Failed to load admin data.");
          }
        } else {
          alert("Failed to add team :(");
        }
      } else if (event.submitter.name === "show") {
        const passwordField = form.querySelector(`#password-${account.username}`);
        if (passwordField.type === "password") {
          passwordField.type = "text";
          event.submitter.textContent = "Hide Password";
        } else {
          passwordField.type = "password";
          event.submitter.textContent = "Show Password";
        }
      } else {
        return;
      }
    });

    accountDiv.appendChild(form);
    accountsDiv.appendChild(accountDiv);
  });
  mainDiv.appendChild(accountsDiv);
}


function loadChatContent(chats) {
  let mainDiv = document.querySelector(".content-container");
  mainDiv.innerHTML = ""; 
  let chatsDiv = document.createElement("div");
  chatsDiv.className = "chat-container";
  chats.forEach((chat, index) => {
    let chatDiv = document.createElement("div");
    chatDiv.className = "chat-container";
    const form = document.createElement("form");
    form.className = "chat-form";
    form.innerHTML = `
      <label for="author">Author:</label>
        <span><input type="text" id="author-${chat.date}" name="author" value="${chat.teamName}" readonly></span><br>

      <label for="message">Message:</label>
        <span><input type="text" id="message-${chat.date}" name="message" value="${chat.message}" readonly></span><br>

      <label for="timestamp">Timestamp:</label>
        <span><input type="text" id="timestamp-${chat.date}" name="timestamp" value="${chat.date}" readonly></span><br>

      <label for="ip">IP:</label>
        <span><input type="text" id="ip-${chat.date}" name="ip" value="${chat.ip}" readonly></span><br>

      <div class="buttons">
        <button id="delete" class="${chat.date}" type="submit" name="delete" >Delete Chat</button>
        <button id="submit" class="${chat.date}" type="submit" name="submit" >Update Chat</button>
        <button id="add" type="submit" name="add" >Add Chat</button>
      </div>
      <hr>
    `
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (event.submitter.name === "delete") {
        const confirmation = confirm("Are you sure you want to delete this color? This action cannot be undone.");
        if (!confirmation) {
          return;
        }
        let index = event.submitter.className;
        if (index === null || index === "") {
          return;
        }
        chats = chats.filter((chat) => chat.date !== index)
        loadChatContent(chats);
        alert("Winner has been marked for deletion! Make sure to click update to finish deleting!");
      } else if (event.submitter.name === "submit") {

        const data = {
          messages: chats,
          userToUpdate: localStorage.getItem("accountName")
        };
        const response = await fetch("/.netlify/functions/updateChats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.status === "success") {
          alert("Color updated successfully! 🕺");
        } else {
          alert("Failed to update color :(");
        }
      } else if (event.submitter.name === "add") {
        confirmation = confirm("Adding a new chat must be done form the chat UI, do you want me to take you there?")
        if (confirmation) {
          window.location.href = "/chat/";
        } else {
          return;
        }
      } else {
        return;
      }
    });
    chatDiv.appendChild(form);
    chatsDiv.appendChild(chatDiv);
  });
  mainDiv.appendChild(chatsDiv);
}