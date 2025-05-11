//! Features
//* 5 min rate limiting, server side validation, use ip address for the limiting
//* auto refresh the chat every 1 min, don't reload just request data from server
//* show a loading spinner while waiting for the response???
//* Send notifications to discord when a new message is sent
//* add secret "slash" commands to server to allows those who know it to bypass the rate limiting
//& Add chats in order to admin page to deleted as needed.
//* Store in order keeping information like team name, team id, Ip, date, and message
//* Show the team name and pfp for messages sent by the team regardless of the user
//* 


document.addEventListener("DOMContentLoaded", async function () {
  const data = await getChatData()
})

async function getChatData() {
   const response = await fetch("/.netlify/functions/getChatData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamName: localStorage.getItem("teamName"),
      teamId: localStorage.getItem("teamId"),
    })
  })
  return await response.json()
}

function loadMessages(messages) {
  messages.forEach((message) => {
    const messageContainer = document.querySelector(".message-container");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message")
    messageDiv.classList.add(message.side)
      messageDiv.innerHTML = `
        <div class="message-header">
          <img src="../../assets/files/logos/${(message.teamName)}.png" alt="${message.teamName}" class="message-pfp">
          <div class="message-name-date">
            <span class="message-team-name"><strong>Team ${message.teamName}</strong></span>
            <span class="message-date">${new Date(message.date).toLocaleString()}</span>
          </div>
        </div>
        <div class="message-body">
          ${message.message}
        </div>
      `
    messageDiv.style.backgroundColor = message.color || "var(--color-chat-default)"
    messageContainer.appendChild(messageDiv)
    const messageHeader = messageDiv.querySelector(".message-header")
    messageHeader.style.color = message.colorText || "var(--color-chat-default-text)"
  })
const timer = document.querySelector(".timer");

if (!timer.dataset.start) {
  timer.dataset.start = new Date().getTime();
}

setInterval(() => {
  const time = new Date().getTime();
  const seconds = Math.floor((time - timer.dataset.start) / 1000);
  const secondsLeft = seconds % 60;

  timer.innerHTML = `Last updated: ${secondsLeft}s ago`;

  if (seconds >= 60) {
    getChatData().then((newData) => {
      if (JSON.stringify(newData.messages) === JSON.stringify(messages)) {
      } else {
        loadMessages(newData.messages);
      }
    });
    timer.dataset.start = new Date().getTime();
  }
}, 1000);
  

  const chatFooter = document.querySelector(".chat-footer")
  chatFooter.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest"
  })
}


const form = document.querySelector(".message-form")
form.addEventListener("submit", async function () {
  event.preventDefault()
  const confirmation = confirm("Are you sure you want to send this message? You will not ba able to send another message for 5 minutes!");
  if (!confirmation) {
    return
  }
  const message = document.querySelector(".message-input").value
  const response = await fetch("/.netlify/functions/sendMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamName: localStorage.getItem("teamName"),
      teamId: localStorage.getItem("teamId"),
      message: message,
    })
  })
  if (response.status === 200) {
    const data = await getChatData()
    document.getElementsByClassName("message-input")[0].value = ""
    loadMessages(data.messages)
  } else if (response.status === 429) {
    alert("You are sending messages too fast. Please wait 5 minutes, from your last message!")
  } else {
    alert("There was an error sending your message. Please try again later.")
  }

})