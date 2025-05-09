document.addEventListener("DOMContentLoaded", async function () {
  const data = await getGameMasterInfo();
  if (data.status === "success") {
    loadContent(data.clues, data.teams, data.clueIds);
  } else {
    console.error("Failed to load game master data.");
  }
});

async function getGameMasterInfo() {
  const response = await fetch("/.netlify/functions/getGameMasterInfo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  return await response.json();
}


function loadContent(clues, teams, clueIds) {
  let mainDiv = document.querySelector(".content-container");
  mainDiv.innerHTML = "";
  let cluesDiv = document.createElement("div");
  cluesDiv.className = "clues-container";
  clues.forEach((clue) => {
    let clueDiv = document.createElement("div")
    let form = document.createElement("form")
    form.className = "clue-form";
    form.innerHTML = `
      <h2>Clue ID: ${clue.clueId}</h2>

      <label for="authKey">Auth Key:</label>
        <span><input type="text" id="authKey" name="authKey" value="${clue.authKey}"></span>
      
      <p>Easy Mode:</p>
        <label for="location">Location:</label>
          <span><input type="text" id="location" name="location" value="${clue.easy.location}"></span><br>
        <label for="riddle">Riddle:</label>
          <span><input type="text" id="riddle" name="riddle" value="${clue.easy.riddle}"></span><br>
        <label for="answer">Answer:</label>
          <span><input type="text" id="answer" name="answer" value="${clue.easy.answer}"></span><br>

      <p>Classical Mode:</p>
        <label for="location">Location:</label>
        <span><input type="text" id="location-c" name="location" value="${clue.classical.location}"></span><br>
        <label for="riddle">Riddle:</label>
          <span><input type="text" id="riddle-c" name="riddle" value="${clue.classical.riddle}"></span><br>
        <label for="answer">Answer:</label>
          <span><input type="text" id="answer-c" name="answer" value="${clue.classical.answer}"></span><br>

      <div class="buttons">
        <button id="delete" type="submit" name="delete" >Delete Clue</button>
        <button id="submit" type="submit" name="delete" >Update Clue</button>
        <button id="add" type="submit" name="delete" >Add Clue</button>
      </div>
      <hr>
    `;
    clueDiv.appendChild(form);
    cluesDiv.appendChild(clueDiv);



    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (event.submitter.name === "delete") {
        const confirmation = confirm("Are you sure you want to delete this clue? This action cannot be undone.");
        if (!confirmation) {
          return;
        }
        const id = clue.clueId;
        const response = await fetch("/.netlify/functions/deleteClue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clueId: id, userToUpdate: localStorage.getItem("accountName") }),
        });
        const result = await response.json();
        if (result.status === "success") {
          const data = await getGameMasterInfo();
          if (data.status === "success") {
            loadContent(data.clues, data.teams, data.clueIds);
          } else {
            console.error("Failed to load game master data.");
          }
        } else {
          alert("Failed to delete clue.");
        }
      } else if (event.submitter.name === "submit") {
        const authKey = form.querySelector("#authKey").value;
        const easyLocation = form.querySelector("#location").value;
        const easyRiddle = form.querySelector("#riddle").value;
        const easyAnswer = form.querySelector("#answer").value;
        const classicalLocation = form.querySelector("#location-c").value;
        const classicalRiddle = form.querySelector("#riddle-c").value;
        const classicalAnswer = form.querySelector("#answer-c").value;
        const data = {
          clueId: clue.clueId,
          authKey: authKey,
          easy: {
            location: easyLocation,
            riddle: easyRiddle,
            answer: easyAnswer
          },
          classical: {
            location: classicalLocation,
            riddle: classicalRiddle,
            answer: classicalAnswer
          },
          userToUpdate: localStorage.getItem("accountName")
        };
        console.log(data);
        const response = await fetch("/.netlify/functions/updateClue", {
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
        const data = {
          clueId: prompt("Enter a new clue ID, just remember this cannot be changed later!"),
          authKey: "Default",
          easy: {
            location: "Default",
            riddle: "Default",
            answer: "Default",
          },
          classical: {
            location: "Default",
            riddle: "Default",
            answer: "Default",
          },
          userToUpdate: localStorage.getItem("accountName")
        };
        const response = await fetch("/.netlify/functions/addClue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.status === "success") {
          const data = await getGameMasterInfo();
          if (data.status === "success") {
            alert("Clue added successfully! Scroll down to see the new clue, in its default state!");
            await loadContent(data.clues, data.teams, data.clueIds);
            const clues = document.querySelectorAll(".clue-form");
            const lastClue = clues[clues.length - 1];
            lastClue.scrollIntoView({ behavior: "smooth" });
          } else {
            console.error("Failed to load game master data.");
          }
        } else {
          alert("Failed to add clue.");
        }
      } else {
        return;
      }
    });
  })
  const teamQRCodes = document.createElement("div");
  teamQRCodes.className = "team-qrcodes";
  teams.forEach((team) => {
    let qrCodeDiv = document.createElement("div");
    qrCodeDiv.className = "qr-code";
    const link = document.createElement("a");
    link.href = `/assets/files/qr-codes/teams/${team}.png`;
    link.classList.add("qr-code-link");
    let qrCodeImg = document.createElement("img");
    qrCodeImg.src = `/assets/files/qr-codes/teams/${team}.png`;
    qrCodeImg.alt = `QR Code for ${team}`;
    link.appendChild(qrCodeImg);
    qrCodeDiv.appendChild(link);
    teamQRCodes.appendChild(qrCodeDiv);
  }); 
  const hr = document.createElement("hr");
  const clueQRCodes = document.createElement("div");
  clueQRCodes.className = "clue-qrcodes";
  clueIds.forEach((clueId) => {
    let qrCodeDiv = document.createElement("div");
    qrCodeDiv.className = "qr-code";
    const link = document.createElement("a");
    link.href = `/assets/files/qr-codes/clues/${clueId}.png`;
    link.classList.add("qr-code-link");
    let qrCodeImg = document.createElement("img");
    qrCodeImg.src = `/assets/files/qr-codes/clues/${clueId}.png`;
    qrCodeImg.alt = `QR Code for clue: ${clueId}`;
    link.appendChild(qrCodeImg);
    qrCodeDiv.appendChild(link);
    clueQRCodes.appendChild(qrCodeDiv);
  });
  mainDiv.appendChild(cluesDiv);
  mainDiv.appendChild(teamQRCodes);
  mainDiv.appendChild(hr);
  mainDiv.appendChild(clueQRCodes);
}