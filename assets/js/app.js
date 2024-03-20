// START OF SOCKET EVENTS
var socket = io('https://chat.communiq.ge/namespace1',
    { transports: ['websocket'] });

let name = null;
let currentRoomId = null;

const sessionStorage = window.sessionStorage;
const storedSession = JSON.parse(sessionStorage.getItem('clientSession')) || {};

name = storedSession.name;

function isAuth() {
    return sessionStorage.getItem('clientSession') !== null;
}

function socketConnect() {
    console.log("() => socketConnect()")

    let name = storedSession.name
    let number = storedSession.number;
    let sessionID = storedSession.sessionID;

    socket.auth = {
        name: name,
        number: number,
        sessionID: sessionID,
        type: "client",
    };
    socket.connect();
}

if (isAuth()) {
    socketConnect()
}


function submitAuthForm(username, number) {
    console.log("=> submitAuthForm()")

    if (username && number) {
        socket.auth = {
            username,
            number,
            sessionID: "",
            type: "client",
        };

        let sessionID = socket.auth.sessionID;

        socket.connect();
        socket.emit('try_connecting');
    }
};

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

// Nnd of SOCKET events

$(document).ready(function () {
    // skt.join();
    // Main Navigation Tab
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

    $("#authentication-form").on('submit', function (e) {
        e.preventDefault();
        var form = $(this);
        var name = form.find('input[id="auth-input-name"]').val();
        var number = form.find('input[id="auth-input-number"]').val();

        console.log(name, number)
        submitAuthForm(name, number);

        if (name != '' && number != '') {
            window.location.href = "index.html";
        } else {
            alert('Invalid Username or Password');
        }
    });

    // SEND MESSAGE START
    function getRandomColor() {
        var h = Math.floor(Math.random() * 360);
        var s = Math.floor(Math.random() * 100) + 50; // ensure saturation is at least 50%
        var l = Math.floor(Math.random() * 50) + 30; // ensure lightness is between 30% and 80%
        return `hsl(${h},${s}%,${l}%)`;
    }
    
    // Usage:
    var randomColor = getRandomColor();
    $("#elementId").css("background-color", randomColor);

    $("#send-message-button").on('click', () => {
        const avatarColor = getRandomColor();
        const clientName = 'ნიკა'
        const msg = $("#messageInput").val();
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        console.log("=> send-message-button.click()", msg, time)
        DisplayChatMessage({ msg: msg, time: time, sender: "Client", clientName: clientName, avatarColor: avatarColor });
        InputCleanup();
        scrollToBottom("#chat-content")
    });

    function InputCleanup() {
        $("#messageInput").val("");
        $("#messageInput").text("");
        $(".emojionearea-editor").val("");
        $(".emojionearea-editor").text("");
    }

    function scrollToBottom(divId) {
        var div = $(divId);
        div.scrollTop(div.prop('scrollHeight'));
    }

    function RecievedMessageTemplate({msg, time, sender, avatarColor }) {
        return `                                
        <div class="message">
        <div class="message-wrapper">
            <div class="message-content">
                <h6 class="text-dark">${sender}</h6>
                <span>${msg}</span>
            </div>
        </div>
        
        <div class="message-options">
            <div class="avatar avatar-sm" style="background-color: ${avatarColor}; display: flex; justify-content: center; align-items: center; font-size: x-large; outline: 0.5rem solid white;" >
                ${sender.charAt(0)}
            </div>
            <span class="message-date">${time}</span>
            <div class="dropdown">
                <a class="text-muted" href="#" data-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <!-- Default :: Inline SVG -->
                    <svg class="hw-18" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>

                    <!-- Alternate :: External File link -->
                    <!-- <img class="injectable hw-18" src="./../assets/media/heroicons/outline/dots-horizontal.svg" alt="message options"> -->
                </a>

                <div class="dropdown-menu">
                    <a class="dropdown-item d-flex align-items-center" href="#">
                        <!-- Default :: Inline SVG -->
                        <svg class="hw-18 mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>

                        <!-- Alternate :: External File link -->
                        <!-- <img class="injectable hw-18 mr-2" src="./../assets/media/heroicons/outline/duplicate.svg" alt="message options"> -->
                        <span>Copy</span>
                    </a>
                    <a class="dropdown-item d-flex align-items-center" href="#">
                        <!-- Default :: Inline SVG -->
                        <svg class="hw-18 mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>

                        <!-- Alternate :: External File link -->
                        <!-- <img class="injectable hw-18 mr-2" src="./../assets/media/heroicons/outline/reply.svg" alt="message replay"> -->
                        <span>Replay</span>
                    </a>
                    <a class="dropdown-item d-flex align-items-center" href="#">
                        <!-- Default :: Inline SVG -->
                        <svg class="hw-18 rotate-y mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>

                        <!-- Alternate :: External File link -->
                        <!-- <img class="injectable rotate-y hw-18 mr-2" src="./../assets/media/heroicons/outline/reply.svg" alt="message forward"> -->
                        <span>Forward</span>
                    </a>
                    <a class="dropdown-item d-flex align-items-center" href="#">
                        <!-- Default :: Inline SVG -->
                        <svg class="hw-18 mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>

                        <!-- Alternate :: External File link -->
                        <!-- <img class="injectable hw-18 mr-2" src="./../assets/media/heroicons/outline/star.svg" alt="message favourite"> -->
                        <span>Favourite</span>
                    </a>
                    <a class="dropdown-item d-flex align-items-center text-danger" href="#">
                        <!-- Default :: Inline SVG -->
                        <svg class="hw-18 mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>

                        <!-- Alternate :: External File link -->
                        <!-- <img class="injectable hw-18 mr-2" src="./../assets/media/heroicons/outline/trash.svg" alt="message delete"> -->
                        <span>Delete</span>
                    </a>
                </div>
            </div>
        </div>
    </div>`
    }

    function SentMessageTemplate({ msg, time, clientName, avatarColor }) {
        return `
        <div class="message self">
        <div class="message-wrapper">
            <div class="message-content">${msg}</div>
        </div>
        <div class="message-options">
            <div class="avatar avatar-sm" style="background-color: ${avatarColor}; display: flex; justify-content: center; align-items: center; font-size: x-large; outline: 0.5rem solid white;" >${clientName.charAt(0)}</div>

            <span class="message-date">${time}</span>
            <span class="message-status">Edited</span>

            <div class="dropdown">
                <a class="text-muted" href="#" data-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <!-- Default :: Inline SVG -->
                    <svg class="hw-18" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>

                    <!-- Alternate :: External File link -->
                    <!-- <img class="injectable hw-18" src="./../assets/media/heroicons/outline/dots-horizontal.svg" alt="message options"> -->
                </a>

                <div class="dropdown-menu">
                    <a class="dropdown-item d-flex align-items-center" href="#">
                        <!-- Default :: Inline SVG -->
                        <svg class="hw-18 mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>

                        <!-- Alternate :: External File link -->
                        <!-- <img class="injectable hw-18 mr-2" src="./../assets/media/heroicons/outline/duplicate.svg" alt="message options"> -->
                        <span>Copy</span>
                    </a>
                    <a class="dropdown-item d-flex align-items-center" href="#">
                        <!-- Default :: Inline SVG -->
                        <svg class="hw-18 mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>

                        <!-- Alternate :: External File link -->
                        <!-- <img class="injectable hw-18 mr-2" src="./../assets/media/heroicons/outline/pencil.svg" alt="message edit"> -->
                        <span>Edit</span>
                    </a>
                    <a class="dropdown-item d-flex align-items-center" href="#">
                        <!-- Default :: Inline SVG -->
                        <svg class="hw-18 mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>

                        <!-- Alternate :: External File link -->
                        <!-- <img class="injectable hw-18 mr-2" src="./../assets/media/heroicons/outline/reply.svg" alt="message replay"> -->
                        <span>Replay</span>
                    </a>
                    <a class="dropdown-item d-flex align-items-center" href="#">
                        <!-- Default :: Inline SVG -->
                        <svg class="hw-18 rotate-y mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>

                        <!-- Alternate :: External File link -->
                        <!-- <img class="injectable rotate-y hw-18 mr-2" src="./../assets/media/heroicons/outline/reply.svg" alt="message forward"> -->
                        <span>Forward</span>
                    </a>
                    <a class="dropdown-item d-flex align-items-center" href="#">
                        <!-- Default :: Inline SVG -->
                        <svg class="hw-18 mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>

                        <!-- Alternate :: External File link -->
                        <!-- <img class="injectable hw-18 mr-2" src="./../assets/media/heroicons/outline/star.svg" alt="message favourite"> -->
                        <span>Favourite</span>
                    </a>
                    <a class="dropdown-item d-flex align-items-center text-danger" href="#">
                        <!-- Default :: Inline SVG -->
                        <svg class="hw-18 mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>

                        <!-- Alternate :: External File link -->
                        <!-- <img class="injectable hw-18 mr-2" src="./../assets/media/heroicons/outline/trash.svg" alt="message delete"> -->
                        <span>Delete</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
        `
    }

    function DisplayChatMessage(msg) {
        console.log("=> DisplayChatMessage()")
        if (msg.sender === "Client") {
            $("#chat-content .container").append(SentMessageTemplate(msg));
        }

        else if (msg.sender === "Operator") {
            $("#chat-content .container").append(RecievedMessageTemplate(msg));
            scrollToBottom("#chat-content")
        }
    }

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


