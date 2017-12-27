/**
 * Created by Porter on 12/24/2017.
 */

var imagesController = require(__dirname + "/images.js");
//console.log(imagesController)

class Game {
    constructor(io, timer, round, currentImage, users, isRunning) {
        this.socket = {};
        this.status = {};
        //constants
        this.status.roundLimit = 10; //number of rounds
        this.status.timeLimit = 30; //seconds

        this.socket.io = io; // required!
        this.status.timer = timer || this.status.timeLimit;
        this.status.round = round || 0;
        this.status.roundType = null // answer or judging
        this.status.currentImage = currentImage || null;
        this.status.users = users || [];
        this.status.isRunning = isRunning || false;
        this.status.interval = null
    }

    increaseTimer() {
        if (!this.status.isRunning) {
            this.endGame()
            return;
        }
        this.socket.io.sockets.emit("data", this.status);
        this.status.timer--;

    }

    startRound() {
        if (!this.status.isRunning) {
            this.endGame();
            return;
        }
        if (this.status.interval) {
            clearInterval(this.status.interval);
            this.status.interval = null;
            this.status.timer = this.status.timeLimit;
        }
        this.status.round++;
        this.status.roundType = "answer";
        try {
            this.status.currentImage = `/public/images/${imagesController.getImage().randomImage}`;
        }
        catch (err) {
            console.log(err);
        }
        this.socket.io.sockets.emit("data", this.status);
        this.status.interval = setInterval(() => {
            this.status.timer > 0 ? this.increaseTimer() : this.endRound();
        }, 1000)
    }

    endRound() {
        if (!this.status.isRunning) {
            this.endGame()
            return;
        }
        this.socket.io.sockets.emit("data", this.status)
        if (this.status.round < this.status.roundLimit) {
            //this.round++;
            this.status.timer = this.status.timeLimit;
            if (this.status.interval) {
                clearInterval(this.status.interval);
                this.status.interval = null;
            }
            this.judge();
        }
        else {
            this.endGame()
        }

    }

    judge() {
        if (!this.status.isRunning) {
            this.endGame()
            return;
        }
        this.status.roundType = "judge";
        this.status.timer = this.status.timeLimit;
        this.socket.io.sockets.emit("data", this.status)
        this.status.interval = setInterval(() => {
            this.status.timer > 0 ? this.increaseTimer() : this.startRound();
        }, 1000)
    }

    startGame() {
        this.socket.io.sockets.emit("data", this.status)
        this.status.isRunning = true;
        this.startRound();
    }

    endGame() {
        this.status.isRunning = false;
        if (this.status.interval) {
            clearInterval(this.status.interval);
            this.status.interval = null;
        }
        this.socket.io.sockets.emit("data", this.status)
    }

}

module.exports = {Game};