import { getRandomColor } from '../components/random-color.js';
class User {
    constructor(name = null, number = null, sessionID = null, avatarColor = getRandomColor()) {
        this.name = name;
        this.number = number;
        this.sessionID = sessionID;
        this.avatarColor = avatarColor;
    }
    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }
    setSessionID(sessionID) {
        this.sessionID = sessionID;
    }
    getSessionID() {
        return this.sessionID;
    }
    getNumber() {
        return this.number;
    }
    setNumber(number) {
        this.number = number;
    }
    getAvatarColor() {
        return this.avatarColor;
    }
    setAvatarColor(avatarColor) {
        this.avatarColor = avatarColor;
    }
    
}

class Client extends User {
    constructor(name, number, sessionID, avatarColor) {
        super(name, number, sessionID, avatarColor);
    }
}

class Operator extends User {
    constructor(name, number, sessionID, avatarColor, currentRoomId = null) {
        super(name, number, sessionID, avatarColor )
        this.currentRoomId = currentRoomId;
    }
    getCurrentRoomId() {
        return this.currentRoomId;
    }
    setCurrentRoomId(currentRoomId) {
        this.currentRoomId = currentRoomId;
    }
}

export { Client, Operator }