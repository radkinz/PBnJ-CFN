console.log('hello world', window.location.search)

if (window.location.search !== "?status=1") {
    $("#div4").hide()
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