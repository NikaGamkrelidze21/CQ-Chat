import User from './user.js';
import { Room } from '../room.js';
import { DisplayChatList } from '../../handlers/chat-list-handlers.js';
import {DisplayMessageHistory} from '../../handlers/chat-event-handler.js';
import { GeneratingMessage } from '../../handlers/chat-event-handler.js';
import Message from '../message.js';



export default class Operator extends User {
    constructor(name, number, sessionID) {
        super(name, number, sessionID)
        this.type = "operator";
        this.ROOMS = []

        this.socketAuthentification();
        this.setupSocketListeners();

        setTimeout(() => {

            // this.socket.emit('end_chat_from_operator', "dba8f15f1af1d85dd24ad811f776c492");
            // console.log("emitting end_chat_from_operator", this.socket)
        }, 1000);

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
        console.log("socket.auth", this.socket)

        setTimeout(() => {
            this.socket.emit('get_operator_rooms');
            console.log("emitting get_operator_rooms", this.socket)
        }, 1000);

    }

    setupSocketListeners() {
        this.socket.on('authenticated', (name, number, sessionID) => {
            console.log("socket.on('authenticated')", this)
            if (sessionID) {
                console.log('Authenticated with sessionID:', sessionID);
                // TODO why this is here ? 
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
                    return newRoom
                });
                console.log("ROOMS", this.ROOMS)

                if (this.currentRoom) {
                    this.socket.emit('get_chat_history', { roomId: this.currentRoom.roomId });
                }
            }

            DisplayChatList(this, this.ROOMS)
        });



        this.socket.on('client_disconnected', (roomId) => {
            console.log("socket.on('client_disconnected')", roomId)
        });

        this.socket.on('client_connected', (roomId) => {
            console.log("socket.on('client_connected')", roomId)
        });

        this.socket.on('client_connected_successfully', (data) => {
            console.log('client connected successfully', data)
            // sendDefaultMessage(this, data).bind(this);
            console.log("() => sendDefaultMessage()", data.roomId, self.name)
            this.socket.emit('operator_private_chat_message',
                {
                    roomId: data.roomId,
                    message: "გამარoჯობა, რით შემიძლია დაგეხმაროთ?",
                    operatorNumber: self.name
                });
        });

        // TODO reorganize this with new message class
        // function sendDefaultMessage(self, data) {
        // }

        this.socket.on('update', () => {
            console.log("socket.on('update')")
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
                    SMS.DisplayChatMessage()
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
        if (message.sender && message.text && message.sentByOperator && message.time && message.roomId) {
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
        message.setSentByOperator(true)
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
