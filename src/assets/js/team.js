

document.addEventListener("DOMContentLoaded", async function() {
  const pars = formatPars();

  const teamId = pars[0];
  const key = pars[1];
  const token = pars[2];
  const teamName = pars[3];
  

  if (await checkAccess(teamId, key, token, teamName)) {
    const body = document.querySelector("body");
    body.style.visibility = "visible";

    loadContent(teamId, teamName);

    // store access in local storage
    localStorage.setItem("teamId", teamId);
    localStorage.setItem("teamName", teamName);
    localStorage.setItem("key", key);
    localStorage.setItem("token", token);

    await loadUserProfiles();
  } else {
    alert("You do not have access to this page. Please contact a Game Master, or ask a team member for the QR code!");
    window.location.href = "/"
  }

})

function formatPars() {
  const pars = []

  if (localStorage.getItem("teamId") && localStorage.getItem("key") && localStorage.getItem("token") && localStorage.getItem("teamName")) {
    pars.push(localStorage.getItem("teamId"));
    pars.push(localStorage.getItem("key"));
    pars.push(localStorage.getItem("token"));
    pars.push(localStorage.getItem("teamName"));
    return pars;
  }
  else if (window.location.search) {
    const urlParams = new URLSearchParams(window.location.search);
    pars.push(urlParams.get("teamId"));
    pars.push(urlParams.get("key"));
    pars.push(urlParams.get("token"));
    pars.push(urlParams.get("teamName"));
    return pars
  } else {
    alert("Missing parameters in URL.");
    window.location.href = "/"
  }
}


async function checkAccess(teamId, key, token, teamName) {
  console.log("Checking access for teamId: " + teamId + ", key: " + key + ", token: " + token + ", teamName: " + teamName);
  const response = await fetch("/.netlify/functions/checkAccess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamId: teamId,
      key: key,
      token: token,
      teamName: teamName
    }),
  });
  const data = await response.json();
  console.log(data.status);
  if (data.status === "success") {
    return true;
  } else {
    return false;
  }
}

async function loadContent(teamId, teamName) {
  const response = await fetch("/.netlify/functions/checkClue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamId: teamId,
      teamName: teamName,
    }),
  });
  const data = await response.json();
  if (data.status === "success") {
    for (let i = 0; i < data.clues.length; i++) {
      const clue = data.clues[i];
      console.log(clue)
      let list = document.getElementsByClassName("clue-container")[0];
      const li = document.createElement("li");
      li.className = "clues";
      li.innerHTML = `
        <a href="/clues/clue-${clue.clueId}?clueID=${clue.clueId}" class="class-link">
          Clue #${clue.clueId} (${clue.status})
        </a>
      `;
      list.appendChild(li);
    }
  } else {
    alert("Error loading content. Please try again later.");
  }
}


//~ Load user Profiles

async function loadUserProfiles() {
  const response = await fetch("/.netlify/functions/getUserProfile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamId: localStorage.getItem("teamId"),
      teamName: localStorage.getItem("teamName"),
      key: localStorage.getItem("key"),
      token: localStorage.getItem("token"),
    }),
  });
  const data = await response.json();
  console.log(data.profiles);
  if (data.status === "success") {
    let profilesToLoad = data.profiles;
    profilesToLoad.forEach((profile) => {
     if (profile.role === "Team Captain") {
      let list = document.getElementsByClassName("team-container-captain")[0];
      const div = document.createElement("div");
      div.className = "team-member captain";
      div.innerHTML = `
        <div class="team-member-image">
          <img src="${profile.imageURL}" alt="${profile.firstName} ${profile.lastName}">
        </div>
        <div class="team-member-name">
          <h3>${profile.firstName} ${profile.lastName}</h3>
          <p>${profile.role}</p>
        </div>
      `;
      console.log(profile);
      list.appendChild(div);
     } else {
      let list = document.getElementsByClassName("team-container-members")[0];
      const div = document.createElement("div");
      div.className = "team-member";
      div.innerHTML = `
        <div class="team-member-image">
          <img src="${profile.imageURL}" alt="${profile.firstName} ${profile.lastName}">
        </div>
        <div class="team-member-name">
          <h3>${profile.firstName} ${profile.lastName}</h3>
        </div>
      `;
      console.log(profile);
      list.appendChild(div);
     }
    })
  } else {
    //do nothing, just show the page without the profiles, its ok :)
  }
}