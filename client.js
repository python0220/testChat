import userdata from "./script.js"; 


var socket = io("https://112m1xb2-8000.inc1.devtunnels.ms/"); // connecting with socket server

// dict to store user data to send the data on script file
let UserDB = {};


// var 
const form = document.getElementsByClassName("send-container");
const messageInput = document.getElementsByClassName("messageInp");
const messagecontainer = document.querySelector(".msg-container");
const AddImage = document.getElementById("send-img");
let SendedImageContainer = document.getElementById("sended-image");
let inputImageSrc = "";
var logined = false;
var UserId = "";
var UserMainIcon = "";

// var that store the min bytes of the image in which it will be sliced and stored in the server
var CHUNK_SIZE = 700 * 1024;


// interval for checking the userlogin
let inter = setInterval(() => {
  if (userdata.username !== undefined) {
    UserId = userdata.username; // username of the user
    UserMainIcon = userdata.usericon; // password enter by the user
    logined = true; // wheater user has logged in or not

    socket.emit("new-user-joined", { UserId, UserMainIcon }); // emit the new user has joined on server 

    clearInterval(inter); // as the user joined terminate the interval
  }
}, 100);


// interval to update the userdata by getting the all users data from the server
setInterval(() => {
  socket.on("checkdata", (users) => {
    UserDB = users;
  });
}, 1000);


// function to send the message to other users
const append = (message, type, userid) => {
  if (logined === true) {
    var msgsound = new Audio("msgappear.mp3");

    const msgdiv = document.createElement("div");
    const mainmsg = document.createElement("div");
    const userData = document.createElement("div");
    mainmsg.innerText = message;
    mainmsg.classList.add("main-message");
    msgdiv.appendChild(mainmsg);

    if (type === "recieved-msg" || type === "send-msg") {
      if (userid !== "") {
        const icon = document.createElement("img");
        icon.src = UserMainIcon;
        icon.classList.add("usericon");
        msgdiv.appendChild(icon);
      }
    }

    userData.innerText = userid;
    userData.classList.add("user-time");
    msgdiv.appendChild(userData);
    msgdiv.classList.add("msg");
    msgdiv.classList.add(type);
    messagecontainer.appendChild(msgdiv);

    if (type === "user-joined" || type === "recieved-msg") {
      msgsound.play().catch(() => {
        console.log("error occurs while playing the audio");
      });
    }
  }
};

// getting event from server so we can tell user that other user has joined
socket.on("user-joined", (data) => {
  append(`"${data.UserId}" joined the chat`, "user-joined", "");
});

// getting event from server to receive and add message on user screen
socket.on("receive", (data) => {
  append(data.message, "recieved-msg", data.name);
});

// getting event from server to tell user that who has left the chat
socket.on("userLeft", (user) => {
  append(`"${user}" left the chat`, "disconnect-msg", "");
});

// getting event from server to recieve the private message
socket.on("private-msg", (data) => {
  append(data.message, "recieved-msg", `private: ${data.user}`);
});


// socket event to display the recieved image on user screen
socket.on("sendimg", (data) => {
  let url = new Blob([data.img],{type: "image/png"});  
  let newurl = URL.createObjectURL(url);
  
  AppendImage({ src: newurl, id: data.username });
 
});

// adding the submit event listener to form 
form[0].addEventListener("submit", (e) => {
  e.preventDefault();

  // condition to send the message to all joined users
  if (messageInput[0].value[0] !== "@") {
    if (AddImage.files[0] !== undefined) {
      // test
      let offset = 0;
      let file = AddImage.files[0];
      
      readNextChunk(file, offset);
      
      // for the user
      inputImageSrc = URL.createObjectURL(file);
      AppendImage({ src: inputImageSrc, id: "me" });
      
    }
    if (messageInput[0].value !== "") {
      socket.emit("send", messageInput[0].value);
      append(messageInput[0].value, "send-msg", "me");
      messageInput[0].value = "";
    }
  } 
  // condition to send the message to a specific user
  else {
    let inputdata = messageInput[0].value.split("@")[1];
    let msgstart = inputdata.indexOf(" ");
    let ToSendUser = inputdata.slice(0, msgstart);
    let MessageToSend = inputdata.slice(msgstart + 1, inputdata.length);

    socket.emit("private", { user: ToSendUser, message: MessageToSend });
    append(MessageToSend, "send-msg", `${ToSendUser}:me`);
    messageInput[0].value = "";
  }
});


// function to add recieve or sended image or other user and main user screen respectively 
const AppendImage = (data) => {
  if (data.id !== "me" && logined) {
    let messagesound = new Audio("msgappear.mp3");
    messagesound.play();
  }
  if (logined) {
    let sendedimgcontainer = document.createElement("div");
    let sendedimg = document.createElement("img");
    let sendby = document.createElement("p");

    sendedimgcontainer.classList.add("sended-img-container");

    if (data.id !== "me") {
      sendedimgcontainer.classList.add("sended-img-other");
    } else {
      sendedimgcontainer.classList.add("sended-img-me");
    }
    sendedimg.setAttribute("id", "sended-image");

    sendby.classList.add("sendby");

    sendedimg.src = data.src;
    sendby.innerText = `${data.id}`;
    sendedimgcontainer.appendChild(sendedimg);
    sendedimgcontainer.appendChild(sendby);
    messagecontainer.appendChild(sendedimgcontainer);
    inputImageSrc = "";
    AddImage.value = "";
  }
};

// Function to read and send the next chunk of the file
function readNextChunk(imgfile, offset) {
  console.log(imgfile.size)
  if (offset < imgfile.size) {
    const chunkSize = Math.min(CHUNK_SIZE, imgfile.size - offset);
    console.log('chunksize => : <= ',chunkSize)
    const chunk = imgfile.slice(offset, offset + chunkSize);
    const reader = new FileReader();

    reader.onloadend = function () {
      if (reader.readyState === FileReader.DONE) {
        const chunkData = reader.result.split(",")[1];
        socket.emit('imageDataChunk', chunkData);
 
        offset += chunkSize;

        if (offset < imgfile.size) {
          readNextChunk(imgfile, offset);
        } else {
          let currentDate = new Date()
          let imgId = `${UserId} : ${currentDate.getHours()} : ${currentDate.getMinutes()} : ${currentDate.getSeconds()}`

          socket.emit('sendImage',{id:imgId, Uname: UserId });
          console.log("File upload complete");
        }
      }
    };

    reader.readAsDataURL(chunk);
  }
}
export { UserDB };
