const form = document.querySelector("form");
const input = document.getElementById("input");
const contentdiv = document.getElementById("content");

const socket = io();

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const response = input.value;
  input.value = "";
  // fetch("http://localhost:3000", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     response,
  //   }),
  // }).then((res) => res.json());
  socket.emit("getNewData", response);
});

socket.on("receiveNewData", (msg) => {
  contentdiv.innerHTML = "";
  msg.forEach((message) => {
    contentdiv.insertAdjacentHTML(
      "afterbegin",
      `<div class="message">
          <div>
            ${message.message}
          </div>
          <div>
            ${message.time}
          </div>
       </div>`
    );
  });
});
