//Check if the team has access to the clue, if not redirect to the main page.
// If the team has access, show the clue.
// once they get the riddle right, hide input field and show the answer on previous page under the riddle, and show the next riddle instead.

//& On Load, check if team has access to the clue, and if they finished it
//& If they have access, and not finished show the input
//& If they have access and finished, show the next clue and location
//& If showing clue check if the next riddle is finished, if so
//& show answer on this page, so they can see what answer goes with which riddle

//check on load of page

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

// Add event listener to the button
const button = document.querySelector(".submit-button");
button.addEventListener("click", async function(event) {
  console.log("Button clicked!");
  event.preventDefault(); // Prevent the default form submission
  
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
      document.querySelector(".clue-riddle").remove();
      document.querySelector(".qr-code").style.visibility = "visible";
    } else {
      console.log("Clue is not finished yet.");
    }
}


async function checkAccess(teamID, teamName, clueAuth, clueID) {
  console.log("Checking access for teamId:");
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