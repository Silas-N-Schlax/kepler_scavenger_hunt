document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.length === 0) {
    alert("This website is for a private event, you are not authorized to view this page. Please leave the QR code where it is, unless you are currently not in May of an year!");
    window.location.href = "https://www.google.com"; 
  }
});