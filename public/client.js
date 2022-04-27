const socket = io()
console.log('hello')
sessionStorage.setItem('chatroom', 0)

//store session info
socket.on('sessionStorage', (res, callback) => {
  //set session storage values
  sessionStorage.setItem('userid', res.userid)
  sessionStorage.setItem('admin', res.admin)

  //create chatroom objs
  let chatrooms = []
  //set home page
  chatrooms.push(0)
  if (res.admin == '1') {
    //grab all user ids
    socket.emit('grabUserIds')
    socket.on('handleUserIds', data => {
      console.log(data)
      for (let i = 0; i < data.length; i++) {
        chatrooms.push(data[i].userid)
      }
      //store chatroom listing
      chatrooms = JSON.stringify(chatrooms)
      sessionStorage.setItem('chatroomList', chatrooms)
      callback('done!')
    })
  } else {
    chatrooms.push(res.userid)
    chatrooms = JSON.stringify(chatrooms)
    sessionStorage.setItem('chatroomList', chatrooms)
    callback('done!')
  }
})

//display all chatrooms
function DisplayAllChatrooms () {
  let chatrooms = JSON.parse(sessionStorage.getItem('chatroomList'))

  //add homepage
  $('.ex1').append(
    '<button class="chatroombutton" id="' +
      0 +
      '" onClick="reply_click(' +
      0 +
      ')">Bulletin Board</button>'
  )
if (sessionStorage.getItem('admin') == '1') {
  for (let i = 1; i < chatrooms.length; i++) {
    $('.ex1').append(
      '<button class="chatroombutton" id="' +
        chatrooms[i] +
        '" onClick="reply_click(' +
        chatrooms[i] +
        ')"> User: ' +
        chatrooms[i] +
        '</button>'
    )
  }
} else {
  $('.ex1').append(
    '<button class="chatroombutton" id="' +
      chatrooms[1] +
      '" onClick="reply_click(' +
      chatrooms[1] +
      ')"> Your private messages with PBnJ </button>'
  )
}

}

//grab all chats
getAllChats()
function getAllChats () {
  socket.emit('allChats', sessionStorage.getItem('chatroom'))
}

socket.on('DisplayallChats', chats => {
  console.log(chats)
  console.log(sessionStorage.getItem('chatroomList'), 'fsdf')

  //delete chats to start
  $('.ex1').html(' ')
  $('.ex2').html(' ')

  //display chatroom
  DisplayAllChatrooms()

  //display chat array
  for (let i = 0; i < chats.length; i++) {
    $('.ex2').append(
      '<div class="container darker"><img src="" alt="Avatar" class="right" style="width:100%;" /><p>' +
        chats[i].chat +
        '</p><span class="time-left">' +
        chats[i].time +
        '</span></div>'
    )
  }

  //hide input
  let status = sessionStorage.getItem('admin')
  let chatroomID = sessionStorage.getItem('chatroom')

  if (status !== '1' && chatroomID == '0') {
    $('#messageinpoott').hide()
  } else {
    $('#messageinpoott').show()
  }

  $('.ex2').animate(
    {
      scrollTop: $('.ex2').prop('scrollHeight')
    },
    1200
  )
})

//check user login status
socket.on('loginStatus', status => {
  if (status) {
    window.location = '/ButtonMenu'
  } else {
    alert('Incorrect username or password. Please try again.')
  }
})

//grab chatroom id
function reply_click (clicked_id) {
  sessionStorage.setItem('chatroom', clicked_id)
  getAllChats()
}

$('#chast2').click(event => {
  let userID = sessionStorage.getItem('userid')
  console.log(this)
  //change chatroom id to user id
  sessionStorage.setItem('chatroom', userID)

  //get new chats
  getAllChats()
})

//restore chatroom 0
$('#chast1').click(event => {
  sessionStorage.setItem('chatroom', 0)

  //get new chats
  getAllChats()
})

//send new chats when button is clicked
$('#sned_butt').click(event => {
    //prevent default refresh page
    event.preventDefault()

    //send chat from input to server
    let userid = sessionStorage.getItem('userid')

    let date_ob = new Date()

    // current date
    // adjust 0 before single digit date
    let date = ('0' + date_ob.getDate()).slice(-2)

    // current month
    let month = ('0' + (date_ob.getMonth() + 1)).slice(-2)

    // current year
    let year = date_ob.getFullYear()

    // current hours
    let hours = date_ob.getHours()

    // current minutes
    let minutes = ('0' + (date_ob.getMinutes() + 1)).slice(-2)

  let finalTime = hours + ':' + minutes + ' ' + month + '-' + date + '-' + year

  let chatroomid = sessionStorage.getItem('chatroom')

  socket.emit(
    'newChat',
    $('#messageinpoot').val(),
    userid,
    finalTime,
    chatroomid
  )
})

//creating a new account (username, password, admin status)


//when login button click send to server
$('#Login').click(event => {
    //prevent default refresh page
    event.preventDefault()
    socket.emit('login', $('#usernameInput').val(), $('#passwordInput').val())
})

//receive new chats and append them
socket.on('newChattoUsers', (msg, time) => {
  $('.ex2').append(
    '<div class="container darker"><img src="" alt="Avatar" class="right" style="width:100%;" /><p>' +
      msg +
      '</p><span class="time-left">' +
      time +
      '</span></div>'
  )

  //scroll to bottom
  $('.ex2').animate(
    {
      scrollTop: document.getElementsByClassName('ex2')[0].scrollHeight
    },
    1200
  )
})

