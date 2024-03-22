class Room {
  constructor(roomId, roomStatus, members=[], chatHistory=[]) {
    this.roomId = roomId;
    this.chatHistory = chatHistory;
    this.members = members;
  }

  setChatHistory(chatHistory) {
    this.chatHistory = chatHistory;
  }

}

class RoomMember {
  constructor(name, number) {
    this.name = name;
    this.number = number;
  }
}

export { Room, RoomMember }