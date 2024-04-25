const loginForm = document.getElementById("login");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const registerForm = document.getElementById("register");
const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let loginInfo = {
    username: loginUsername.value,
    password: loginPassword.value,
  };
  fetch(`http://localhost:3000`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginInfo),
  })
    .then((res) => res.json())
    .then((token) => {
      sessionStorage.setItem("token", token);
      window.location = "./main";
    });
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let registerInfo = {
    usernameR: registerUsername.value,
    passwordR: registerPassword.value,
  };
  fetch("http://localhost:3000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerInfo),
  }).then((res) => {
    res.json();
    if (res.status === 200) {
      window.location = "./main";
    }
  });
});
