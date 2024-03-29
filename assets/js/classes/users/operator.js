import User from './user.js';
import { Room } from '../room.js';
import { DisplayMessageHistory } from '../../handlers/chat-event-handler.js';
import { GeneratingMessage } from '../../handlers/chat-event-handler.js';
import Message from '../message.js';



export default class Operator extends User {
    constructor(name, number, sessionID) {
        super(name, number, sessionID)
        this.type = "operator";
        this.ROOMS = []

        this.socketAuthentification();
        this.setupSocketListeners();


    }

    abandonRoom(roomId) {
        console.log("=> abandonRoom()", roomId)
        this.socket.emit('end_chat_from_operator', roomId);
        this.currentRoom = null
        this.clearChat()
        this.socket.emit('get_operator_rooms');
    }

    clearChat() {
        console.log("=> clearChat()")
        $(".chat-header").hide()
        $(".chat-footer").hide()
        $("#chatContactTab").empty()
        $("#chat-content").empty()
    }

    socketAuthentification() {
        console.log('(Operator) => socketAuthentification()');
        this.socket.auth = {
            name: this.name,
            number: this.number,
            sessionID: this.sessionID,
            type: "operator",
        };

        this.socket.connect();

        setTimeout(() => {
            // console.log("socket.auth", this.socket)
            this.socket.emit('get_operator_rooms');
            console.log("emitting get_operator_rooms", this.socket)
        }, 1000);

    }

    setupSocketListeners() {
        this.socket.on('authenticated', (name, number, sessionID) => {
            console.log("socket.on('authenticated')", this)
            if (sessionID) {
                console.log('Authenticated with sessionID:', sessionID);

                sessionStorage.setItem('operatorSession', JSON.stringify({ name, number, sessionID }));

                this.setName(name);
                this.setNumber(number);
                this.setSessionID(sessionID);

                if (window.location.pathname.split('/').pop() == "signin.html") {
                    window.location.href = "chat.html";
                }
            } else {
                console.error('Authentication failed');
            }
        })

        this.socket.on('operator_rooms_list', (rooms) => {
            console.log("socket.on('operator_rooms_list')", rooms)

            if (rooms) {
                this.ROOMS = rooms.map((room) => {
                    let newRoom = new Room()
                    newRoom.setRoomId(room.roomId)
                    newRoom.setRoomStatus(room.status)
                    newRoom.setClient(new User(room.clientName, room.clientNumber))
                    newRoom.setOperator(this)
                    return newRoom
                });
                console.log("ROOMS", this.ROOMS)

                if (this.ROOMS.length > 0) {
                    $("#chatContactTab").empty()
                    this.ROOMS.forEach(room => {
                        room.displayRoom()
                    })
                }

                if (this.currentRoom) {
                    this.socket.emit('get_chat_history', { roomId: this.currentRoom.roomId });
                }
            }

            // DisplayChatList(this, this.ROOMS)
        });



        this.socket.on('client_disconnected', (roomId) => {
            console.log("socket.on('client_disconnected')", roomId)
        });

        this.socket.on('client_connected', (roomId) => {
            console.log("socket.on('client_connected')", roomId)
        });

        // TODO need to revieve {clientName, clientNumber, clientId, roomId, status, chatHistory}
        // on this emit to send default message from here and to set last message time and message itself on room list
        
        this.socket.on('client_connected_successfully', (data) => {
            console.log('socket.on(client connected successfully)', data)
            let temp = new Room()
            temp.setRoomId(data.roomId)
            temp.setRoomStatus(data.status)
            temp.setClient(new User(data.clientId))
            temp.setOperator(this)
            temp.displayRoom()

            this.ROOMS.push(temp)



        });


        

        this.socket.on('update', () => {

            this.ROOMS = []
            this.currentRoom = new Room()

            this.clearChat()

            console.log("socket.on('update')")
            this.socket.emit('get_operator_rooms');
            console.log("emitting get_operator_rooms", this.socket)
            // currentRoomId = null;
            // loadOperatorPage();
            // displayChatHistory([]);
            // chatFullCleanup()
        });


        this.socket.on('join_room', (roomId) => {
            console.log("socket.on('join_room')", roomId)
            this.socket.emit('join_room', roomId);
        });

        this.socket.on('chat_message', (msg) => {
            console.log("socket.on('chat_message')", msg)

            let sender = null;

            if (msg.sentByOperator) {
                sender = this
            } else {
                this.ROOMS.forEach(element => {
                    if (element.roomId === msg.roomId) {
                        sender = element.client
                    }
                });
            }

            console.log("sender", sender)

            const SMS = new Message(msg.roomId, sender, msg.timestamp, msg.text, msg.sentByOperator)
            // if (currentRoomId === msg.roomId && !SMS.sentByOperator) {


            this.ROOMS.forEach(room => {
                if (room.roomId === SMS.roomId) {
                    room.appendChatHistory(SMS)
                    if (this.currentRoom && this.currentRoom.roomId === SMS.roomId) {
                        SMS.DisplayChatMessage()
                    }
                }
            });

            // }
        });

        this.socket.on('client_typing', (roomId) => {
            console.log("socket.on('client_typing')", roomId)
            if (this.currentRoomId === roomId) {
                // const typingAnimation = document.getElementById("typing-animation")
                // typingAnimation.style.opacity = "1"
                // setTimeout(() => {
                //     typingAnimation.style.opacity = "0"
                // }, 2000);
            }
        });

        this.socket.on('chat_history', (history) => {
            console.log("socket.on('chat_history')", history);

            if (history.length === 0 && this.currentRoom.roomId) {
                console.log("() => sendDefaultMessage()", this.currentRoom.roomId)
                this.socket.emit('operator_private_chat_message', {
                    roomId: this.currentRoom.roomId,
                    message: "გამარoჯობა, რით შემიძლია დაგეხმაროთ?",
                    operatorNumber: this.name
                });
                return
            }

            const messages = history.map((msg) => {
                let sender = null

                if (msg.sentByOperator) {
                    sender = this
                } else {

                    this.ROOMS.forEach(element => {
                        if (element.roomId === msg.roomId) {
                            sender = element.client; // Add a colon here
                        }
                    });
                }
                console.log("sender", sender);

                return new Message(msg.roomId, sender, msg.timestamp, msg.text, msg.sentByOperator)
            });

            this.ROOMS.forEach(room => {
                if (history[0] && room.roomId === history[0].roomId) {
                    room.setChatHistory(messages)
                }
            });

            // UpdateSessionStorageROOMS()
            if (history[0] && this.currentRoom.roomId === history[0].roomId) {
                // DisplayMessageHistory(messages);
                DisplayMessageHistory(messages)
            }
        });
    }


    ValidateSending(message) {
        console.log("=> ValidateSending()", message)
        if (message.sender && message.text && message.time && message.roomId) {
            console.log("=> ValidateSending() => true")
            return true
        }
        else {
            console.log("=> ValidateSending() => false")
            return false
        }
    }

    sendMessage() {
        let message = GeneratingMessage()
        message.setSender(this)
        message.setSentByMe(true)
        message.setRoomId(this.currentRoom.roomId)

        console.log(this.currentRoom)
        console.log("(operator)=> sendMessageEmit()", message)
        if (this.ValidateSending(message)) {
            console.log("socket.emit(operator_private_chat_message)", message)
            this.socket.emit('operator_private_chat_message',
                {
                    roomId: message.roomId,
                    message: message.text,
                    operatorNumber: this.name
                });
        }
    }
}
