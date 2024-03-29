import Client from "./classes/users/client.js";
import Operator from "./classes/users/operator.js";
import { LandingAuth } from "./handlers/landing.js";
import {SendMessageButtonHandler_Operator, SendMessageButtonHandler_Client} from "./handlers/chat-event-handler.js";

// var socket = io('https://chat.communiq.ge/namespace1', { transports: ['websocket'] });


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

// const storedSession = JSON.parse(sessionStorage.getItem('operatorSession')) || {};
// console.log('storedSession', storedSession)

// let SELF = null
// let name = null
// let number = null;
// let sessionID = null;


// name = storedSession.name;
// number = storedSession.number;
// sessionID = storedSession.sessionID;

// if (name && number && sessionID) {
//     if (window.location.pathname.split('/').pop() == "signin.html") {
//         SELF = new Operator(name, number, sessionID)
//         window.location.href = "chat-operator.html";
//         console.log("SELF", SELF)
//     } else if (window.location.pathname.split('/').pop() == "signin-client.html") {
//         SELF = new Client(name, number, sessionID)
//         window.location.href = "chat-client.html";
//         console.log("SELF", SELF)

//     } else if (window.location.pathname.split('/').pop() == "chat-operator.html") {
//         SELF = new Operator(name, number, sessionID)
//         console.log('reconnecting', SELF)
//     }

//     else if (window.location.pathname.split('/').pop() == "chat-client.html") {
//         SELF = new Client(name, number, sessionID)
//         console.log('reconnecting', SELF)
//     }
// }

async function submitAuthFormOperator(username, number) {
    console.log("(Operator) => submitAuthFormOperator()", username, number)

    if (username && number) {
        SELF = new Operator(username, number)

        SELF.socket.connect();
    }
};

async function submitAuthFormClient(username, number) {
    console.log("(Client) => submitAuthFormClient()", username, number)

    if (username && number) {
        SELF = new Client(username, number)
        SELF.socket.connect();
    }
};

function DetectUserType() {
    if (window.location.pathname.split('/').pop() == "signin.html" || window.location.pathname.split('/').pop() == "chat-operator.html" ){
        console.log("() => DetectUserType() operator")
        return "operator"
    } else {
        console.log("() => DetectUserType() client")
        return "client"
    }
}



