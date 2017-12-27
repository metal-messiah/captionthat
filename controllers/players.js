/**
 * Created by Porter on 12/24/2017.
 */

let captionsController = require(__dirname + "/captions.js");

class Player {
    constructor(id, alias, score, cards) {
        this.id = id;
        this.alias = alias;
        this.score = score;
        this.cards = cards;
        this.canSubmit = true;
        this.canVote = true;
        this.currentCaption = "";
    }
}

let players = []

let addPlayer = (alias, score, cards) => {
    score = score || 0;
    cards = cards || captionsController.startingHand();
    let newID
    try {
        newID = players[players.length - 1].id + 1
    }
    catch (err) {
        newID = 0
    }

    players.push(new Player(newID, alias, score, cards));
    return players;
};

let removePlayer = (id) => {

    var rIndex = players.findIndex((player) => player.id == id);

    if (rIndex != -1) {
        players.splice(rIndex, 1);
    }

    return players;

};

let updatePlayer = (id, score, cards) => {
    var uIndex = players.findIndex((player) => player.id == id);
    if (uIndex != -1) {
        players[uIndex].score = score;
        players[uIndex].cards = cards;
    }
};

module.exports = {
    players: players,
    addPlayer: addPlayer,
    removePlayer: removePlayer,
    updatePlayer: updatePlayer
}