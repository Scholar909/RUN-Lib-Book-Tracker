// Hardcoded users: Add them here like {username: 'user1', password: 'pass123'}
const users = [
  { username: "admin", password: "adminpass" },
  { username: "john", password: "john123" },
  { username: "jane", password: "jane456" }
];

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  const userFound = users.find(user => user.username === username && user.password === password);

  if (userFound) {
    // Save login state
    localStorage.setItem("loggedInUser", username);
    window.location.href = "main.html"; // redirect to editable section
  } else {
    errorMsg.textContent = "Invalid username or password.";
  }
});