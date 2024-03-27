import { Room } from '../room.js';
import User from './user.js';
import { GeneratingMessage } from '../../handlers/chat-event-handler.js';
import Message from '../message.js';

export default class Client extends User {
    constructor(name, number, sessionID) {
        super(name, number, sessionID);
        this.type = "client";
        this.room = new Room();
        this.room.setClient(this);

        this.timeInterval = null;
        this.preTimeoutID = null;

        this.FeedbackScore = 0;
        this.FeedbackComment = "";

        this.setupSocketListeners();
        this.socketAuthentification();
    }

    submitCallback() {
        console.log("=> submitCallback()", this.name, this.number, this.sessionID,)
        console.log('test',JSON.parse(sessionStorage.getItem('clientSession')).sessionID)
        this.socket.emit('client-submit-callback', {
            clientName: this.name,
            clientNumber: this.number,
            clientSessionID: this.sessionID,
        });
        console.log(`socket.emit('client-submit-callback', { clientName: ${this.name}, clientNumber: ${this.number}, clientSessionID: ${this.sessionID} })`)
        // sessionStorage.clear();
        // window.location.href = "signin.html";
    }

    setRating(rating) {
        console.log("=> setRating()", rating)
        this.FeedbackScore = rating;
    }

    socketAuthentification() {
        console.log('(Client) => socketAuthentification()', this);
        this.socket.auth = {
            name: this.name,
            number: this.number,
            sessionID: this.sessionID,
            type: "client",
        };
        this.socket.connect();
        setTimeout(() => {
            console.log("auth", this.socket)
            this.socket.emit('client_rooms');
        }, 1000);
    }

    revokePreTimeout() {
        console.log("=> revokePreTimeout()")
        clearTimeout(this.preTimeoutID);
        this.preTimeoutID = null;
        $("#timeoutModal").modal('hide');
    }

    revokeTimeout() {
        console.log("=> revokeTimeout()")
        clearInterval(this.timeInterval);
        this.timeInterval = null;
    }

    timeoutHandler() {
        console.log("=> timeoutHandler()")
        clearInterval(this.timeInterval);
        this.revokeTimeout();
        this.revokePreTimeout();

        $("#timeoutModal").modal('hide');

        this.socket.emit('timeout', { session: this.sessionID })
        console.log("socket.emit('timeout', { session: this.sessionID })", this.sessionID)
        this.socket.emit('end_chat_from_client', this.room.roomId);
        console.log("socket.emit('end_chat_from_client', this.room.roomId)", this.room.roomId)

    }

    setTimeout(second) {
        console.log("=> setTimeout(second)", second)
        let time = second;

        this.timeInterval = setInterval(() => {
            time -= 0.1;
            if (time <= 0) {
                this.timeoutHandler()
            }
            $("#timeout-progress-bar").css("width", `${(time / second) * 100}%`);
        }, 100);

    }

    setPreTimeout(second) {
        console.log("=> setPreTimeout(second)", second)
        this.revokePreTimeout()
        console.log("revokePreTimeout()")
        this.preTimeoutID = setTimeout(() => {
            $("#timeoutModal").modal('show');
            this.revokePreTimeout();
            this.setTimeout(10)
        }, second * 1000);
    }

