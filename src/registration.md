---
layout: "base"
page_title: "Kepler Scavenger Hunt"
logo_location: "../../assets/files/logos/logo.png"
styles: [
  "registration",
  "login"
]
scripts: [
  "registration",
  "login"
]
title: "Registration"
---

<form id="upload-form">
  <input type="file" id="profile-pic" name="profile-pic" accept="image/*" capture="environment" required />
  <input type="text" id="name-first" name="name-first" placeholder="Player First Name" required />
    <input type="text" id="name-last" name="name-last" placeholder="Player Last Name" required />
    <input type="text" id="notes" name="notes" placeholder="Additional Notes here"/>
      <select name="teams" id="team" required>
        <option value="" disabled selected>Select a team</option>
        {% for team in team %}
          <option value="{{ team }}">{{ team }}</option>
        {% endfor %}
      </select>
      <select name="role" id="role" required>
        <option value="" disabled selected>Select a role</option>
        <option value="Team Member">Team Member</option>
        <option value="Team Captain">Team Captain</option>
      </select>
  <button id="submit-button" type="submit">Upload</button>
</form>

<!-- Add who did the regristraion.... When logged in store name in localstorage, reset next login-->