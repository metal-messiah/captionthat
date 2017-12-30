/**
 * Created by Porter on 12/24/2017.
 */
let express = require('express');
let webserver = express();
let http = require('http').Server(webserver);
let port = process.env.PORT || 3001;
let io = require('socket.io')(http);
let bodyParser = require('body-parser');
let httpRequest = require('request');
let fs = require('fs');
let cors = require('cors');
let path = require('path');

// controllers
let captionsController = require(__dirname + "/controllers/captions.js");
let playersController = require(__dirname + "/controllers/players.js");
let imagesController = require(__dirname + "/controllers/images.js");
let {Game} = require(__dirname + "/controllers/game.js");


webserver.use(bodyParser.json({limit: "50mb"}));
webserver.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));
webserver.use(cors());

webserver.use('/public', express.static(path.join(__dirname, 'public')));

// we could add an array of sockets for handling more people
//let gameroom = io.of('/gameroom');

let game = null;
let gamerooms = {};


webserver.get("/", (req, res) => {
    res.sendFile(__dirname + "/temp/index.html")
})

webserver.post("/api/game", (req, res) => {
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
        gamerooms[name].channel.on("connection", (socket) => {
            console.log("CONNECT");
            var connectedCount = io.engine.clientsCount;
            //console.log(`${connectedCount} users connected to ${name}`);
            let connected = Object.keys(gamerooms[name].channel.connected).length
            console.log(connected + " users in " + name)

            if (socket.alias) {
                console.log(socket.alias)
            }
            socket.on("alias", (alias) => {
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
                                    console.log("ALIAS TAKEN")
                                    socket.emit("alias", {
                                        success: false,
                                        msg: "Alias has already been claimed",
                                        alias: alias
                                    })
                                }
                            }
                            else {
                                console.log("game is NOT running")
                                if (gamerooms[name].game.status.users.length > 0) {
                                    console.log("game has 1 user already")
                                    // theres 1 user, but the game isnt running yet
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
                console.log("CAPTION - "+caption)
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
                    if (io.engine.clientsCount < 2) {
                        gamerooms[name].game.endGame();
                        // set the game to an empty initial state
                        gamerooms[name].game = null;

                        socket.emit("end", "Game Has Ended")
                    }
                }
            });
            socket.on('reconnect', function () {
                var total = io.engine.clientsCount;
                console.log(total + " users left on " + name);
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
})

webserver.get("/api/game/", (req, res) => {
    res.send({success: true, msg: `All game rooms returned`, gamerooms: Object.keys(gamerooms)})
})

webserver.get("/api/game/:gameroom", (req, res) => {
    let {gameroom} = req.params;
    if (gamerooms[gameroom]) {
        console.log("GAME EXISTS -- RETURN IT")
        res.send({success: true, msg: `Game room ${gameroom} exists`})
    }
    else {
        res.send({success: false, msg: `No game room found under the alias ${gameroom}`})
    }
})

webserver.delete("/api/game/:gameroom", (req, res) => {
    let {gameroom} = req.params;
    if (gamerooms[gameroom]) {
        console.log("GAME EXISTS -- REMOVE IT")
        delete gamerooms[gameroom];
        res.send({success: true, msg: `Game room ${gameroom} was found and removed`})
    }
    else {
        res.send({success: false, msg: `No game room found under the alias ${gameroom}`})
    }
})


webserver.get("/api/users/:alias", (req, res) => {
    let {alias}= req.params;
    console.log(alias)
    if (game && alias) {
        let index = game.status.users.findIndex((user) => user.alias.toLowerCase() == alias.toLowerCase());
        if (index != -1) {
            res.send({success: true, user: game.status.users[index], msg: "User Found Successfully"})
        }
        else {
            res.send({success: false, user: null, msg: "User Does Not Exist in Game"})
        }
    }
    else {
        res.send({success: false, user: null, msg: "Game Has Not Started -OR- ID Was Invalid"})
    }
});

webserver.get("/api/users/", (req, res) => {
    if (game) {

        res.send({success: true, users: game.status.users, msg: "All users returned"})

    }
    else {
        res.send({success: false, users: null, msg: "Game Has Not Started (No Users)"})
    }
})


webserver.get('/api/cards/draw', function (req, res) {
    let draw = captionsController.draw();
    res.send(`${draw.randomCard} - ${draw.captions.length} Cards In Deck - ${draw.usedCaptions.length} Cards Have Been Used`);
})

webserver.get('/api/cards/start', function (req, res) {
    let startingHand = captionsController.startingHand();
    res.send(`${startingHand}`);
})

//listen for requests
http.listen(port, function () {
    console.log('listening on ' + port);
});

/*webserver.post('/api/game/join', function (req, res) {
 try {
 let {alias} = req.body;
 let players = playersController.addPlayer(alias);
 gameroom.emit("join", players);
 res.send({success: true});
 }
 catch (err) {
 res.send({success: false})
 }
 })*/

/*webserver.get('/api/game/start', function (req, res) {
 try {

 game.startGame();
 console.log("TEST")
 res.send({success: true})
 }
 catch (err) {
 res.send({success: false, msg: err})
 }
 })*/


/*webserver.get('/api/players', function (req, res) {
 let players = playersController.players;
 res.send(`${players}`);
 })

 webserver.post('/api/players', function (req, res) {
 let {alias} = req.body;
 let players = playersController.addPlayer(alias);
 res.send(JSON.stringify(players));
 })

 webserver.delete('/api/players', function (req, res) {
 let {id} = req.body;
 let players = playersController.removePlayer(id);
 res.send(JSON.stringify(players));
 })

 webserver.put('/api/players', function (req, res) {
 let {id} = req.body;
 let players = playersController.removePlayer(id);
 res.send(JSON.stringify(players));
 })*/

