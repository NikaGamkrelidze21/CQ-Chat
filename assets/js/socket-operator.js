var socket = io('https://chat.communiq.ge/namespace1',
    { transports: ['websocket'] });

let name = null;
let currentRoomId = null;

const storedSession = JSON.parse(sessionStorage.getItem('operatorSession')) || {};
console.log('storedSession', storedSession)
name = storedSession.name;
let number = storedSession.number;
let sessionID = storedSession.sessionID;

if (name && number) {
    socket.auth = {
        name: name,
        sessionID: sessionID,
        number: number,
        type: "operator",
    };

    socket.connect();

    if (window.location.pathname.split('/').pop() == "signin.html") {
        window.location.href = "chat-operator.html";
    } else {
        socket.emit('get_operator_rooms');
    }
}


async function submitAuthFormOperator(username, number) {
    if (username && number) {
        socket.auth = {
            name: username,
            number: number,
            sessionID: "",
            type: "operator",
        };

        let sessionID = socket.auth.sessionID;

        await socket.connect();
    }
};


// SOCKET LISTENERS ------------------------------------------------------------------
socket.on('client_disconnected', (roomId) => {
    console.log("socket.on('client_disconnected')", roomId)
});

socket.on('client_connected', (roomId) => {
    console.log("socket.on('client_connected')", roomId)
});

socket.on('client_connected_successfully', (data) => {
    console.log('client connected successfully', data.clientId, "roomIdia", data.roomId)
    let operatorNumber = storedSession.number;
    socket.emit('operator_private_chat_message',
        {
            roomId: data.roomId,
            message: "გამარჯობა, რით შემიძლია დაგეხმაროთ?",
            operatorNumber: operatorNumber
        });
    console.log("emit('operator_private_chat_message')", "roomId:", data.roomId, operatorNumber)
});

socket.on('authenticated', (name, number, sessionID) => {
    console.log("socket.on('authenticated')", name, number, sessionID)
    console.log("opnaaaaaaaaaaaaaaaaaaaaaaaaa")
    if (sessionID) {
        console.log('Authenticated with sessionID:', sessionID);
        // TODO why this is here ? 
        sessionStorage.setItem('operatorSession', JSON.stringify({ name, number, sessionID }));

        if (window.location.pathname.split('/').pop() == "signin.html") {

            window.location.href = "chat-operator.html";
        }
    } else {
        console.error('Authentication failed');
    }
});

socket.on('update', () => {
    console.log("socket.on('update')")
    // currentRoomId = null;
    // loadOperatorPage();
    // displayChatHistory([]);
    // chatFullCleanup()
});

socket.on('operator_rooms_list', (rooms) => {
    console.log("socket.on('operator_rooms_list')", rooms)

    DisplayChatList(rooms)

    if (currentRoomId) {
        socket.emit('get_chat_history', { roomId: currentRoomId });
    }
});

socket.on('join_room', (roomId) => {
    console.log("socket.on('join_room')", roomId)
    socket.emit('join_room', roomId);
});

socket.on('chat_message', (msg) => {
    console.log("socket.on('chat_message')", msg)

    const SMS = new Message(msg.roomId, msg.sender, msg.time, msg.text, msg.sentByOperator)

    if (currentRoomId === msg.roomId && !SMS.sentByOperator) {
        SMS.DisplayChatMessage()
    }
});

socket.on('client_typing', (roomId) => {
    console.log("socket.on('client_typing')", roomId)
    if (currentRoomId === roomId) {
        // const typingAnimation = document.getElementById("typing-animation")
        // typingAnimation.style.opacity = "1"
        // setTimeout(() => {
        //     typingAnimation.style.opacity = "0"
        // }, 2000);
    }
});

socket.on('chat_history', (history) => {
    console.log("socket.on('chat_history')", history);

    const messages = history.map((msg) => {
        const date = new Date(msg.timestamp)
        return {
            roomId: msg.roomId,
            sender: msg.sender,
            message: msg.text,
            sentByOperator: msg.sentByOperator,
            time: `${date.getHours()}:${date.getMinutes()}`

        }
    });

    DisplayMessageHistory(messages);
});


socket.emit('get_operator_rooms');


$(document).ready(function () {
    $("#authentication-form").on('submit', async function asy(e) {
        e.preventDefault();
        var form = $(this);
        var name = form.find('input[id="auth-input-name"]').val();
        var number = form.find('input[id="auth-input-number"]').val();

        submitAuthFormOperator(name, number)
    });
});