import { ChatListItem } from "../classes/chat-list.js";
function DisplayChatList(roomList) {
    console.log("() => DisplayChatList(clientList)", roomList);
    $("#chatContactTab").empty();

    let currTime = "need to fix this"
    // new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    console.log(roomList[0] && roomList[0].members.client)

    const clientList = roomList.map(room => (new ChatListItem(room)));

    clientList.forEach(client => {
        client.AppendChatListItem();
    });

}

export { DisplayChatList }
