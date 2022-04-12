//import libraries
const express = require('express')
const fs = require('fs').promises
const bcrypt = require('bcrypt')
const http = require('http')
const app = express()
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const bodyParser = require('body-parser')
const mysql = require('mysql2')
const config = require('dotenv').config()

//connect to database
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT
})

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

//display authentication page
app.get('/Auth', function (req, res) {
  res.render('Auth.html', {})
})

//display main menu
app.get('/ButtonMenu', function (req, res) {
  res.render('buttonmenu.html', {})
})

//login
app.post('/login', (req, res) => {
  console.log(req.body.username, req.body.password)
  let UN, password, hashedPassword
  UN = req.body.username + ''
  password = req.body.password
  connection.query(
    'SELECT hashword FROM userinfo WHERE username = (?)',
    [UN],
    (err, result) => {
      if (err) throw err
      console.log(result)
      if (result.length == 0) {
        res.render('index.html', {})
      } else {
        hashedPassword = result[0]['hashword']

        console.log(hashedPassword)
        //where the guessed password is compared
        bcrypt.compare(password, hashedPassword, function (err, isMatch) {
          if (err) console.log(err)
          console.log(isMatch)

          // Comparing the original password to
          // encrypted password
          if (isMatch) {
            console.log('Encrypted password is: ', password)
            console.log('Decrypted password is: ', hashedPassword)
            res.render('buttonmenu.html', {})
          }

          if (!isMatch) {
            // If password doesn't match the following
            // message will be sent
            console.log(hashedPassword + ' is not encryption of ' + password)
            res.render('index.html', {})
          }
        })
      }
    }
  )
})

//connect new user
io.on('connection', socket => {
  //send new user all chat messages from database
  connection.query('SELECT * FROM chathistory;', (err, res) => {
    //print error
    if (err) console.log(err)

    //send new chat to all connected users
    socket.emit('allChats', res)
  })

  //listen for new messages
  socket.on('newChat', newChat => {
    //add chat to database
    connection.query(
      'INSERT INTO chathistory(chat, userid) VALUES (?, ?);',
      [newChat, 1],
      err => {
        if (err) console.log(err)
        //send out new chat to connected users
        io.emit('newChattoUsers', newChat)
      }
    )
  })
})

//listen to server
server.listen(3000, () => {
  console.log('listening on *:3000')
})
