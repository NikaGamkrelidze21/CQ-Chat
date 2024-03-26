class Room {
  constructor(roomId = null, roomStatus = null, members = [], chatHistory = [], client = null, clientJoinedTime = null, operator = null, operatorJoinedTime = null, administrator = null, administratorJoinedTime = null, support = null, supportJoinedTime = null, createdTime = null, createdBy = null, finishedTime = null, finishedBy = null, feedback = null, callback = null, transfered = false, transferedTime = null, transferedTo = null) {
    this.roomId = roomId;
    this.roomStatus = roomStatus;
    this.chatHistory = chatHistory;

    // TODO: remove this members array
    this.members = members;

    this.client = client;
    this.clientJoinedTime = clientJoinedTime;

    this.operator = operator;
    this.operatorJoinedTime = operatorJoinedTime;

    // TODO: Add administrator class
    this.administrator = administrator;
    this.administratorJoinedTime = administratorJoinedTime;

    // TODO: Add support class
    this.support = support;
    this.supportJoinedTime = supportJoinedTime;

    this.createdTime = createdTime;
    this.createdBy = createdBy;

    this.finishedTime = finishedTime;
    this.finishedBy = finishedBy;

    // TODO: Add feedback class
    this.feedback = feedback;

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

  setAdministrator(administrator) { this.administrator = administrator; }
  getAdministrator() { return this.administrator; }

  setAdministratorJoinedTime(administratorJoinedTime) { this.administratorJoinedTime = administratorJoinedTime; }
  getAdministratorJoinedTime() { return this.administratorJoinedTime; }

  setSupport(support) { this.support = support; }
  getSupport() { return this.support; }

  setSupportJoinedTime(supportJoinedTime) { this.supportJoinedTime = supportJoinedTime; }
  getSupportJoinedTime() { return this.supportJoinedTime; }

  setCreatedTime(createdTime) { this.createdTime = createdTime; }
  getCreatedTime() { return this.createdTime; }

  setCreatedBy(createdBy) { this.createdBy = createdBy; }
  getCreatedBy() { return this.createdBy; }

  setFinishedTime(finishedTime) { this.finishedTime = finishedTime; }
  getFinishedTime() { return this.finishedTime; }

  setFinishedBy(finishedBy) { this.finishedBy = finishedBy; }
  getFinishedBy() { return this.finishedBy; }

  setFeedback(feedback) { this.feedback = feedback; }
  getFeedback() { return this.feedback; }

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