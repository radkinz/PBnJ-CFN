//sidebar
function checkResize () {
  if ($(window).width() < 700) {
    $('.ex1container').hide()
    $('.openbtn').show()

    //change into mobile css
    $('.ex2').css('width', '95%')
    $('#messageinpoot').css('width', '80%')
  } else {
    $('.ex1container').show()
    $('.openbtn').hide()

    //change css back
    $('.ex2').css('width', '65%')
    $('#messageinpoot').css('width', '50%')
  }
}
checkResize()
$(window).resize(function () {
  checkResize()
})

function openNav () {
  document.getElementById('mySidebar').style.width = '220px'
  document.getElementById('main').style.marginLeft = '160px'
}

function closeNav () {
  document.getElementById('mySidebar').style.width = '0'
  document.getElementById('main').style.marginLeft = '70px'
}

const socket = io()
sessionStorage.setItem('chatroom', 0)
sessionStorage.setItem('chatroomList', [0])

//grab all user ids for storage purposes
socket.emit('grabUserIds')
socket.on('handleUserIds', data => {
    //save data
    sessionStorage.setItem('allUserIds', JSON.stringify(data))
})

//notification stuff
let permission = Notification.permission

function showNotification(body, username) {
    console.log(username)
    var notification = new Notification(
        `You received a new chat from ${username}`, {
            body
        }
    )
    notification.onclick = () => {
        notification.close()
        window.parent.focus()
    }
}

let createUserAdminStatus
    //store session info
socket.on('sessionStorage', (res, callback) => {
    //set session storage values
    sessionStorage.setItem('userid', res.userid)
    sessionStorage.setItem('admin', res.admin)
    callback('done!')
})

//display all chatrooms
function DisplayAllChatrooms() {
    $('.ex1').html(' ')

    if (sessionStorage.getItem('admin') == '1') {
        //clear chats
        $('.ex1').html(' ')
        let data = JSON.parse(sessionStorage.getItem('allUserIds'))
        console.log(data)

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

        //make white div for whatever one u are on
        console.log(
            sessionStorage.getItem('chatroom'),
            $(`#${sessionStorage.getItem('chatroom')}`)
        )
        $(`#${sessionStorage.getItem('chatroom')}`).css(
            'background-color',
            'white'
        )

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

        $(`#${sessionStorage.getItem('chatroom')}`).css('background-color', 'white')
    }
}

//grab all chats
getAllChats()

function getAllChats() {
    socket.emit('allChats', sessionStorage.getItem('chatroom'), 'DisplayallChats')
}

socket.on('DisplayChats', chats => {
    $('.ex2').html(' ')

    let ids = JSON.parse(sessionStorage.getItem('allUserIds'))

    //display chat array
    for (let i = 0; i < chats.length; i++) {
        if (
            ids.some(id => id.userid === chats[i].userid)
        ) {
            $('.ex2').append(
                '<div class="container darker"><img src="/images/avatar.jpg" alt="Avatar" class="right" style="width:100%;" /><p>' +
                chats[i].chat +
                '</p><span class="time-left">' +
                chats[i].time +
                '</span></div>'
            )
        } else {
            $('.ex2').append(
                '<div class="container"><img src="/images/logo(1).png" alt="Avatar" class="right" style="width:100%;" /><p>' +
                chats[i].chat +
                '</p><span class="time-left">' +
                chats[i].time +
                '</span></div>'
            )
        }
    }

    $('.ex2').animate({
            scrollTop: $('.ex2').prop('scrollHeight')
        },
        1200
    )
})

socket.on('DisplayallChats', chats => {
    //delete chats to start
    $('.ex1').html(' ')
    $('.ex2').html(' ')

    //display chatroom
    DisplayAllChatrooms()

    let ids = JSON.parse(sessionStorage.getItem('allUserIds'))

    //display chat array
    for (let i = 0; i < chats.length; i++) {
        if (
            ids.some(id => id.userid === chats[i].userid)
        ) {
            $('.ex2').append(
                '<div class="container darker"><img src="/images/avatar.jpg" alt="Avatar" class="right" style="width:100%;" /><p>' +
                chats[i].chat +
                '</p><span class="time-left">' +
                chats[i].time +
                '</span></div>'
            )
        } else {
            $('.ex2').append(
                '<div class="container"><img src="/images/logo(1).png" alt="Avatar" class="right" style="width:100%;" /><p>' +
                chats[i].chat +
                '</p><span class="time-left">' +
                chats[i].time +
                '</span></div>'
            )
        }
    }

    //hide input
    let status = sessionStorage.getItem('admin')
    let chatroomID = sessionStorage.getItem('chatroom')

    //hide search inputs
    if (status !== '1') {
        console.log($('.chatroomSearchContainer'))
        $('.chatroomSearchContainer').hide()
    }

    if (status !== '1' && chatroomID == '0') {
        $('#messageinpoott').hide()
    } else {
        $('#messageinpoott').show()
    }

    $('.ex2').animate({
            scrollTop: $('.ex2').prop('scrollHeight')
        },
        1200
    )
})

//check user login status
socket.on('loginStatus', (status, adminStatus) => {
    if (status) {
        if (adminStatus == 1) {
            window.location = '/ButtonMenu?status=1'
        } else {
            window.location = '/ButtonMenu?status=0'
        }
    } else {
        alert('Incorrect username or password. Please try again.')
        return;
    }
})

$('#back').click(function() {
    let adminStatus = sessionStorage.getItem('admin')

    if (adminStatus == '1') {
        window.location = '/ButtonMenu?status=1'
    } else {
        window.location = '/ButtonMenu?status=0'
    }
})


