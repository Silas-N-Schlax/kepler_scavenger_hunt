document.addEventListener("DOMContentLoaded", async function () {
  console.log("Loading color scheme...")
  const response = await fetch("/.netlify/functions/getColorScheme", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const colors = await response.json();
  if (colors.status === "success") {
    colors.schemes.forEach((scheme) => { 
      document.documentElement.style.setProperty(scheme.key, scheme.color); 
    });
  } else {
    console.error("Failed to load color scheme data.");
  }
});