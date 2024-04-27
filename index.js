const express = require("express");
const path = require("path");
const mysql = require("mysql");
var app = express();
var server = app.listen(8000);
var io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pygame@1234",
  database: "chatapp",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

function getKeyByValue(object, value) {
  for (let prop in object) {
    if (object.hasOwnProperty(prop)) {
      if (object[prop] === value) return prop;
    }
  }
}

const users = {};

io.on("connection", (socket) => {
  let imageData = Buffer.alloc(0)

  console.log("A user connected");
  // check for the update in users data
  setInterval(() => {
    socket.emit("checkdata", users);
  }, 1000);


  socket.on("sendImage",(data) => {
    // uploading the iamge on sql server 
      const sql = "INSERT INTO chatable (id,username,img) VALUES (?,?,?)";
      db.query(sql, [data.id,data.Uname,imageData], (err, result) => {
        if (err) throw err;
        console.log("image is uploading");
        
      });
      
      // receving data from sql server
      const sqltable = "SELECT id, username, img FROM chatable where id = ? and username = ?";
      db.query(sqltable,[data.id,data.Uname] ,(err, result) => {
        if (err) { 
          console.error("Error accurs");
          return;
        };
        
        console.log(result[0])
        socket.broadcast.emit("sendimg", result[0]);
      })
      imageData = Buffer.alloc(0)
    });
    
  socket.on('imageDataChunk', (dataChunk) => {
    // Convert received chunk data to Buffer and append it to the imageData buffer
    const chunkData = Buffer.from(dataChunk, 'base64');
    imageData = Buffer.concat([imageData, chunkData]);
});
  socket.on("new-user-joined", (data) => {
    users[socket.id] = data.UserId;
    socket.broadcast.emit("user-joined", data);
    console.log(users[socket.id], "joined");
  });

  socket.on("send", (message) => {
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id],
    });
  });

  socket.on("disconnect", (user) => {
    if (users[socket.id] != null) {
      socket.broadcast.emit("userLeft", users[socket.id]);
      delete users[socket.id];
      console.log(users[socket.id], "disconnected");
    }
  });

  socket.on("private", (data) => {
    let key = getKeyByValue(users, String(data.user));
    io.to(key).emit("private-msg", data);
  });
});