//grab chatroom id
function reply_click(clicked_id) {
    sessionStorage.setItem('chatroom', clicked_id)
    getAllChats()
}

//send new chat when user presses enter key
$('#messageinpoot').keypress(function(e) {
    var key = e.which
    if (key == 13) {
        // the enter key code
        e.preventDefault()

    //check if there is a message to send
    if ($('#messageinpoot').val() == '') {
      alert('Please type a message below before sending:)')
      return
    }

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

        let finalTime =
            hours + ':' + minutes + ' ' + month + '-' + date + '-' + year

        let chatroomid = sessionStorage.getItem('chatroom')

        console.log($('#messageinpoot').val(), userid, finalTime, chatroomid)

        socket.emit(
            'newChat',
            $('#messageinpoot').val(),
            userid,
            finalTime,
            chatroomid
        )
        $('#messageinpoot').val('')
    }
})

//send new chat when user presses enter key
$('#chatroomSearch').keypress(function(e) {
    var key = e.which
    if (key == 13) {
        // the enter key code
        e.preventDefault()

        let ids = JSON.parse(sessionStorage.getItem('allUserIds'))
        let searchquery = $('#chatroomSearch').val()
        let idFound = ids.find(id => id.username === searchquery)

        if (idFound == undefined) {
            alert('Username not found')
            return
        }

        $('.ex1').html(' ')
        $('#chatroomSearch').val(' ')
        $('#chatroomSearch').blur()

        $('.ex1').append(
            '<button class="chatroombutton" id="' +
            idFound.userid +
            '" onClick="reply_click(' +
            idFound.userid +
            ')">' +
            idFound.username +
            '</button>'
        )

        //make white div for whatever one u are on
        sessionStorage.setItem('chatroom', idFound.userid)
        $(`#${sessionStorage.getItem('chatroom')}`).css('background-color', 'white')

        //show chats
        socket.emit('allChats', sessionStorage.getItem('chatroom'), 'DisplayChats')
    }
})

$('#cancelSearch').click(function() {
    sessionStorage.setItem('chatroom', 0)
    $('#chatroomSearch').val(' ')
    socket.emit('allChats', sessionStorage.getItem('chatroom'), 'DisplayallChats')
})

//creating a new account (username, password, admin status)

//when login button click send to server
$('#Login').click(event => {
    //prevent default refresh page
    event.preventDefault()
    socket.emit('login', $('#usernameInput').val(), $('#passwordInput').val())
})

//create new account
$('#newAccount').click(function() {
    if (
        $('#inputCreateUsername').val() != '' &&
        $('#inputCreatePassword').val() != '' &&
        createUserAdminStatus != undefined
    ) {
        //create account
        socket.emit(
            'newAccountInSQL',
            $('#inputCreateUsername').val(),
            $('#inputCreatePassword').val(),
            createUserAdminStatus
        )
        console.log('over heeereeee')
    }
})

$('#Admin-Y').click(function() {
    createUserAdminStatus = 1
    $('Admin-Y').css('background', 'green')
    $('Admin-N').css('background', 'white')
})

$('#Admin-N').click(function() {
    createUserAdminStatus = 0
    $('Admin-N').css('background', 'green')
    $('Admin-Y').css('background', 'white')
})


//delete account
let selectedAccount;
$('.chast').click(function() {
    selectedAccount = $(this).html();
})
$('#delete-account').click(function() {
    socket.emit("removeAccountFromDB", selectedAccount)
    window.location.reload();
})

//receive new chats and append them
socket.on('newChattoUsers', (msg, time, senderid, msgchatroomid, username) => {
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
                showNotification(msg, username)
            }
        }
    }

    DisplayAllChatrooms()

    //only append if in correct chatroom
    console.log(
        sessionStorage.getItem('chatroom'),
        msgchatroomid,
        typeof msgchatroomid,
        typeof sessionStorage.getItem('chatroom')
    )
    if (msgchatroomid == sessionStorage.getItem('chatroom')) {
        $('.ex2').append(
            '<div class="container darker"><img src="" alt="Avatar" class="right" style="width:100%;" /><p>' +
            msg +
            '</p><span class="time-left">' +
            time +
            '</span></div>'
        )
    }

    //scroll to bottom
    $('.ex2').animate({
            scrollTop: document.getElementsByClassName('ex2')[0].scrollHeight
        },
        1200
    )
})
  }

  DisplayAllChatrooms()

  //only append if in correct chatroom
  console.log(
    sessionStorage.getItem('chatroom'),
    msgchatroomid,
    typeof msgchatroomid,
    typeof sessionStorage.getItem('chatroom')
  )
  if (msgchatroomid == sessionStorage.getItem('chatroom')) {
    let ids = JSON.parse(sessionStorage.getItem('allUserIds'))

    //display new array
    if (ids.some(id => id.userid === parseInt(senderid))) {
      $('.ex2').append(
        '<div class="container darker"><img src="/images/avatar.jpg" alt="Avatar" class="right" style="width:100px;" /><p>' +
          msg +
          '</p><span class="time-left">' +
          time +
          '</span></div>'
      )
    } else {
      $('.ex2').append(
        '<div class="container"><img src="/images/logo(1).png" alt="Avatar" class="right" style="width:100px;" /><p>' +
          msg +
          '</p><span class="time-left">' +
          time +
          '</span></div>'
      )
    }
  }

  //scroll to bottom
  $('.ex2').animate(
    {
      scrollTop: document.getElementsByClassName('ex2')[0].scrollHeight
    },
    1200
  )
})
