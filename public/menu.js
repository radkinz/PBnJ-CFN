console.log('hello world', window.location.search)

if (window.location.search !== '?status=1') {
  $('#div4').hide()
  $('#linesep').hide()
}
const socket = io()

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
