//import libraries
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server);
const bodyParser = require('body-parser')
const mysql = require("mysql2");
const config = require('dotenv').config()

//connect to database
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT
});

//setup app
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))
var engines = require('consolidate')
app.engine('html', engines.hogan)
app.set('views', __dirname + '/views')

//display the home page
app.get('/', (req, res) => {
  res.render('index.html', {})
})

//display chat page
app.get('/chat', (req, res) => {
  res.render('chat.html', {})
})

//connect new user
io.on('connection', socket => {
  //send new user all chat messages from database
  connection.query("SELECT * FROM chathistory;", (err, res) => {
    //print error
    if (err) console.log(err)

    //send new chat to all connected users
    socket.emit('allChats', res)
  })

  //listen for new messages
  socket.on('newChat', newChat => {
    //add chat to database
    connection.query('INSERT INTO chathistory(chat, user_id) VALUES (?, ?);', [newChat, 1], (err) => {
      if (err) console.log(err);
    //send out new chat to connected users
    io.emit('newChattoUsers', newChat)
  })
})
})

//listen to server
server.listen(3000, () => {
  console.log('listening on *:3000')
})