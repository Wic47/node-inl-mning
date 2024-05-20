if (sessionStorage.getItem("token") != null) {
  fetch("http://localhost:3000/auth", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  }).then((res) =>
    res.json().then((decoded) => {
      if (decoded == null || decoded == 401) {
        console.log(decoded);
        window.location = "./";
      }
    })
  );
} else {
  window.location = "./";
}

let socket = io();

const comment = document.getElementById("comment");
const from = document.getElementById("form");
const commentContainer = document.getElementById("comment-container");
const submit = document.getElementById("submit");

let maxHeight = 0.3 * window.innerHeight;

comment.addEventListener("input", resize);

window.addEventListener("resize", resize);

function resize() {
  if (comment.value.length > 3000) {
    comment.style.color = "#FF0000";
  } else {
    comment.style.color = "white";
  }
  maxHeight = 0.3 * window.innerHeight;
  comment.style.height = "auto";
  if (comment.scrollHeight <= maxHeight) {
    comment.style.height = comment.scrollHeight + "px";
    submit.style.height = comment.style.height;
  } else {
    comment.style.height = maxHeight + "px";
    submit.style.height = comment.style.height;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (comment.value.length < 3000) {
    let commentInfo = { bodyText: comment.value };
    fetch("http://localhost:3000/addComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(commentInfo),
    });
    comment.value = "";
  }
});

socket.on("refreshComments", (comments) => {
  commentContainer.innerHTML = "";
  comments = comments.reverse();
  for (let i = 0; i < comments.length; i++) {
    const e = comments[i];
    commentContainer.insertAdjacentHTML(
      "afterbegin",
      `
    <div class="comment">
      <div>
        ${e.user}
        •
        ${e.date}
      </div>
      ${e.bodyText}
    </div>
    `
    );
  }
});
