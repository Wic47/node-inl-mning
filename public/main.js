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
const newPostButton = document.getElementById("new");
const oldPostsButton = document.getElementById("posts");
const blurDiv = document.getElementById("blur");
const popups = document.getElementsByClassName("popup");
const form = document.getElementById("form");
const title = document.getElementById("title");
const bodyText = document.getElementById("body-text");
const posts = document.getElementsByClassName("oldPosts");
const comments = document.getElementsByClassName("comments");
const postForm = document.getElementsByClassName("postForm");
const commentForm = document.getElementsByClassName("commentForm");
const postContainer = document.getElementById("post-container");
const body = document.body;

let socket = io();

newPostButton.addEventListener("click", (e) => {
  blurDiv.style.display = "flex";
  popups[0].style.display = "flex";
  body.style.overflowY = "hidden";
});

oldPostsButton.addEventListener("click", () => {
  blurDiv.style.display = "flex";
  popups[1].style.display = "flex";
  body.style.overflowY = "hidden";
});

blurDiv.addEventListener("click", (e) => {
  blurDiv.style.display = "none";
  popups[0].style.display = "none";
  popups[1].style.display = "none";
  body.style.overflowY = "auto";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (title.value.length <= 80 && bodyText.value.length <= 3000) {
    let post = {
      title: title.value,
      bodyText: bodyText.value,
    };

    fetch(`http://localhost:3000/addPost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(post),
    });
    blurDiv.style.display = "none";
    popups[0].style.display = "none";
    body.style.overflowY = "auto";
    title.value = "";
    bodyText.value = "";
  }
});

title.addEventListener("input", () => {
  if (title.value.length > 80) {
    title.style.color = "#FF0000";
  } else {
    title.style.color = "white";
  }
});

bodyText.addEventListener("input", () => {
  if (bodyText.value.length > 3000) {
    bodyText.style.color = "#FF0000";
  } else {
    bodyText.style.color = "white";
  }
});

for (let i = 0; i < postForm.length; i++) {
  const e = postForm[i];
  const id = posts[i];
  e.addEventListener("submit", (e) => {
    e.preventDefault();
    fetch("http://localhost:3000/deletePost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        postid: id.value,
        token: sessionStorage.getItem("token"),
      }),
    });
    id.parentNode.parentNode.remove();
  });
}

for (let i = 0; i < commentForm.length; i++) {
  const e = commentForm[i];
  const id = comments[i];
  e.addEventListener("submit", (e) => {
    e.preventDefault();
    fetch("http://localhost:3000/deleteComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        commentid: id.value,
        token: sessionStorage.getItem("token"),
      }),
    });
    id.parentNode.parentNode.remove();
  });
}

socket.on("refreshPosts", (posts) => {
  postContainer.innerHTML = "";
  posts = posts.reverse();
  for (let i = 0; i < posts.length; i++) {
    const e = posts[i];
    postContainer.insertAdjacentHTML(
      "afterbegin",
      `
    <a href="/main/${e.postid}">
    <div class="post">
      <div>
        <div>
          ${e.username}
          •
          ${e.date}
        </div>
      </div>
      <div>
        ${e.title}
      </div>
      <div>
        ${e.bodyText}
      </div>
    </div>
  </a>
    `
    );
  }
});
