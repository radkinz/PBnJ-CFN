//import libraries
const express = require('express')
const mustache = require('mustache-express')
const fs = require('fs').promises
const bcrypt = require('bcrypt')
const http = require('http')
const app = express()
const server = http.createServer(app)
const {
    Server
} = require('socket.io')
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
app.use(
    bodyParser.urlencoded({
        extended: true
    })
)
app.set("views", __dirname + "/views")
app.set('view engine', 'mustache')
app.engine('mustache', mustache())
app.use(bodyParser.json())
app.use(express.static('public'))
var engines = require('consolidate')
const {
    nextTick
} = require('process')
app.engine('html', engines.hogan)
app.set('views', __dirname + '/views')

//display the home page
app.get('/', (req, res) => {
    res.render('index.html')
})

app.get('/AdminMenu', (req, res) => {
    res.render('AdminMenu.html')
})

//display chat page
app.get('/chat', (req, res) => {
    res.render('chat.html')
})

//display authentication page
app.get('/Auth', function(req, res) {
    res.render('Auth.html')
})

//display account delete page
app.get('/AccountDelete', function(req, res) {
    let usernames = []
    connection.query('SELECT username FROM userinfo;', (err, result) => {
        for (let i = 0; i < result.length; i++) {
            usernames.push({
                Usernames: Object.values(result[i])
            })
        }
        res.render('deleteUser', {
            Profiles: usernames
        })
    })
})

//display main menu
app.get('/menu', function(req, res) {
    res.render('menu.html')
})

app.get('/AccountCreation', function(req, res) {
    res.render('createUser.html')
})

//connect new user
io.on('connection', socket => {

    socket.on('allChats', (chatroomId, nxtCmd) => {
        console.log(chatroomId)
            //send new user all chat messages from database
        connection.query(
            'SELECT * FROM chathistory WHERE chatroomid = ?;', [chatroomId],
            (err, res) => {
                //print error
                if (err) console.log(err)

                //send new chat to all connected users
                socket.emit(nxtCmd, res)
            }
        )
    })

    socket.on('grabUserIds', () => {
        connection.query(
            'SELECT chathistory.userid, max(chathistory.id) AS "max_id", userinfo.admin, userinfo.username FROM chathistory INNER JOIN userinfo ON chathistory.userid = userinfo.userid WHERE userinfo.admin = 0 GROUP BY userid;',
            (err, ids) => {
                //print error
                if (err) console.log(err)

                ids = ids.sort((a, b) => (a.max_id < b.max_id ? 1 : -1))

                //send new chat to all connected users

                socket.emit('handleUserIds', ids)
            }
        )
    })

    socket.on('newAccountInSQL', (newUsername, newPassword, adminBoolean) => {
        bcrypt.genSalt(10, function(err, Salt) {
            bcrypt.hash(newPassword, Salt, function(err, hash) {
                if (err) {
                    return console.log('\n Cannot encrypt')
                }

                hashedPassword = hash
                console.log(newUsername, hashedPassword, adminBoolean)
                    // ? = prepared statement
                connection.query(
                    'INSERT INTO userinfo (username,hashword,admin) VALUES (?,?,?)', [newUsername, hash, adminBoolean],
                    err => {
                        if (err) throw err

                    }
                )
            })
        })
    })

    socket.on('removeAccountFromDB', (deletedUser) => {
        connection.query('DELETE FROM userinfo WHERE username = (?)', deletedUser, err => {
            if (err) throw err
            console.log('User successfully deleted')
        })
    })

    //login
    socket.on('login', (username, passwordd) => {
        console.log(username, passwordd)
        let UN, password, hashedPassword
        UN = username + ''
        password = passwordd + ''
        connection.query(
            'SELECT hashword FROM userinfo WHERE username = (?)', [UN],
            (err, result) => {
                if (err) throw err
                if (result.length == 0) {
                    // res.render('index.html', {})
                    socket.emit('loginStatus', false)
                } else {
                    hashedPassword = result[0]['hashword']
                        //where the guessed password is compared
                    bcrypt.compare(password, hashedPassword, function(err, isMatch) {
                        if (err) console.log(err)

                        // Comparing the original password to
                        // encrypted password
                        if (isMatch) {

                            //send userid back for session storage
                            //match username to userid
                            connection.query(
                                'SELECT userid, admin FROM userinfo WHERE username=(?);', [UN],
                                (err, res) => {
                                    //print error
                                    if (err) console.log(err)

                                    //send id to client
                                    socket.emit('sessionStorage', res[0], response => {
                                        //send true status

                                        if (res[0].admin !== 1) {
                                            socket.emit('loginStatus', true, 0)
                                        } else {
                                            socket.emit('loginStatus', true, 1)
                                        }
                                    })
                                }
                            )
                        }

                        if (!isMatch) {
                            // If password doesn't match the following
                            // message will be sent
                            socket.emit('loginStatus', false)
                        }
                    })
                }
            }
        )
    })

    //listen for new messages
    socket.on('newChat', (newChat, userid, time, chatroomid) => {
        //add chat to database
        connection.query(
            'INSERT INTO chathistory(chat, userid, time, chatroomid) VALUES (?, ?, ?, ?);', [newChat, userid, time, chatroomid],
            err => {
                if (err) console.log(err)
                connection.query(
                    'SELECT username from userinfo WHERE userid = ?', [userid],
                    (err, data) => {
                        if (err) console.log(err)
                            //send out new chat to connected users

                        io.emit(
                            'newChattoUsers',
                            newChat,
                            time,
                            userid,
                            chatroomid,
                            data[0].username
                        )
                    }
                )
                //send out new chat to connected users
                //io.emit('newChattoUsers', newChat, time, userid, chatroomid, username)
            }
        )
    })
})

//listen to server
server.listen(3000, () => {
    console.log('listening on *:3000')
})