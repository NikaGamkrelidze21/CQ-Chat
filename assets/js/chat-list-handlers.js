class ChatListItem {
    constructor(clientName, clientNumber, roomId, status, lastMessageTime = null, lastMessage = null, unreadMessagesAmount = 0) {
        this.clientNumber = clientNumber;
        this.clientName = clientName;
        this.roomId = roomId;
        this.status = status;

        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.unreadMessagesAmount = unreadMessagesAmount;
        this.avatarColor = getRandomColor();
    }

    GetItemParams() {
        return {
            clientName: this.clientName,
            clientNumbet: this.clientNumber,
            roomId: this.roomId,
            status: this.status,

            lastMessage: this.lastMessage,
            lastMessageTime: this.lastMessageTime,
            unreadMessagesAmount: this.unreadMessagesAmount,
            avatarColor: this.avatarColor,


        }
    }

    ChangeRoom = () => {
        console.log("Changing room to " + this.roomId);
        currentRoomId = this.roomId;
        socket.emit('get_chat_history', { roomId: currentRoomId });
    }

    AppendChatListItem() {
        const template = this.ChatListItemTemplate();
        const component = $(template);
        const id = this.roomId;
        $(component).on('click', function (event) {
            event.preventDefault();
            console.log("Changing room to " + id);
            currentRoomId = id;
            socket.emit('get_chat_history', { roomId: currentRoomId });
        }) ;
        console.log("() => AppendChatListItem()", component);
        $("#chatContactTab").append(component);

        // $("#chatContactTab").append(this.ChatListItemTemplate());
        // $("#" + this.roomId).off()
        // $("#" + this.roomId).on('click', function () {
        //     console.log('clicked', this.roomId)
        // });
    }

    ChatListItemTemplate() {
        console.log("() => ChatListItemTemplate()", this.GetItemParams());
        return `
        <li class="contacts-item friends" id=${this.roomId}>
            <div class="avatar avatar-online d-flex justify-content-center  justify-center align-items-center" style="background-color: ${this.avatarColor}">
                ${this.clientName ? this.clientName[0].toUpperCase() : '*'}
            </div>
            <div class="contacts-content">
                <div class="contacts-info">
                    <h6 class="chat-name text-truncate">${this.clientName}</h6>
                    <div class="chat-time">${this.lastMessageTime}</div>
                </div>
                <div class="contacts-texts">
                    <p class="text-truncate">${this.lastMessage}</p>
                </div>
            </div>
    </li>
        `
    }

}

function DisplayChatList(roomList) {
    console.log("() => DisplayChatList(clientList)", roomList);
    $("#chatContactTab").empty();

    let currTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    clientList = roomList.map(client => (new ChatListItem(
        client.clientName,
        client.clientNumber,
        client.roomId,
        client.status,
        currTime
    )));

    clientList.forEach(client => {
        client.AppendChatListItem();
    });

}
