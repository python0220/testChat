import { UserDB } from "./client.js";

let username = document.getElementById("username");
let password = document.getElementById("password");
let usericon = document.getElementById("usericon");
let loginform = document.getElementById("loginform");
let app = document.getElementsByClassName("container")[0];
let loginpage = document.getElementsByClassName("Login")[0];
// const socket = io("http://localhost:8000");
let userdata = {};

let canLogin = false;
if (loginform) {
  loginform.addEventListener("submit", (e) => {
    console.log(UserDB);
    e.preventDefault();

    // autenticantion
    if (Object.keys(UserDB).length !== 0) {
      for (const key in UserDB) {
        if (UserDB[key] === username.value) {
          console.log(UserDB[key], username.value);
          alert("username already exists");
          const a = document.createElement("a");
          a.href = "./index.html";
          a.click();
          canLogin = false;
        } else {
          canLogin = true;
        }
      }
    }else{
        canLogin = true;
    }

    
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



export default userdata;
