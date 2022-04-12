const socket = io();
console.log("hello")

//receive all chats when connected
socket.on('allChats', (chats) => {
	console.log(chats);

	//display chat array
	for (let i = 0; i < chats.length; i++) {
		$(".ex2").append('<div class="container darker"><img src="" alt="Avatar" class="right" style="width:100%;" /><p>' + chats[i].chat + '</p><span class="time-left">11:01</span></div>');
	}

	console.log($(".ex2"))

});

//send new chats when button is clicked
$("#sned_butt").click((event) => {
	//prevent default refresh page
	event.preventDefault()

	//send chat from input to server
	socket.emit("newChat", $("#messageinpoot").val());
})

//receive new chats and append them
socket.on("newChattoUsers", (msg) => {
	console.log(msg)
	$(".ex2").append('<div class="container darker"><img src="" alt="Avatar" class="right" style="width:100%;" /><p>' + msg + '</p><span class="time-left">11:01</span></div>');
});