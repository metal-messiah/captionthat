/**
 * Created by Porter on 1/1/2018.
 */
const path = require('path')
let root = path.dirname(require.main.filename);
let {game, gamerooms} = require("/index.js");

const catchAll = (req, res) => {
    res.send("API End Points<hr>/api/game (get/post)<br>/api/game/:gameroom (get/delete)<br>")
}

const postGame = (req, res) => {
    let {name} = req.body;
    console.log(name)
    if (gamerooms[name]) {
        console.log("GAME NAME ALREADY TAKEN")
        res.send({
            success: false,
            msg: "That game room name has already been taken",
            gameroom: name,
            gamerooms: Object.keys(gamerooms)
        })
    }
    else {
        console.log("GAME NAME NOT TAKEN")
        let channel = io.of(`/${name}`);
        gamerooms[name] = {game: new Game(channel), channel: channel}
        console.log("CREATE GAME ROOM CHANNEL")
        console.log(gamerooms[name].game)
        io.of(`/${name}`).on("connection", (socket) => {
            console.log("CONNECT");
            var connectedCount = io.engine.clientsCount;
            //console.log(`${connectedCount} users connected to ${name}`);
            let connected = Object.keys(gamerooms[name].channel.connected).length
            console.log(connected + " users in " + name)

            if (socket.alias) {
                console.log(socket.alias)
            }
            socket.on("alias", (alias) => {
                console.log(io.nsps);
                console.log(alias)
                if (alias) {
                    console.log("alias is true")
                    socket.alias = alias;

                    //socket.emit("joingame",)
                    if (connectedCount > 0) {
                        console.log("connected is > 0")
                        if (gamerooms[name].game) {
                            console.log("game exists")
                            // join the existing game
                            if (gamerooms[name].game.status.isRunning) {
                                console.log("game is running")
                                if (connectedCount >= 2) {
                                    let aliasIndex = gamerooms[name].game.status.users.findIndex((user) => user.alias == alias);
                                    if (aliasIndex == -1) {
                                        console.log("alias doesnt exist")
                                        gamerooms[name].game.status.users.push(playersController.addPlayer(alias));
                                        let user = gamerooms[name].game.status.users[gamerooms[name].game.status.users.findIndex((user) => user.alias == alias)];
                                        socket.id = user.id;
                                        console.log(socket.id)
                                        socket.emit("alias", {success: true, msg: "Alias added to game", alias: alias})
                                    }
                                    else {
                                        console.log(gamerooms[name].game.status.users);
                                        console.log("ALIAS TAKEN")
                                        socket.emit("alias", {
                                            success: false,
                                            msg: "Alias has already been claimed",
                                            alias: alias
                                        })
                                    }
                                }
                                else {
                                    console.log("game is running with < 2 users... uh oh")
                                    if (gamerooms[name].game.status.users.length > 0) {
                                        console.log("game has 1 user already")
                                        // theres 1 user, but the game isnt running yet
                                        let aliasIndex = gamerooms[name].game.status.users.findIndex((user) => user.alias == alias);
                                        if (aliasIndex == -1) {
                                            gamerooms[name].game.status.users.push(playersController.addPlayer(alias));
                                            let user = gamerooms[name].game.status.users[gamerooms[name].game.status.users.findIndex((user) => user.alias == alias)];
                                            socket.id = user.id;
                                            console.log(socket.id)
                                            socket.emit("alias", {
                                                success: true,
                                                msg: "Alias added to game",
                                                alias: alias
                                            })
                                        }
                                        else {
                                            console.log("ALIAS TAKEN")
                                            socket.emit("alias", {
                                                success: false,
                                                msg: "Alias has already been claimed",
                                                alias: alias
                                            })
                                        }
                                        gamerooms[name].game.startGame();
                                    }
                                    else {
                                        console.log("game has no users")
                                        let aliasIndex = gamerooms[name].game.status.users.findIndex((user) => user.alias == alias);
                                        if (aliasIndex == -1) {
                                            gamerooms[name].game.status.users.push(playersController.addPlayer(alias));
                                            let user = gamerooms[name].game.status.users[gamerooms[name].game.status.users.findIndex((user) => user.alias == alias)];
                                            socket.id = user.id;
                                            console.log(socket.id)
                                            socket.emit("alias", {
                                                success: true,
                                                msg: "Alias added to game",
                                                alias: alias
                                            })
                                        }
                                        else {
                                            console.log("ALIAS TAKEN")
                                            socket.emit("alias", {
                                                success: false,
                                                msg: "Alias has already been claimed",
                                                alias: alias
                                            })
                                        }
                                    }
                                }
                            }
                            else {
                                console.log("game is NOT running")
                                console.log(gamerooms[name].game.status.users)
                                if (gamerooms[name].game.status.users.length > 0) {
                                    console.log("game has 1 user already")
                                    // theres 1 user, but the game isnt running yet
                                    console.log(alias)
                                    console.log(gamerooms[name].game.status.users)
                                    let aliasIndex = gamerooms[name].game.status.users.findIndex((user) => user.alias == alias);
                                    console.log(aliasIndex);
                                    if (aliasIndex == -1) {
                                        gamerooms[name].game.status.users.push(playersController.addPlayer(alias));
                                        let user = gamerooms[name].game.status.users[gamerooms[name].game.status.users.findIndex((user) => user.alias == alias)];
                                        socket.id = user.id;
                                        console.log(socket.id)
                                        socket.emit("alias", {success: true, msg: "Alias added to game", alias: alias})
                                        gamerooms[name].game.startGame();
                                    }
                                    else {
                                        console.log("ALIAS TAKEN")
                                        socket.emit("alias", {
                                            success: false,
                                            msg: "Alias has already been claimed",
                                            alias: alias
                                        })
                                    }

                                }
                                else {
                                    console.log(gamerooms[name].game)
                                    console.log("game has no users")
                                    let aliasIndex = gamerooms[name].game.status.users.findIndex((user) => user.alias == alias);
                                    if (aliasIndex == -1) {
                                        gamerooms[name].game.status.users.push(playersController.addPlayer(alias));
                                        let user = gamerooms[name].game.status.users[gamerooms[name].game.status.users.findIndex((user) => user.alias == alias)];
                                        socket.id = user.id;
                                        console.log(socket.id)
                                        socket.emit("alias", {success: true, msg: "Alias added to game", alias: alias})
                                    }
                                    else {
                                        console.log("ALIAS TAKEN")
                                        socket.emit("alias", {
                                            success: false,
                                            msg: "Alias has already been claimed",
                                            alias: alias
                                        })
                                    }
                                }
                            }
                        }
                        else {
                            // create a new game
                            gamerooms[name].game = new Game(io);
                            //game.startGame();
                            gamerooms[name].game.status.users.push(playersController.addPlayer(alias));
                            let user = gamerooms[name].game.status.users[gamerooms[name].game.status.users.findIndex((user) => user.alias == alias)];
                            socket.id = user.id;
                            console.log(socket.id)
                            socket.emit("alias", {success: true, msg: "Alias added to game", alias: alias})
                        }
                    }
                }
            })
            socket.on("caption", (caption) => {
                console.log("CAPTION - " + caption)
                if (gamerooms[name].game) {
                    let userIndex = gamerooms[name].game.status.users.findIndex((user) => user.alias == socket.alias);
                    let user = gamerooms[name].game.status.users[userIndex];
                    console.log(user)
                    gamerooms[name].game.status.currentCaptions.push({alias: user.alias, caption: caption});

                    gamerooms[name].game.status.users[userIndex].canSubmit = false;
                    gamerooms[name].game.status.users[userIndex].currentCaption = caption;

                    let cardIndex = gamerooms[name].game.status.users[userIndex].cards.indexOf(caption);

                    gamerooms[name].game.status.users[userIndex].cards.splice(cardIndex, 1);
                    gamerooms[name].game.status.users[userIndex].cards.push(captionsController.draw().randomCard)
                }
                else {
                    console.log("GAME IS NOT RUNNING...")
                    socket.emit("error", "CAPTION FAILED -- GAME IS NOT RUNNING")
                }
            })
            socket.on("vote", (vote) => {
                //alias, caption
                if (gamerooms[name].game) {
                    let alias = vote;
                    let userIndex = gamerooms[name].game.status.users.findIndex((user) => user.alias == alias);
                    if (userIndex != -1) {
                        gamerooms[name].game.status.users[userIndex].score++;
                    }

                    let roundIndex = gamerooms[name].game.status.currentRound.findIndex((user) => user.alias == alias);
                    if (roundIndex != -1) {
                        gamerooms[name].game.status.currentRound[roundIndex].score++;
                        gamerooms[name].game.status.currentRound[roundIndex].caption = gamerooms[name].game.status.users[userIndex].currentCaption;
                    }

                    let voterIndex = gamerooms[name].game.status.users.findIndex((user) => user.alias == socket.alias);
                    if (voterIndex != -1) {
                        gamerooms[name].game.status.users[voterIndex].canVote = false;
                    }
                }
                else {
                    console.log("GAME IS NOT RUNNING...")
                    socket.emit("error", "VOTE FAILED -- GAME IS NOT RUNNING")
                }
            })
            socket.on('disconnect', function () {
                if (gamerooms[name].game) {
                    // quit the game
                    gamerooms[name].game.status.users = playersController.removePlayer(socket.id)
                    if (Object.keys(gamerooms[name].channel.connected).length < 2) {
                        gamerooms[name].game.endGame();
                        // set the game to an empty initial state
                        gamerooms[name].game = null;

                        delete gamerooms[name];
                        const MyNamespace = io.of(name); // Get Namespace
                        const connectedNameSpaceSockets = Object.keys(MyNamespace.connected); // Get Object with Connected SocketIds as properties
                        connectedNameSpaceSockets.forEach(socketId => {
                            MyNamespace.connected[socketId].disconnect(); // Disconnect Each socket
                        });
                        MyNamespace.removeAllListeners(); // Remove all Listeners for the event emitter
                        delete io.nsps[name]; // Remove from the server namespaces

                        socket.emit("end", "Game Has Ended")
                    }
                }
            });
            socket.on('reconnect', function () {
                let connected = Object.keys(gamerooms[name].channel.connected).length
                console.log(connected + " users left on " + name);
            });
        })
        console.log("send response")
        res.send({
            success: true,
            msg: `Created game room under the alias ${name}`,
            gameroom: name,
            gamerooms: Object.keys(gamerooms)
        })
    }
};

