const socket = io()
console.log('hello')
sessionStorage.setItem('chatroom', 0)

//store session info
socket.on('sessionStorage', (res, callback) => {
  //set session storage values
  sessionStorage.setItem('userid', res.userid)
  sessionStorage.setItem('admin', res.admin)
  callback('got it')
})

//grab all chats
getAllChats()
function getAllChats () {
  socket.emit('allChats', sessionStorage.getItem('chatroom'))
}

  socket.on('DisplayallChats', chats => {
    console.log(chats)

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
    console.log(status, typeof status)
    if (status !== '1') {
      $('#messageinpoott').hide()
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
