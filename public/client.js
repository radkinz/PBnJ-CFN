const socket = io()
console.log('hello')

//store session info
socket.on('sessionStorage', (res, callback) => {
  console.log(res.userid, res.admin)
  sessionStorage.setItem('userid', res.userid)
  sessionStorage.setItem('admin', res.admin)
  callback('got it')
})

//receive all chats when connected
socket.on('allChats', chats => {
  console.log(chats)

  //display chat array
  for (let i = 0; i < chats.length; i++) {
    $('.ex2').append(
      '<div class="container darker"><img src="" alt="Avatar" class="right" style="width:100%;" /><p>' +
        chats[i].chat +
        '</p><span class="time-left">11:01</span></div>'
    )
  }

  console.log($('.ex2'))
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
  console.log(userid)

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
  let minutes = date_ob.getMinutes()

  // current seconds
  let seconds = date_ob.getSeconds()

  let finalTime =
    year +
    '-' +
    month +
    '-' +
    date +
    ' ' +
    hours +
    ':' +
    minutes +
    ':' +
    seconds

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  console.log(
    year +
      '-' +
      month +
      '-' +
      date +
      ' ' +
      hours +
      ':' +
      minutes +
      ':' +
      seconds
  )

  socket.emit('newChat', $('#messageinpoot').val(), userid, finalTime)
})

//when login button click send to server
$('#Login').click(event => {
  //prevent default refresh page
  event.preventDefault()
  socket.emit('login', $('#usernameInput').val(), $('#passwordInput').val())
})

//receive new chats and append them
socket.on('newChattoUsers', msg => {
  console.log(msg)
  $('.ex2').append(
    '<div class="container darker"><img src="" alt="Avatar" class="right" style="width:100%;" /><p>' +
      msg +
      '</p><span class="time-left">11:01</span></div>'
  )
})
