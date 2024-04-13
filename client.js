const socket = io('http://localhost:8000');

const form = document.getElementsByClassName('send-container')
const messageInput = document.getElementsByClassName('messageInp')
const messagecontainer = document.querySelector(".msg-container")
const msgsound = new Audio('msgappear.mp3')
const append = (message, type, userid)=> {
    const msgdiv = document.createElement("div")
    const mainmsg = document.createElement("div")
    const userData = document.createElement("div")
    mainmsg.innerText = message
    mainmsg.classList.add("main-message")
    msgdiv.appendChild(mainmsg)

    userData.innerText = userid;
    userData.classList.add("user-time")
    msgdiv.appendChild(userData)
    msgdiv.classList.add("msg")
    msgdiv.classList.add(type)
    messagecontainer.appendChild(msgdiv)
}

const UserId = prompt ("Enter your name to join");
socket.emit('new-user-joined',UserId)



socket.on('user-joined', name => {
    append(`${name} joined the chat`, "user-joined","")
    msgsound.play()
})

socket.on('receive', data => {
    append(data.message, "recieved-msg",data.name)
    msgsound.play()
})
console.log(form[0])
form[0].addEventListener('submit', (e) =>{
    e.preventDefault()
    socket.emit("send", messageInput[0].value)
    append(messageInput[0].value,"send-msg",'me')
    messageInput[0].value = ""

})

