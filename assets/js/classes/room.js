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

class RoomMember {
  constructor(name, number) {
    this.name = name;
    this.number = number;
  }
}

export { Room, RoomMember, SelectedRoom  }