    sendMessage() {
        console.log("(Client) => sendMessage()", this)

        this.revokePreTimeout()
        this.revokeTimeout()

        let message = GeneratingMessage()
        message.setSender(this)
        message.setSentByMe(true)
        message.setRoomId(this.room.roomId)

        console.log(this.currentRoom)
        console.log("(operator)=> sendMessageEmit()", message)
        if (this.ValidateSending(message)) {
            this.socket.emit('client_private_chat_message',
                {
                    roomId: message.roomId,
                    message: message.text,
                    sessionID: this.sessionID
                });
            console.log("socket.emit(client_private_chat_message)", message)
        }
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

    reloadChat() {
        sessionStorage.clear();
        window.location.href = "signin.html";
    }

    endChat() {
        console.log("=> endChat()")
        this.revokePreTimeout()
        this.revokeTimeout()
        this.socket.emit('end_chat_from_client', this.room.roomId);
        console.log("socket.emit('end_chat_from_client', this.room.roomId)", this.room.roomId)
    }

    feedbackWindowInvoke() {
        console.log("=> feedbackWindowInvoke()")
        this.revokePreTimeout()
        this.revokeTimeout()
        $("#feedbackModal").modal('show');
    }

    showWaitingModal() {
        console.log("=> loadWaitingModal()")
        $("#waitingModal").modal('show');
    }

    hideWaitingModal() {
        console.log("=> hideWaitingModal()")
        $("#waitingModal").modal('hide');
    }

    submitFeedback = (e) => {
        console.log("=> submitFeedback()")
        e.preventDefault()
        let FeedbackScore = this.FeedbackScore
        let FeedbackComment = $("#feedback-comment-input").val()

        console.log(FeedbackScore)
        console.log(FeedbackComment)
        console.log('operator_rated emitdeba with session Id', this.sessionID);

        this.socket.emit("operator-rated", {
            operator: this.room.operator.name,
            ratingScore: FeedbackScore,
            ratingComment: FeedbackComment,
            customer: this.name,
            sessionID: this.sessionID,
        })

        console.log("socket.emit('operator-rated')", {
            operator: this.room.operator.name,
            ratingScore: FeedbackScore,
            ratingComment: FeedbackComment,
            customer: this.name,
            sessionID: this.sessionID,
        })
        this.reloadChat()
    }

    displayNotWorkingHours() {
        console.log("=> displayNotWorkingHours()")
        $("#notWorkingHoursModal").modal('show');
    }


    setupSocketListeners() {
        this.socket.on('timeout_callback', () => {
            console.log("socket.on('timeout_callback'")
            sessionStorage.clear();
            window.location.href = "signin.html";
            // loadTimeoutPage()
        });

        this.socket.on('authenticated', (name, number, sessionID) => {
            console.log("socket.on('authenticated')", this);
            if (sessionID) {
                console.log('Authenticated with sessionID:', sessionID);

                sessionStorage.setItem('clientSession', JSON.stringify({ name, number, sessionID }));

                if (window.location.pathname.split('/').pop() == "signin.html") {
                    window.location.href = "chat.html";
                }

                $(".chat-header").show()
                $(".chat-footer").show()

                this.socket.emit('try_connecting');
                console.log("socket.emit('try_connecting')")
                // this.socket.emit('client_rooms');
                // console.log("socket.emit('client_rooms')")


            } else {
                console.error('Authentication failed');
            }
        });

        this.socket.on('join_room', (roomId) => {
            console.log("socket.on('join_room')", roomId)
            this.socket.emit('join_room', roomId);
            console.log("socket.emit('join_room'", roomId)
            this.hideWaitingModal()
        });


        this.socket.on('try_connecting', () => {
            console.log("socket.on('try_connecting')")
            this.socket.emit('try_connecting');
            console.log("socket.emit('try_connecting')")

        });

        this.socket.on('non_working_hours', () => {
            //TODO: aq sxva mesiji unda gamochndes
            console.log("socket.on('non_working_hours')")
            this.displayNotWorkingHours()


        });


        this.socket.on('update_connected_operators', (operators) => {
            console.log("socket.on('update_connected_operators')", operators)
        });

        //rodis ra unda gamochndes
        this.socket.on('load_chat', () => {
            console.log("socket.on('load_chat')")
            sessionStorage.setItem("chat-in-process", "true");
            // loadClientChatPage();
        });

        this.socket.on('load_waiting_page', () => {
            console.log("socket.on('load_waiting_page')")
            sessionStorage.setItem("chat-in-process", "false");
            console.log("sessionStorage", sessionStorage)
            this.showWaitingModal()

            // loadWaitingPage()
        });

        this.socket.on('load_feedback_page', () => {
            console.log("socket.on('load_feedback_page')")
            this.feedbackWindowInvoke()
            // loadFeedbackPage()
        });

        this.socket.on('update', () => {
            console.log("socket.on('update')")
            // loadClientChatPage();
        });

        this.socket.on('operator_connected', () => {
            console.log("socket.on('operator_connected')")
            // SetStatusIndicatorActive(true)
        });

        this.socket.on('operator_disconnected', () => {
            console.log("socket.on('operator_disconnected')")
            // SetStatusIndicatorActive(false)
        });

        this.socket.on('client_rooms', (rooms) => {
            console.log("socket.on('client_rooms')", rooms)
            rooms.forEach((room) => {
                this.room.setRoomId(room.roomId);
                this.room.setRoomStatus(room.status);
                this.room.setOperator(new User(room.name));
                console.log("this.room", this.room)
            });
        });

        this.socket.on("set_operator", (name, number) => {
            this.room.operator = new User(name, number);
            console.log("socket.on('set_operator')", this.room.operator)

            $("#room-header-name").text(this.room.operator.name);
            $("#room-header-avatar").css("background-color", this.room.operator.avatarColor);
            $("#room-header-avatar").text(this.room.operator.name[0]);
        });

        this.socket.on("session-ended", () => {
            console.log("socket.on('session-ended')")
            sessionStorage.clear();
            // window.location.href = "signin.html";
            // location.reload();
        });

        this.socket.on('chat_message', (msg) => {
            console.log("socket.on('chat_message')", msg)

            let sender = null;

            if (!msg.sentByOperator) {
                sender = this
            } else {
                if (this.room.roomId === msg.roomId) {
                    sender = this.room.operator
                    this.setPreTimeout(15)
                }
            }

            console.log("sender", sender)

            const SMS = new Message(msg.roomId, sender, msg.timestamp, msg.text, !msg.sentByOperator)

            if (this.room.roomId === SMS.roomId) {
                this.room.appendChatHistory(SMS)
                if (this.room.roomId === SMS.roomId) {
                    SMS.DisplayChatMessage()
                }
            }
        });

        this.socket.on('operator_typing', () => {
            console.log("socket.on('operator_typing')")
            typingAnimation.style.opacity = "1"
            if (timeoutID) {
                clearTimeout(timeoutID)
            }
            timeoutID = setTimeout(Typing, 2000)
        });

        this.socket.on('chat_history', (history) => {
            console.log("socket.on('chat_history')", history)
            displayChatHistory(history);
        });

        this.socket.on('operator_ended_chat', () => {
            console.log("socket.on('operator_ended_chat')")
            this.socket.emit('leave_room', this.room.id);
            console.log("socket.emit('leave_room'", this.room.id)
            this.feedbackWindowInvoke()
            //TODO:: am dros gamochndes shepasebis forma
            //rac operator_ended_chats is mere davaemiteb imave funqciashi
        });

        this.socket.on('client_ended_chat', () => {
            console.log("socket.on('client_ended_chat')")
            currentRoomId = null;
        });


    }

}