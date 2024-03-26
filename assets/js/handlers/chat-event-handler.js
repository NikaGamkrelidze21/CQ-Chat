import Message  from "../classes/message.js"


function ValidateSending(sender, text, sentByOperator, time, currentRoomId) {
    console.log("=> ValidateSending()", sender, text, sentByOperator, time)
    if (sender && text && sentByOperator && time && currentRoomId) {
        console.log("=> ValidateSending() => true")
        return true
    }
    else {
        console.log("=> ValidateSending() => false")
        return false
    }
}

function DisplayMessageHistory(messages) {
    console.log("=> DisplayMessageHistory()", messages)
    $("#chat-content .container").empty();
    messages.forEach((message) => {
        // console.log("message", message)
        message.DisplayChatMessage();
    })
}

export function GeneratingMessage(){
    let text = $("#messageInput").val();
    let time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let message = new Message()
    
    message.setText(text)
    message.setTime(time)
    
    console.log("=> GeneratingMessage()", message)
    return message
}

function SendMessageButtonHandler_Operator() {
    console.log("=> SendMessageButtonHandler_Operator()")
    try {
        let text = $("#messageInput").val();
        let time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Generating Message Object Params
        if (ValidateSending(sender, text, sentByOperator, time, SELF.currentRoomId)) {
            const SMS = new Message(SELF.currentRoomId, sender, time, text, sentByOperator);
            SMS.SendMessage();
        }
    } catch (error) {
        console.error(error)
    }

    // constructing Message Object

}

function SendMessageButtonHandler_Client() {
    console.log("=> SendMessageButtonHandler_Client()")
    try {
        let sender = SELF.getName();
        let text = $("#messageInput").val();
        let sentByOperator = sessionStorage.getItem("operatorSession") ? true : false;
        let time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Generating Message Object Params
        if (ValidateSending(sender, text, sentByOperator, time, SELF.currentRoomId)) {
            const SMS = new Message(SELF.currentRoomId, sender, time, text, sentByOperator);
            SMS.SendMessage();
        }
    } catch (error) {
        console.error(error)
    }

    // constructing Message Object

}

function SendMessageButtonHandler() {
    console.log("=> SendMessageButtonHandler()")
    try {
        let sender = SELF.getName();
        let text = $("#messageInput").val();
        let sentByOperator = sessionStorage.getItem("operatorSession") ? true : false;
        let time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Generating Message Object Params
        if (ValidateSending(sender, text, sentByOperator, time, SELF.currentRoomId)) {
            const SMS = new Message(SELF.currentRoomId, sender, time, text, sentByOperator);
            SMS.SendMessage();
        }
    } catch (error) {
        console.error(error)
    }

    // constructing Message Object

}

export { SendMessageButtonHandler_Client, SendMessageButtonHandler_Operator, DisplayMessageHistory, ValidateSending}