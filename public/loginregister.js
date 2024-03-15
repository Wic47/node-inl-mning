const loginForm = document.getElementById("login");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const registerForm = document.getElementById("register");
const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let hashedPassword = db.getLoginInfo(loginUsername.value);
  bcrypt.compare(loginPassword, hashedPassword, (err, result) => {
    if (result) {
    }
  });
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let info = {
    username: registerUsername.value,
    password: registerPassword.value,
  };
  fetch("http://localhost:3000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(info),
  }).then((res) => res.json());
});
