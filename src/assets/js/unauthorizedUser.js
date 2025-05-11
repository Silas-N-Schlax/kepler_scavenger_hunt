document.addEventListener("DOMContentLoaded", () => {
   const urlParams = new URLSearchParams(window.location.search);
   const teamId = urlParams.get("teamId");
    const key = urlParams.get("key");
    const token = urlParams.get("token");
    const teamName = urlParams.get("teamName");

  if (teamId && key && token && teamName) {
    return;
  }else if (localStorage.length === 0) {
    alert("This website is for a private event, you are not authorized to view this page. Please leave the QR code where it is, unless you are currently not in May of an year!");
    window.location.href = "https://www.google.com"; 
  }
});