import { ChatListItem } from "../classes/chat-list.js";

function DisplayChatList(self, roomList) {
    console.log("(client) => DisplayChatList()", self, roomList);
    $("#chatContactTab").empty();

    let currTime = "need to fix this"
    // new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // console.log(roomList[0] && roomList[0].members.client)

    const clientList = roomList.map(room => (new ChatListItem(self, room)));

    clientList.forEach(client => {
        client.AppendChatListItem();
    });

}

export { DisplayChatList }
