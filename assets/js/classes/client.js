class Client {
    constructor(name = null, number = null, sessionID = null, avatarColor = 'black', room = null) {
        this.name = name;
        this.number = number;
        this.sessionID = sessionID;
        this.avatarColor = avatarColor;
        this.room = room;
    }

}
class Operator {
    constructor(name = null, number = null, sessionID = null, avatarColor = 'black', rooms = []) {
        this.name = name;
        this.number = number;
        this.sessionID = sessionID;
        this.avatarColor = avatarColor;
        this.rooms = rooms;
    }
}