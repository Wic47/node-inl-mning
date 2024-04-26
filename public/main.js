if (sessionStorage.getItem("token") != null) {
  fetch("http://localhost:3000/auth", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((decoded) => {
      console.log(decoded);
    });
}
