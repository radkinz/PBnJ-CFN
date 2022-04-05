const socket = io();
console.log("hello")

//receive all chats when connected
socket.on('allChats', (chats) => {
	console.log(chats);

	//display chat array
	for (let i = 0; i < chats.length; i++) {
		$("#chats").append("<li>" + chats[i].chat + "</li>");
	}

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
	$("#chats").append("<li>" + msg + "</li>");
});