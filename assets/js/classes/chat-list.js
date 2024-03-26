import { DisplayMessageHistory } from "../handlers/chat-event-handler.js";

export class ChatListItem {
    constructor(self, room, unreadMessagesAmount = 0) {
        console.log("(consstructor) => ChatListItem() ", room);
        this.clientNumber = room.client.number;
        this.clientName = room.client.name;
        this.roomId = room.roomId;
        this.status = room.status;

        this.lastMessageTime = "Some time ago";
        this.lastMessage = "No messages yet";
        this.unreadMessagesAmount = unreadMessagesAmount;
        this.avatarColor = room.client.avatarColor;

        this.room = room;
        this.self = self;
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
    // TODO somehting do with displahying
    ChangeRoom = () => {
        console.log("() => ChangeRoom()",  this);

        this.self.ROOMS.forEach(element => {
            if (element.roomId === this.roomId) {
                console.log("element", element, "SELECTEDROOM", this.self.currentRoom);
                this.self.setCurrentRoom(element)
            }
        });
        
        this.self.socket.emit('get_chat_history', { roomId: this.self.currentRoom.roomId });
        $(".chat-header").show()
        $(".chat-footer").show()
        
        let messages = this.self.currentRoom.chatHistory;

        console.log("messages", messages)  
        
        DisplayMessageHistory(messages)
        this.ChangeChatHeader()
    }

    ChangeChatHeader()  {
        console.log("() => ChangeChatHeader()", this);
        $("#chat-header-name").text(this.clientName);
    }

    AppendChatListItem() {
        const template = this.ChatListItemTemplate();
        const component = $(template);
        console.log("() => AppendChatListItem()", component);
        $(component).on('click', this.ChangeRoom.bind(this));
        $("#chatContactTab").append(component);
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

export class ChatList {
    constructor(chatList = []) {
        this.chatList = chatList;
    }
}