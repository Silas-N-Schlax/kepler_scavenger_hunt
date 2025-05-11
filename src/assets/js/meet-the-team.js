document.addEventListener("DOMContentLoaded", async function () {
  const response = await fetch("/.netlify/functions/getAllUserProfiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json();
  if (data) {
    await loadContent(data);
  } else {
    alert("Error loading team data. Please try again later.");
  }
});

async function loadContent(data) {
  const mainDiv = document.querySelector('.content-container');
  data.forEach(team => {
    const teamDiv = document.createElement('div');
    teamDiv.classList.add('team-container');
    const logoDiv = document.createElement('div'); 
    logoDiv.classList.add('team-logo-container');
    const teamLogo = document.createElement('img');
    teamLogo.src = `/assets/files/logos/${team.teamName}.png`;
    teamLogo.alt = `${team.teamName} logo`;
    teamLogo.classList.add('team-logo');
    const teamMotto = document.createElement('p');
    teamMotto.classList.add('team-motto');
    teamMotto.textContent = team.motto; 
    const teamMembersDiv = document.createElement('div');
    teamMembersDiv.classList.add('team-members');
    //image of team member then name right below it
    team.teamMembers.forEach((member) => {
      member = member[0];
      const memberDiv = document.createElement('div');
      memberDiv.classList.add('team-member');
      if (member.role === "Team Captain") {
        memberDiv.classList.add('captain');
      } 
      const memberImage = document.createElement('img');
      memberImage.src = member.imageURL;
      memberImage.alt = `${member.firstName} ${member.lastName}`;
      memberImage.classList.add('member-image');
      const memberName = document.createElement('p');
      memberName.textContent = `${member.firstName} ${member.lastName}`;
      memberDiv.appendChild(memberImage);
      memberDiv.appendChild(memberName);
      teamMembersDiv.appendChild(memberDiv);
    });
    // no team name
    logoDiv.appendChild(teamLogo);
    logoDiv.appendChild(teamMotto);
    teamDiv.appendChild(logoDiv);
    const lineBreak = document.createElement('hr');
    lineBreak.classList.add('team-line-break');
    teamDiv.appendChild(lineBreak);
    teamDiv.appendChild(teamMembersDiv);
    mainDiv.appendChild(teamDiv);
  });
  mainDiv.appendChild(teamDiv);
  
}