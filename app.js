//import libraries
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server);
const sqlite3 = require('sqlite3')
const bodyParser = require('body-parser')

//setup app
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))
var engines = require('consolidate')
app.engine('html', engines.hogan)
app.set('views', __dirname + '/views')

//connect to database
let db = new sqlite3.Database('./chatlog.db', sqlite3.OPEN_READWRITE, err => {
  console.log(err)
})

//create table *comment out because only run once!*
//db.run("CREATE TABLE chatlog(chat TEXT)");

//display the home page
app.get('/', (req, res) => {
  res.render('index.html', {})
})

//display chat page
app.post('/chat', (req, res) => {
    res.render('chat.html', {})
})

//connect new user
io.on('connection', socket => {
  //send new user all chat messages from database
  db.all('SELECT * FROM chatlog', function (err, result) {
    //print error
    if (err) console.log(err)

    //send new chat to all connected users
    socket.emit('allChats', result)
  })

  //listen for new messages
  socket.on('newChat', newChat => {
    //add chat to database
    db.run('INSERT INTO chatlog VALUES (?)', newChat)

    //send out new chat to connected users
    io.emit('newChattoUsers', newChat)
  })
})

//listen to server
server.listen(3000, () => {
  console.log('listening on *:3000')
})

console.log('Web Server is listening at port ' + (process.env.port || 3000))
