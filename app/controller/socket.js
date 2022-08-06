const express = require('express')
const app = express()
const {
    createServer
} = require("http");
const {
    Server
} = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});
app.set('view engine', 'ejs')

const socketIo = function (req, res) {
    res.sendFile(__dirname + '/home.html');
}

io.on('connection', (socket) => {
    socket.on('chat message', msg => {
        io.emit('chat message', msg);
    });
});

module.exports = {
    socketIo
}