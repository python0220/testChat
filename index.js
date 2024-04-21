const express = require("express")
const path = require("path");
var app = express();
var server = app.listen(8000);
var io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});


function getKeyByValue(object, value) {
    for (let prop in object) {
        if (object.hasOwnProperty(prop)) {
            if (object[prop] === value)
                return prop;
        }
    }
}

const users = {};

io.on('connection', socket => {
    
    console.log('A user connected');
    setInterval(() => {
        socket.emit('checkdata', users)
    }, 1000);
    socket.on('sendImage',(data) => {
        socket.broadcast.emit('sendimg', data)
    })

    socket.on('new-user-joined', data => {
        users[socket.id] = data.UserId;
        socket.broadcast.emit('user-joined', data);
        console.log(users[socket.id], 'joined');
    });
    
    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
    });
    
    socket.on('disconnect', user =>{
        if (users[socket.id] !=  null){
            socket.broadcast.emit('userLeft', users[socket.id])
            delete users[socket.id];
            console.log(users[socket.id], 'disconnected');

        }
    })

    socket.on('private', data => {
        let key = getKeyByValue(users,String(data.user));
        io.to(key).emit('private-msg',data );
    
    })

});


