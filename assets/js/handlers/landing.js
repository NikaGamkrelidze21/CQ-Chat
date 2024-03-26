import Operator from '../classes/users/operator.js'
import Client from '../classes/users/client.js'


export function LandingAuth() {

    var SELF = null
    var name = null
    var number = null;
    var sessionID = null;

    var authentificationPage = null
    var storedSession = null
    var chatPage = null

    switch (window.location.pathname.split('/').pop()) {
        case "signin.html":
            authentificationPage = "operator"
            break;
        case "signin-client.html":
            authentificationPage = "client"
            break;
        case "chat-operator.html":
            chatPage = "operator"
            break;
        case "chat-client.html":
            chatPage = "client"
            break;

        default:
            chatPage = null
            authentificationPage = null
            break;
    }

    if (authentificationPage == "operator" || chatPage == "operator") {
        storedSession = JSON.parse(sessionStorage.getItem('operatorSession'));
    } else {
        storedSession = JSON.parse(sessionStorage.getItem('clientSession'));
    }



    console.log('storedSession', storedSession)

    if (storedSession != null) {
        name = storedSession.name;
        number = storedSession.number;
        sessionID = storedSession.sessionID;
    }


    if (name && number && sessionID) {
        if (authentificationPage == "operator") {
            SELF = new Operator(name, number, sessionID)
            window.location.href = "chat-operator.html";
            console.log("SELF", SELF)
        } else if (authentificationPage == "client") {
            SELF = new Client(name, number, sessionID)
            window.location.href = "chat-client.html";
            console.log("SELF", SELF)

        } else if (chatPage == "operator") {
            SELF = new Operator(name, number, sessionID)
            console.log('reconnecting', SELF)
        }

        else if (chatPage == "client") {
            SELF = new Client(name, number, sessionID)
            console.log('reconnecting', SELF)
        }
    }

}