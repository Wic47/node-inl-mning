const loginForm = document.getElementById("login");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const registerForm = document.getElementById("register");
const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  fetch(`http://localhost:3000/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: loginUsername.value }),
  }).then((res) => {
    console.log(res);
  });
  // // bcrypt.compare(loginPassword, hashedPassword, (err, result) => {
  // //   if (result) {
  // //     window.location = "./main";
  // //   } else {
  // //     console.log(err);
  // //   }
  // });
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
  }).then((res) => {
    res.json();
    if (res.status === 200) {
      window.location = "./main";
    }
  });
});
