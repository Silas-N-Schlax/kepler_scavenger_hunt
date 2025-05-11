document.addEventListener("DOMContentLoaded", async function() {
  
  const pars = new URLSearchParams(window.location.search);
  
  const teamId = localStorage.getItem("teamId");
  const teamName = localStorage.getItem("teamName");
  const clueAuth = pars.get("clueAuth") || "N/A"; // for links on webpage, must be already unlocked by the team
  const clueID = pars.get("clueID") || ""
  
  if (await checkAccess(teamId, teamName, clueAuth, clueID)) {
    const body = document.querySelector("body");
    body.style.visibility = "visible";
    await loadContent(teamId, teamName, clueID);
    
  } else {
    alert("Your team has not found this clue yet. Find it and scan the QR code to unlock it for your team!");
    window.location.href = `/content/${teamName}/home`;
  }
})

const button = document.querySelector(".submit-button");
button.addEventListener("click", async function(event) {
  event.preventDefault();
  
  const pars = new URLSearchParams(window.location.search);

  const teamId = localStorage.getItem("teamId");
  const teamName = localStorage.getItem("teamName");
  const clueId = pars.get("clueID") || ""; 
  const answer = document.getElementById("answer").value;
  button.style.visibility = "hidden";

  if (await checkAnswer(teamId, teamName, clueId, answer) === true) {
    alert("Correct answer! You have completed this clue.");
    loadContent(teamId, teamName, clueId);
  } else {
    alert("Incorrect answer. Please try again.");
    button.style.visibility = "visible";
  }
})




async function clueFinished(teamId, teamName, clueID) {
  const response = await fetch("/.netlify/functions/clueFinished", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamId: teamId,
      teamName: teamName,
      clueID: clueID
    }),
  });
  const data = await response.json();
  if (data.status === "success") {
    return data;
  } else {
    return false;
  }
}

async function checkAnswer(teamId, teamName, clueId, answer) {
  const response = await fetch("/.netlify/functions/checkAnswer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamId: teamId,
      teamName: teamName,
      clueId: clueId,
      answer: answer,
    }),
  });
  const data = await response.json();
  if (data.status === "success") {
    return true;
  } else {
    return false;
  }
}

async function loadContent(teamId, teamName, clueID) {
  const clue = await clueFinished(teamId, teamName, clueID);
    if (clue.finished === true) {
      const location = clue.location;
      const nextClue = clue.nextClue;
      const answer = clue.answer;
      clueDiv = document.querySelector(".riddle-container").style.visibility = "visible";
      document.querySelector(".location-riddle").innerHTML = `<strong>Location of Next QR Code:</strong> ${location}`;
      document.querySelector(".riddle").innerHTML = `<strong>Next Riddle:</strong> ${nextClue}`;
      document.querySelector(".answer").innerHTML = `<strong>Answer:</strong> ${answer}`;
      document.querySelector(".qr-code").style.visibility = "visible";
      document.querySelector(".answer-container").remove();
    } else {
      console.log("Clue is not finished yet.");
    }
}


async function checkAccess(teamID, teamName, clueAuth, clueID) {
  const response = await fetch("/.netlify/functions/checkAccessClue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamId: teamID,
      teamName: teamName,
      clueAuth: clueAuth,
      clueID: clueID
    }),
  });
  const data = await response.json();
  if (data.status === "success") {
    return true;
  } else {
    return false;
  }
}