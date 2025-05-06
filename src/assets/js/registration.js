document.getElementById('upload-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const button = document.querySelector("#submit-button");
  button.style.visibility = "hidden"; 

  const fileInput = document.getElementById('profile-pic');
  const firstName = document.getElementById('name-first').value.trim();
  const lastName = document.getElementById('name-last').value.trim();
  const notes = document.getElementById('notes').value.trim() || "";
  const team = document.getElementById('team').value.split(" ")[1].trim(); // Get the first part of the team name
  const role = document.getElementById('role').value;
  const file = fileInput.files[0];
  const userToRegister = localStorage.getItem('accountName') || ""; // Get the user to register



  const reader = new FileReader();

  reader.onloadend = async () => {
    const base64 = reader.result;

    const response = await fetch('/.netlify/functions/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileBase64: base64 }),
    });

    const data = await response.json();
    if (!data.url) {
      alert("Upload failed. No URL returned.");
      button.style.visibility = "visible";
      return;
    } else {
      const imageUrl = data.url;
      const response = await fetch('/.netlify/functions/createProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, notes, team, role, imageUrl, userToRegister }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Upload successful!");
        button.style.visibility = "visible";
        document.getElementById('upload-form').reset();
      } else {
        alert("Upload failed: " + result.error);
        button.style.visibility = "visible";
      }
    }
  };

  reader.readAsDataURL(file);
});