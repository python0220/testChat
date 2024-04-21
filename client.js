import userdata from "./script.js";

var socket = io("http://localhost:8000");
let UserDB = {}



const form = document.getElementsByClassName("send-container");
const messageInput = document.getElementsByClassName("messageInp");
const messagecontainer = document.querySelector(".msg-container");
const AddImage = document.getElementById("send-img");
let inputImageSrc = '';
var logined = false;
var UserId = '';
var UserMainIcon = ''

let inter = setInterval(() => {
  if (userdata.username !== undefined) {
    UserId = userdata.username;
    UserMainIcon = userdata.usericon;
    logined = true;
    socket.emit("new-user-joined", {UserId,UserMainIcon});
    clearInterval(inter)
  }else{
    logined = false;
    document.createElement('a').href = "./index.html".click();
  }
}, 100);

setInterval(() => {
  socket.on('checkdata', users=>{
    UserDB = users;
    
  })
  
}, 1000);









const append = (message, type, userid) => {
  if (logined === true)
{    var msgsound = new Audio("msgappear.mp3");
    
    const msgdiv = document.createElement("div");
    const mainmsg = document.createElement("div");
    const userData = document.createElement("div");
    mainmsg.innerText = message;
    mainmsg.classList.add("main-message");
    msgdiv.appendChild(mainmsg);
    
    if (type === 'recieved-msg' || type === 'send-msg'){
      if (userid !== ''){

        const icon = document.createElement('img');
        icon.src = UserMainIcon;
        icon.classList.add('usericon');
        msgdiv.appendChild(icon)
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
    }}

};



socket.on("user-joined", (data) => {
  append(`"${data.UserId}" joined the chat`, "user-joined", "");
});

socket.on("receive", (data) => {
  append(data.message, "recieved-msg", data.name);
});

socket.on("userLeft", (user) => {
  append(`"${user}" left the chat`, "disconnect-msg", "");
});

socket.on('private-msg',data => {
  append(data.message, "recieved-msg", `private: ${data.user}`);
})

socket.on('sendimg', data => {
  AppendImage(data)
})

form[0].addEventListener("submit", (e) => {
  e.preventDefault();
  if (messageInput[0].value[0] !== "@"){
    if (AddImage.files[0] !== undefined){
      inputImageSrc = URL.createObjectURL(AddImage.files[0])
      socket.emit('sendImage',{'src':inputImageSrc, 'id':UserId})
      AppendImage({'src':inputImageSrc, 'id':'me'})
      console.log(inputImageSrc)
      
    }
    if (messageInput[0].value !== ''){
      socket.emit("send", messageInput[0].value);
      append(messageInput[0].value, "send-msg", "me");
      messageInput[0].value = "";

    }
    
    
  }else{

    let inputdata = messageInput[0].value.split("@")[1]
    let msgstart = inputdata.indexOf(" ")    
    let ToSendUser = inputdata.slice(0,msgstart);
    let MessageToSend = inputdata.slice(msgstart+1, inputdata.length)

    socket.emit('private',{'user':ToSendUser,"message":MessageToSend})
    append(MessageToSend, "send-msg", `${ToSendUser}:me`);
    messageInput[0].value = "";

  
  
}

});




const AppendImage = (data) => {
  if (data.id !== 'me' && logined){
    let messagesound = new Audio('msgappear.mp3');
    messagesound.play();


  }
  if (logined){  
    let sendedimgcontainer = document.createElement("div");
    let sendedimg = document.createElement("img");
    let sendby = document.createElement("p");


    sendedimgcontainer.classList.add("sended-img-container");
    
    if (data.id !== 'me'){
      sendedimgcontainer.classList.add("sended-img-other");
    }else{
      sendedimgcontainer.classList.add("sended-img-me");
      
    }
    sendedimg.setAttribute('id', 'sended-image');;

    sendby.classList.add("sendby");

    sendedimg.src = data.src;
    sendby.innerText = `${data.id}`;
    sendedimgcontainer.appendChild(sendedimg);
    sendedimgcontainer.appendChild(sendby);
    messagecontainer.appendChild(sendedimgcontainer);
    inputImageSrc = ""
    AddImage.value = ''
    
  }


}


export {UserDB};