const getGame = (req, res) => {
    res.send({success: true, msg: `All game rooms returned`, gamerooms: Object.keys(gamerooms)})
};

const getGameroom = (req, res) => {
    let {gameroom} = req.params;
    if (gamerooms[gameroom]) {
        console.log("GAME EXISTS -- RETURN IT")
        res.send({
            success: true,
            msg: `Game room ${gameroom} exists`,
            users: gamerooms[gameroom].game.status.users.map((user) => user.alias)
        })
    }
    else {
        res.send({success: false, msg: `No game room found under the alias ${gameroom}`})
    }
};

const deleteGameroom = (req, res) => {
    let {gameroom} = req.params;
    if (gamerooms[gameroom]) {
        console.log("GAME EXISTS -- REMOVE IT")
        delete gamerooms[gameroom];
        const MyNamespace = io.of(name); // Get Namespace
        const connectedNameSpaceSockets = Object.keys(MyNamespace.connected); // Get Object with Connected SocketIds as properties
        connectedNameSpaceSockets.forEach(socketId => {
            MyNamespace.connected[socketId].disconnect(); // Disconnect Each socket
        });
        MyNamespace.removeAllListeners(); // Remove all Listeners for the event emitter
        delete io.nsps[name];
        res.send({success: true, msg: `Game room ${gameroom} was found and removed`})
    }
    else {
        res.send({success: false, msg: `No game room found under the alias ${gameroom}`})
    }
};

const drawCard = (req, res) => {
    let draw = captionsController.draw();
    res.send(`${draw.randomCard} - ${draw.captions.length} Cards In Deck - ${draw.usedCaptions.length} Cards Have Been Used`);
}

const startingHand = (req, res) => {
    let startingHand = captionsController.startingHand();
    res.send(`${startingHand}`);
};

module.exports = {
    catchAll,
    postGame,
    getGame,
    getGameroom,
    deleteGameroom,
    drawCard,
    startingHand
}