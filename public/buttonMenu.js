console.log('hello world', window.location.search)

if (window.location.search !== '?status=1') {
  $('#div4').hide()
  $('#linesep').hide()
}
const socket = io()

socket.on('handleUserIds', data => {
  console.log(data)
  //create chatroom objs
  let chatrooms = []
  //set home page
  chatrooms.push(0)
  for (let i = 0; i < data.length; i++) {
    chatrooms.push(data[i].userid)
  }
  //store chatroom listing
  sessionStorage.setItem('chatroomList', JSON.stringify(chatrooms))
})

//notification stuff
let permission = Notification.permission

function showNotification (body) {
  var notification = new Notification('You received a new chat!', { body })
  notification.onclick = () => {
    notification.close()
    window.parent.focus()
  }
}

socket.on('newChattoUsers', (msg, time, senderid) => {
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
          console.log("working")
        showNotification(msg)
      }
    }
  }
})