$(document).ready(function () {
    // $("#elementId").css("background-color", randomColor);
    // skt.join();
    // Main Navigation Tab

    $('textarea').on('keydown', function () {
        alert("Asdasd")
    });

    $("#authentication-form").on('submit', async function asy(e) {
        e.preventDefault();

        var name = $('input[id="auth-input-name"]').val();
        var number = $('input[id="auth-input-number"]').val();

        if (DetectUserType() == "operator") {
            submitAuthFormOperator(name, number)
        } else if (DetectUserType() == "client") {
            submitAuthFormClient(name, number)
        }
    });

    $("#send-message-button").on('click', function () {
        SELF.sendMessage()
    });


    // $(".chat-header").hide()
    // $(".chat-footer").hide()

    $('#mainNavTab a').on('click', function (e) {
        e.preventDefault()
        $(this).tab('show');
    })

    // Layout Click Events

    $("#authentication-form input[id='auth-input-name']").on('keydown', function (e) {
        var isNumeric = /^[0-9]+$/.test(e.key);

        if (isNumeric) {
            e.preventDefault();
        }
    });  // End of authentication-form input keydown event   

    $("#authentication-form input[id='auth-input-number']").on('keydown', function (e) {
        if (e.key === "Backspace" || e.key === "Delete" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Tab" || e.key === "Enter" || e.ctrlKey) {
            return;
        }
        var isNumeric = /^[0-9]+$/.test(e.key);
        if (!isNumeric) {
            e.preventDefault();
        }
    });  // End of authentication-form input keydown event



    $('#chats-tab').on('click', function (e) {
        e.preventDefault()
        $("body").removeClass("calls-tab-open friends-tab-open profile-tab-open");
        $("body").addClass("chats-tab-open");
    })
    $('#calls-tab').on('click', function (e) {
        e.preventDefault()
        $("body").removeClass("chats-tab-open friends-tab-open profile-tab-open");
        $("body").addClass("calls-tab-open");
    })
    $('#friends-tab').on('click', function (e) {
        e.preventDefault()
        $("body").removeClass("calls-tab-open chats-tab-open profile-tab-open");
        $("body").addClass("friends-tab-open");
    })
    $('#profile-tab').on('click', function (e) {
        e.preventDefault()
        $("body").removeClass("calls-tab-open friends-tab-open chats-tab-open");
        $("body").addClass("profile-tab-open");
    })

    //Chat Info
    $('[data-chat-info-toggle]').on('click', function (e) {
        e.preventDefault()
        $(".chat-info").addClass("chat-info-visible");
    })
    $('[data-chat-info-close]').on('click', function (e) {
        e.preventDefault()
        $(".chat-info").removeClass("chat-info-visible");
    })


    $('.contacts-list .contacts-link').on('click', function () {
        $(".main").addClass("main-visible");
    })
    $('.contacts-list .media-link').on('click', function () {
        $(".main").addClass("main-visible");
    })
    $('[data-profile-edit]').on('click', function () {
        $(".main").addClass("main-visible");
    })

    // Toggle chat
    $('[data-close]').on('click', function (e) {
        e.preventDefault()
        $(".main").removeClass("main-visible");
    })

    //Popup Gallery
    $('.chat-content').magnificPopup({

        delegate: 'a.popup-media',
        type: 'image',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
        }
    });

    //Chat Dropdown Filter
    $('[data-chat-filter]').on('click', function () {
        let selectedOption = $(this).data('select');
        $('[data-chat-filter-list]').text($(this).text());
        if (selectedOption === 'all-chats') {
            $('[data-chat-list]').find('li').each(function () {
                $(this).show();
            });
        } else {
            $('[data-chat-list]').find('li').each(function () {
                $(this).hide();
            });
            $('[data-chat-list] li.' + selectedOption).show();
        }
    });

    //Call Dropdown Filter
    $('[data-call-filter]').on('click', function () {
        let selectedOption = $(this).data('select');
        $('[data-call-filter-list]').text($(this).text());
        if (selectedOption === 'all-calls') {
            $('[data-call-list]').find('li').each(function () {
                $(this).show();
            });
        } else {
            $('[data-call-list]').find('li').each(function () {
                $(this).hide();
            });
            $('[data-call-list] li.' + selectedOption).show();
        }
    });

    // Create Group
    $('#createGroup').modalSteps({
        btnNextHtml: "Next",
        btnLastStepHtml: "Finish",
        disableNextButton: false,
        completeCallback: function () { },
        callbacks: {},
        getTitleAndStep: function () { }
    });

    // File Input
    $(document).on('change', '.custom-file-input', function (event) {
        $(this).next('.custom-file-label').html(event.target.files[0].name);
    })


    // SVG File Inject
    SVGInject(document.getElementsByClassName('injectable'));


    //Toggle Appbar
    $('#appNavTab .nav-link').on('click', function () {
        $(".backdrop").addClass("backdrop-visible");
        $(".appnavbar-content").addClass("appnavbar-content-visible");
        $("#appNavTab .nav-link").removeClass("active");
        $(".chat-info").removeClass("chat-info-visible");
    })

    //Backdrop
    $('.backdrop').on('click', function () {
        $(".backdrop").removeClass("backdrop-visible");
        $(".appnavbar-content").removeClass("appnavbar-content-visible");
        $("#appNavTab .nav-link").removeClass("active");
    })

    //App Closer
    $('[data-apps-close]').on('click', function (e) {
        e.preventDefault()
        $("body").removeClass("apps-visible");
        $(".appbar").toggleClass("appbar-hidden");
        $(".backdrop").removeClass("backdrop-visible");
    })

    // Appbar toggler
    $('[data-toggle-appbar]').on('click', function (e) {
        e.preventDefault()
        $(".appbar").removeClass("appbar-hidden");
        $(".backdrop").addClass("backdrop-visible");
    })

    // Appcontent Close
    $('[data-appcontent-close]').on('click', function (e) {
        e.preventDefault()
        $(".backdrop").removeClass("backdrop-visible");
        $(".appnavbar-content").removeClass("appnavbar-content-visible");
        $("#appNavTab .nav-link").removeClass("active");
    })


    // Todo task done
    $('.todo-item input[type="checkbox"]').click(function () {
        if ($(this).is(":checked")) {
            $(this).parents('.todo-item').addClass('todo-task-done');
        } else if ($(this).is(":not(:checked)")) {
            $(this).parents('.todo-item').removeClass('todo-task-done');
        }
    });

    // Responsive media query to remove appbar in smaller screen on initial load & resize
    function checkSize() {
        if ($(window).width() <= 1200) {
            $(".appbar").addClass("appbar-hidden");
        } else {
            $(".appbar").removeClass("appbar-hidden");
        }
    }
    checkSize();
    $(window).resize(checkSize);


    // Emojione Area
    $("#messageInput").emojioneArea();


});


// SEND MESSAGE START


// Usage:
