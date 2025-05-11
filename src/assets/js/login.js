document.addEventListener("DOMContentLoaded", async function () {
  let pars = new URLSearchParams(window.location.search);
  let token = pars.get("token");
  if (!token) {
    alert("No token provided, please use the correct link.");
    window.location.href = "/index.html";
  }


  const body = document.querySelector("body");
  const form = document.createElement("form");
  form.id = "login-form";
  form.innerHTML = `
    <p id="login">Username:</p>
    <input type="text" id="username" name="username" required>
    <p id="login">Password:</p>
    <input type="password" id="password" name="password" required>
    <button id="login-button" type="submit">Login</button>
  `;
  body.appendChild(form);

  const button = document.getElementById("login-button");

  const res = await fetch('https://api.ipify.org?format=json');
  const data = await res.json();
  const ip = data.ip; // get the IP address from the response

  button.addEventListener("click", async function (e) {
    e.preventDefault(); 
    button.style.visibility = "hidden";
    const data = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      token: token,
      attempts: localStorage.getItem("attempts") || 0, // send notification after 2 failed attempts
      ip: ip, 
    }
    await getLogin(data);
  });

});

async function getLogin(data) {
  const response = await fetch("/.netlify/functions/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (response.ok) {
    alert("Login successful! Redirecting to the main page.");
    localStorage.setItem("attempts", 0); 
    localStorage.setItem("accountName", data.username);
    const body = document.querySelector("body");
    body.style.visibility = "visible";
    const form = document.getElementById("login-form");
    form.style.visibility = "hidden"; 
    if (window.location.href.includes("admin")) {
      const selectMenuDiv = document.querySelector(".select-menu-container");
      selectMenuDiv.style.visibility = "visible";
    }
  } else {
    alert(result.message);
    localStorage.setItem("attempts", parseInt(data.attempts) + 1); 
    const button = document.getElementById("login-button");
    button.style.visibility = "visible"; 
  }
}