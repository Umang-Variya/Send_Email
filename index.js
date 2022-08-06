const express = require('express')
var cors = require('cors')
const db = require('./app/config/db')
const app = express()
const bodyParser = require('body-parser')
const router = require('./app/routes/index')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const Chat = require("./app/model/chat");
const Noti = require('./app/model/notification')
const connect = require("./app/config/db");
var localStorage = require('node-localstorage').LocalStorage;


const {
  createServer
} = require("http");
const {
  Server
} = require("socket.io");
const {
  User
} = require('./app/model/user')
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/username.html');
});

app.get('/username', (req, res) => {
  res.sendFile(__dirname + '/username.html');
});

io.on('connection', async (socket) => {

  var room;

  socket.on("join", (data) => {

    room = data

    socket.join(data)

    console.log(`User Name ${socket.username} joined ${data} room`)
    let updated = `User Name ${socket.username} joined ${data} room`

    connect.then(db => {
      let UpdateMsg = new Noti({

        update: updated,
        sender: socket.username,

      });
      UpdateMsg.save();
    });
  })

  socket.on('disconnect', () => {
    console.log('User disconnected - Username: ' + socket.username);
  });

  socket.on('new user', async (usr) => {

    socket.username = usr;

    console.log('User connected - Username: ' + socket.username);

    User.findOne({

      firstName: socket.username

    }, function (err, user) {
      if (err) throw err;
      if (user === null) {

        socket.disconnect()

      } else {
        socket.on('chat message', (msg) => {

          io.to(room).emit('chat message', {
            message: msg,
            user: socket.username
          });

          connect.then(db => {
            console.log("New Message!!!!");

            let chatMessage = new Chat({

              ref_id: user._id,
              message: msg,
              sender: socket.username,
              room: room

            });

            chatMessage.save();

          });
        });
      }
    });
  });
});

app.set('view engine', 'ejs')
app.disable('x-powered-by');
app.use(cors())
app.use(express.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 500000
}))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', router)

console.log("========here");

httpServer.listen(3001, () => console.log("Server start..."))