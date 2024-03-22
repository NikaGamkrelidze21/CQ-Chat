import { SendMessageButtonHandler, DisplayMessageHistory, ValidateSending } from "./handlers/chat-event-handler.js"
import { DisplayChatList } from "./handlers/chat-list-handlers.js"
import Message from "./classes/message.js";
import { Operator, Client } from "./classes/users.js";
import { ChatListItem, ChatList } from "./classes/chat-list.js";
import { Room, RoomMember, SelectedRoom } from "./classes/room.js";

var socket = io('https://chat.communiq.ge/namespace1',
    { transports: ['websocket'] });

const storedSession = JSON.parse(sessionStorage.getItem('operatorSession')) || {};
let name = null;
let currentRoomId = null;
let number = storedSession.number;
let sessionID = storedSession.sessionID;
let SELF = new Operator()
let ROOMS = []
let SELECTEDROOM = new SelectedRoom()

console.log('storedSession', storedSession)

name = storedSession.name;

if (name && number) {
    socket.auth = {
        name: name,
        sessionID: sessionID,
        number: number,
        type: "operator",
    };
    SELF = new Operator(JSON.parse(sessionStorage.getItem('user')))
    
    socket.connect();
    
    if (window.location.pathname.split('/').pop() == "signin.html") {
        window.location.href = "chat-operator.html";
    } else {
        console.log("name && number", name, number)
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

function UpdateSessionStorageUSER(self = SELF) {
    console.log("() => UpdateSessionStorage()")
    sessionStorage.setItem('user', JSON.stringify(self));
}

function GetSessionStorageUSER() {
    console.log("() => GetSessionStorage()")
    return JSON.parse(sessionStorage.getItem('user')) || {};
}

function UpdateSessionStorageROOMS() {
    console.log("() => UpdateSessionStorageROOMS()", ROOMS)
    sessionStorage.setItem('rooms', JSON.stringify(ROOMS));
}

export { GetSessionStorageUSER, UpdateSessionStorageUSER, UpdateSessionStorageROOMS, SELF, ROOMS, SELECTEDROOM, socket }

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
    if (sessionID) {
        console.log('Authenticated with sessionID:', sessionID);
        // TODO why this is here ? 
        sessionStorage.setItem('operatorSession', JSON.stringify({ name, number, sessionID }));

        SELF.setName(name);
        SELF.setNumber(number);
        SELF.setSessionID(sessionID);

        UpdateSessionStorageUSER()

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

    if (rooms) {

        ROOMS = rooms.map((room) => {
            return new Room(
                room.roomId,
                room.status,

                {
                    client: new Client(room.clientName, room.clientNumber, room.status),
                    operator: new Operator(SELF.name, SELF.number, SELF.sessionID)
                }

            )
        });

        UpdateSessionStorageROOMS()

        DisplayChatList(ROOMS)

        if (currentRoomId) {
            socket.emit('get_chat_history', { roomId: currentRoomId });
        }
    }
});

socket.on('join_room', (roomId) => {
    console.log("socket.on('join_room')", roomId)
    socket.emit('join_room', roomId);
});

socket.on('chat_message', (msg) => {
    console.log("socket.on('chat_message')", msg)

    let sender = null;

    if (msg.sentByOperator) {
        sender = SELF
    } else {
        ROOMS.forEach(element => {
            if (element.roomId === msg.roomId) {
                sender = element.members.client
            }
        });
    }

    console.log("sender", sender)

    const SMS = new Message(msg.roomId, sender, msg.timestamp, msg.text, msg.sentByOperator)
    // if (currentRoomId === msg.roomId && !SMS.sentByOperator) {


    ROOMS.forEach(room => {
        if (room.roomId === SMS.roomId) {
            room.appendChatHistory(SMS)
        }
    });

    UpdateSessionStorageROOMS()
    SMS.DisplayChatMessage()
    // }
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
        let sender = null

        if (msg.sentByOperator) {
            sender = SELF
        } else {

            ROOMS.forEach(element => {
                if (element.roomId === msg.roomId) {
                    sender = element.members.client; // Add a colon here
                }
            });
        }
        console.log("sender", sender);

        return new Message(msg.roomId, sender, msg.timestamp, msg.text, msg.sentByOperator)
        return {
            roomId: msg.roomId,
            sender: msg.sender,
            message: msg.text,
            sentByOperator: msg.sentByOperator,
            time: `${date.getHours()}:${date.getMinutes()}`

        }
    });

    ROOMS.forEach(room => {
        if (history[0] && room.roomId === history[0].roomId) {
            room.setChatHistory(messages)
        }
    });

    UpdateSessionStorageROOMS()
    if (history[0] && SELF.currentRoomId === history[0].roomId) {
        DisplayMessageHistory(messages);
    }
});


// socket.emit('get_operator_rooms');
// console.log("emitting get_operator_rooms")

$(document).ready(function () {
    $("#authentication-form").on('submit', async function asy(e) {
        e.preventDefault();
        var form = $(this);
        var name = form.find('input[id="auth-input-name"]').val();
        var number = form.find('input[id="auth-input-number"]').val();

        submitAuthFormOperator(name, number)
    });

    $(".chat-header").hide()
    $(".chat-footer").hide()
});