 const clientCredentials = {
  client1: { password: "pass123", hub: "HUB 1", checkpost: "Checkpost A" },
  client2: { password: "client456", hub: "HUB 2", checkpost: "Checkpost B" },
};

function loginClient() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("loginMsg");

  if (clientCredentials[username] && clientCredentials[username].password === password) {
    localStorage.setItem("loggedInClient", username);
    localStorage.setItem("hub", clientCredentials[username].hub);
    localStorage.setItem("checkpost", clientCredentials[username].checkpost);
    window.location.href = "employee.html";
  } else {
    msg.innerText = "❌ Invalid username or password";
    msg.style.color = "red";
  }
}
