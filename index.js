
// const io = require('socket.io')(8000)

// const users = {
    
// };

// io.on('connection', socket => {
//     console.log('started')
//     socket.on('new-user-joined', name => {
//         users[socket.id] = name;
//         socket.broadcast.emit('user-joined', name);
//     })

//     socket.on('send' , message => {
//         socket.broadcast.emit('receive', {message: message, name: users[socket.id] })
//     })
// })
const express = require("express")
var app = express();
var server = app.listen(8000);
var io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
});





const users = {};

io.on('connection', socket => {
    console.log('A user connected');

    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
    });

    socket.on('disconnect', user =>{
        socket.broadcast.emit('userLeft', users[socket.id])
        delete users[socket.id];
    })
});

