var socket = io('https://chat.communiq.ge/namespace1',
    { transports: ['websocket'] });

export let currentRoomId = null;  // Define currentRoomId in the global scope

const storedSession = JSON.parse(sessionStorage.getItem('clientSession')) || {};

export function join() {
    socket.emit('join', storedSession, (error, room) => {
        if (error) {
            console.log(error);
        } else {
            currentRoomId = room;
            console.log('Joined room', room);
        }
    });
}

socket.on('timeout_callback', () => {
    console.log("socket.on('timeout_callback'")
    loadTimeoutPage()
});

socket.on('authenticated', (name, number, sessionID) => {
    console.log("socket.on('authenticated')", name, number, sessionID);
    if (sessionID) {
        console.log('Authenticated with sessionID:', sessionID);
        sessionStorage.setItem('clientSession', JSON.stringify({ name, number, sessionID }));
    } else {
        console.error('Authentication failed');
    }
});

socket.on('join_room', (roomId) => {
    console.log("socket.on('join_room')", roomId)
    socket.emit('join_room', roomId);
    console.log("socket.emit('join_room'", roomId)
});


socket.on('try_connecting', () => {
    console.log("socket.on('try_connecting')")
    socket.emit('try_connecting');
    console.log("socket.emit('try_connecting')")

});

socket.on('non_working_hours', () => {
    //TODO: aq sxva mesiji unda gamochndes
    console.log("socket.on('non_working_hours')")
});

//rodis ra unda gamochndes
socket.on('load_chat', () => {
    console.log("socket.on('load_chat')")
    sessionStorage.setItem("chat-in-process", "true");
    loadClientChatPage();
});

socket.on('load_waiting_page', () => {
    console.log("socket.on('load_waiting_page')")
    loadWaitingPage()
});

socket.on('load_feedback_page', () => {
    console.log("socket.on('load_feedback_page')")
    loadFeedbackPage()
});

socket.on('update', () => {
    console.log("socket.on('update')")
    loadClientChatPage();
});

socket.on('operator_connected', () => {
    console.log("socket.on('operator_connected')")
    SetStatusIndicatorActive(true)
});

socket.on('operator_disconnected', () => {
    console.log("socket.on('operator_disconnected')")
    SetStatusIndicatorActive(false)
});

socket.on('client_rooms', (rooms) => {
    console.log("socket.on('client_rooms')", rooms)
    rooms.forEach((room) => {
        const roomItem = document.createElement('li');
        roomItem.textContent = room.roomId + " - " + room.name;
        roomItem.addEventListener('click', () => changeRoom(room));
        changeRoom(room);

    });
});

socket.on("session-ended", () => {
    console.log("socket.on('session-ended')")
    sessionStorage.clear();
    location.reload();
});

socket.on('chat_message', (msg) => {
    console.log("socket.on('chat_message')", msg)
    displayChatMessage(msg);
});

socket.on('operator_typing', () => {
    console.log("socket.on('operator_typing')")
    typingAnimation.style.opacity = "1"
    if (timeoutID) {
        clearTimeout(timeoutID)
    }
    timeoutID = setTimeout(Typing, 2000)
});

socket.on('chat_history', (history) => {
    console.log("socket.on('chat_history')", history)
    displayChatHistory(history);
});

socket.on('operator_ended_chat', () => {
    console.log("socket.on('operator_ended_chat')")
    socket.emit('leave_room', currentRoomId);
    console.log("socket.emit('leave_room'", currentRoomId)
    currentRoomId = null;

    //TODO:: am dros gamochndes shepasebis forma
    //rac operator_ended_chats is mere davaemiteb imave funqciashi
});

socket.on('client_ended_chat', () => {
    console.log("socket.on('client_ended_chat')")
    currentRoomId = null;
});