const socket = io()
console.log('hello')
sessionStorage.setItem('chatroom', 0)
sessionStorage.setItem('chatroomList', [0])

//notification stuff
let permission = Notification.permission

function showNotification (body) {
  var notification = new Notification('You received a new chat!', { body })
  notification.onclick = () => {
    notification.close()
    window.parent.focus()
  }
}

//store session info
socket.on('sessionStorage', (res, callback) => {
  //set session storage values
  sessionStorage.setItem('userid', res.userid)
  sessionStorage.setItem('admin', res.admin)
  callback('done!')
})

//display all chatrooms
function DisplayAllChatrooms () {
  $('.ex1').html(' ')

  if (sessionStorage.getItem('admin') == '1') {
    //grab all user ids
    socket.emit('grabUserIds')
    socket.on('handleUserIds', data => {
      $('.ex1').html(' ')

      //add homepage
      $('.ex1').append(
        '<button class="chatroombutton" id="' +
          0 +
          '" onClick="reply_click(' +
          0 +
          ')">Bulletin Board</button>'
      )

      for (let i = 0; i < data.length; i++) {
        // chatrooms.push(data[i].userid)
        console.log(data[i].userid)
        $('.ex1').append(
          '<button class="chatroombutton" id="' +
            data[i].userid +
            '" onClick="reply_click(' +
            data[i].userid +
            ')">' +
            data[i].username +
            '</button>'
        )
      }
    })
  } else {
    //add homepage
    $('.ex1').append(
      '<button class="chatroombutton" id="' +
        0 +
        '" onClick="reply_click(' +
        0 +
        ')">Bulletin Board</button>'
    )

    $('.ex1').append(
      '<button class="chatroombutton" id="' +
        sessionStorage.getItem('userid') +
        '" onClick="reply_click(' +
        sessionStorage.getItem('userid') +
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
socket.on('loginStatus', (status, adminStatus) => {
  if (status) {
    console.log(adminStatus, typeof adminStatus)
    if (adminStatus == 1) {
      window.location = '/ButtonMenu?status=1'
    } else {
      window.location = '/ButtonMenu?status=0'
    }
  } else {
    alert('Incorrect username or password. Please try again.')
  }
})

$('#back').click(function () {
  let adminStatus = sessionStorage.getItem('admin')

  if (adminStatus == '1') {
    window.location = '/ButtonMenu?status=1'
  } else {
    window.location = '/ButtonMenu?status=0'
  }
})

//grab chatroom id
function reply_click (clicked_id) {
  sessionStorage.setItem('chatroom', clicked_id)
  getAllChats()
}
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
  $('#messageinpoot').val('')
})

//creating a new account (username, password, admin status)

//when login button click send to server
$('#Login').click(event => {
  //prevent default refresh page
  event.preventDefault()
  socket.emit('login', $('#usernameInput').val(), $('#passwordInput').val())
})

//receive new chats and append them
socket.on('newChattoUsers', (msg, time, senderid, msgchatroomid) => {
  console.log(
    senderid,
    sessionStorage.getItem('userid'),
    sessionStorage.getItem('admin'),
    sessionStorage.getItem('userid') == senderid,
    sessionStorage.getItem('admin') == '1'
  )
  console.log(typeof sessionStorage.getItem('userid'), typeof senderid)
  if (
    sessionStorage.getItem('userid') !== senderid ||
    sessionStorage.getItem('admin') == '1'
  ) {
    if (
      sessionStorage.getItem('userid') == senderid &&
      sessionStorage.getItem('admin') == '1'
    ) {
      console.log('admin is sender')
    } else {
      if (Notification.permission == 'granted') {
        showNotification(msg)
      }
    }
  }

  DisplayAllChatrooms()

  //only append if in correct chatroom
  if ((msgchatroomid = sessionStorage.getItem('chatroomid'))) {
    $('.ex2').append(
      '<div class="container darker"><img src="" alt="Avatar" class="right" style="width:100%;" /><p>' +
        msg +
        '</p><span class="time-left">' +
        time +
        '</span></div>'
    )
  }

  //scroll to bottom
  $('.ex2').animate(
    {
      scrollTop: document.getElementsByClassName('ex2')[0].scrollHeight
    },
    1200
  )
})
