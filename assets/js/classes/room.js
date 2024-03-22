class Room {
  constructor(roomId=null, roomStatus=null, members=[], chatHistory=[]) {
    this.roomId = roomId;
    this.roomStatus = roomStatus;
    this.chatHistory = chatHistory;
    this.members = members;
  }



  setChatHistory(chatHistory) {
    this.chatHistory = chatHistory;
  }

  appendChatHistory(message) {
    this.chatHistory.push(message);
  }

}

class SelectedRoom {
  constructor(room=new Room()) {
    this.room = room;
  }
  getRoom() {
    return this.room;
  }

  setRoom(room) {
    this.room = room;
    sessionStorage.setItem('selectedRoom', JSON.stringify(room));
  } 

}

class RoomMember {
  constructor(name, number) {
    this.name = name;
    this.number = number;
  }
}

export { Room, RoomMember, SelectedRoom  }