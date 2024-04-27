import { UserDB } from "./client.js";

// variable to store html tag
let username = document.getElementById("username");
let password = document.getElementById("password");
let usericon = document.getElementById("usericon");
let loginform = document.getElementById("loginform");
let app = document.getElementsByClassName("container")[0];
let loginpage = document.getElementsByClassName("Login")[0];

// var to store user data
let userdata = {};

let canLogin = false; // var to authenticate the user can login or not
if (loginform) {
  loginform.addEventListener("submit", (e) => {
    e.preventDefault();

    // autenticantion
    if (Object.keys(UserDB).length !== 0) {
      for (const key in UserDB) {
        // check if ther user is already exists or not
        if (UserDB[key] === username.value) {
          alert("username already exists");
          const a = document.createElement("a");
          a.href = "./index.html";
          a.click();
          canLogin = false;
        } else {
          canLogin = true;
        }
      }
    } else {
      canLogin = true;
    }

    // making a condition which alert the user when he left the any field empty
    if (username.value === "" || password.value === "" || !usericon) {
      alert("Please fill the form");
    } else {
      if (canLogin) {
        userdata["username"] = username.value;
        userdata["password"] = password.value;
        userdata["usericon"] = URL.createObjectURL(usericon.files[0]);
        app.classList.add("logined");
        loginpage.classList.add("logined");
      }
    }
  });
}

export default userdata; // export the user data so it user data can be used by client file
