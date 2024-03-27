
class Room {
  constructor(roomId = null, roomStatus = null, chatHistory = [], client = null, clientJoinedTime = null, operator = null, operatorJoinedTime = null, createdTime = null, finishedTime = null, finishedBy = null, feedbackScore=null, feedbackComment = null, callback = null, transfered = false, transferedTime = null, transferedTo = null) {
    this.roomId = roomId;
    this.roomStatus = roomStatus;
    this.chatHistory = chatHistory;
    this.client = client;
    this.clientJoinedTime = clientJoinedTime;

    this.operator = operator;
    this.operatorJoinedTime = operatorJoinedTime;


    this.createdTime = createdTime;

    this.finishedTime = finishedTime;
    this.finishedBy = finishedBy;

    // TODO: Add feedback class
    this.feedbackScore = feedbackScore;
    this.feedbackComment = feedbackComment;

    // TODO: Add callback class
    this.callback = callback;

    this.transfered = transfered;
    this.transferedTime = transferedTime;
    this.transferedTo = transferedTo;
  }

  setRoomId(roomId) { this.roomId = roomId; }
  getRoomId() { return this.roomId; }

  setRoomStatus(roomStatus) { this.roomStatus = roomStatus; }
  getRoomStatus() { return this.roomStatus; }

  setClient(client) { this.client = client; }
  getClient() { return this.client; }

  setClientJoinedTime(clientJoinedTime) { this.clientJoinedTime = clientJoinedTime; }
  getClientJoinedTime() { return this.clientJoinedTime; }

  setOperator(operator) { this.operator = operator; }
  getOperator() { return this.operator; }

  setOperatorJoinedTime(operatorJoinedTime) { this.operatorJoinedTime = operatorJoinedTime; }
  getOperatorJoinedTime() { return this.operatorJoinedTime; }

  setCreatedTime(createdTime) { this.createdTime = createdTime; }
  getCreatedTime() { return this.createdTime; }

  setFinishedTime(finishedTime) { this.finishedTime = finishedTime; }
  getFinishedTime() { return this.finishedTime; }

  setFinishedBy(finishedBy) { this.finishedBy = finishedBy; }
  getFinishedBy() { return this.finishedBy; }

  setFeedbackScore(feedbackScore) { this.feedbackScore = feedbackScore; }
  getFeedbackScore() { return this.feedbackScore; }

  setFeedbackComment(feedbackComment) { this.feedbackComment = feedbackComment; }
  getFeedbackComment() { return this.feedbackComment; }

  setCallback(callback) { this.callback = callback; }
  getCallback() { return this.callback; }

  setTransfered(transfered) { this.transfered = transfered; }
  getTransfered() { return this.transfered; }

  setTransferedTime(transferedTime) { this.transferedTime = transferedTime; }
  getTransferedTime() { return this.transferedTime; }

  setTransferedTo(transferedTo) { this.transferedTo = transferedTo; }
  getTransferedTo() { return this.transferedTo; }

  getChatHistory() { return this.chatHistory; }
  appendChatHistory(message) { this.chatHistory.push(message); }
  setChatHistory(chatHistory) { this.chatHistory = chatHistory }


  displayRoom() {
    console.log("=> displayRoom()")
    // chatContactTab
    $("#chatContactTab").append(this.roomListItemTemplate());
    $(`#${this.roomId}`).on('click', () => {
      console.log("(click) => displayRoom()", this)
      this.operator.currentRoom = this
      console.log("new current room", this)

      this.showChatHeaderFooter()

      this.setUpRoomHeader()

      this.getRoomChatHistory()
      // this.displayChatHistory()
    })
  }

  setUpRoomHeader() {
    console.log("() => setUpRoomHeader()", this)
    $("#chat-header-name").empty()
    $("#chat-header-name").text(this.client.name)
  }

  emptyChatHistory() {
    console.log("() => emptyChatHistory()", this)
    $("#chat-history").empty()
  }

  emptyChatInput() {
    console.log("() => emptyChatInput()", this)
    $("#chat-input").val('')
  }

  emptyRoomList() {
    console.log("() => emptyRoomList()", this)
    $("#chatContactTab").empty()
  }

  hideChatHeaderFooter() {
    console.log("() => hideChatHeaderFooter()", this)
    $(".chat-header").hide()
    $(".chat-footer").hide()
  }

  showChatHeaderFooter() {
    console.log("() => showChatHeaderFooter()", this)
    $(".chat-header").show()
    $(".chat-footer").show()
  }

  getRoomChatHistory() {
    console.log("() => getRoomChatHistory()", this)
    this.operator.socket.emit('get_chat_history', { roomId: this.roomId });
  }

  roomListItemTemplate() {
    console.log("() => ChatListItemTemplate()", this);
    return `
    <li class="contacts-item friends" id=${this.roomId}>
        <div class="avatar avatar-online d-flex justify-content-center  justify-center align-items-center" style="background-color: ${this.client.avatarColor}">
            ${this.client ? this.client.name[0].toUpperCase() : '*'}
        </div>
        <div class="contacts-content">
            <div class="contacts-info">
                <h6 class="chat-name text-truncate">${this.client.name}</h6>
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

class SelectedRoom {
  constructor(room = new Room()) {
    this.room = room;
  }

  getRoom() {
    return this.room;
  }

  setRoom(room) {
    this.room = room;
    // sessionStorage.setItem('selectedRoom', JSON.stringify(room));
    $(".chat-header").show()
    $(".chat-footer").show()
    $("#chat-header-name").empty()
    $("#chat-header-name").append(`
      <div class="media chat-name align-items-center text-truncate">
          <div class="avatar text-light d-none d-sm-inline-block mr-3"
              style="background-color: ${room.members.client.avatarColor}">
              <span style="font-size: x-large; font-weight: 600;">
                  A
                  <!-- <img class="injectable" src="./../assets/media/heroicons/outline/user-group.svg" alt=""> -->
              </span>
          </div>

          <div class="media-body align-self-center ">
              <h6 class="text-truncate mb-0">${room.members.client.name}</h6>
          </div>
      </div>
    `)
  }

}

class OperatorRoom {
  constructor(roomId = null, client = null, operator = null, chatHistory = []) {
    this.roomId = roomId;
    this.client = client;
    this.operator = operator;
    this.chatHistory = chatHistory;
  }

}

export { Room, SelectedRoom }