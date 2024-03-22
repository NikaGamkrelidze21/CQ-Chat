import { SELF, socket } from "../socket-operator.js";
import { getRandomColor } from "../components/random-color.js";

export class ChatListItem {
    constructor(clientName, clientNumber, roomId, status, lastMessageTime = null, avatarColor = null, lastMessage = null,   unreadMessagesAmount = 0 ) {
        this.clientNumber = clientNumber;
        this.clientName = clientName;
        this.roomId = roomId;
        this.status = status;
        
        this.lastMessageTime = lastMessageTime;
        this.lastMessage = lastMessage;
        this.unreadMessagesAmount = unreadMessagesAmount;
        this.avatarColor = avatarColor ? avatarColor : getRandomColor();
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
        console.log("() => ChangeRoom()", this.roomId);
        SELF.currentRoomId = this.roomId;
        socket.emit('get_chat_history', { roomId: SELF.currentRoomId });
    }

    AppendChatListItem() {
        const template = this.ChatListItemTemplate();
        const component = $(template);
        console.log("() => AppendChatListItem()", component);
        $(component).on('click', this.ChangeRoom.bind(this) );        
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