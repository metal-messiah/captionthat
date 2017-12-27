/**
 * Created by Porter on 12/24/2017.
 */
let express = require('express');
let webserver = express();
let http = require('http').Server(webserver);
let port = process.env.PORT || 3000;
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

io.on("connection", (socket) => {
    console.log("CONNECT");
    var connectedCount = io.engine.clientsCount;

    if (socket.alias) {
        console.log(socket.alias)
    }


    socket.on("alias", (alias) => {
        console.log(alias)
        if (alias) {
            socket.alias = alias;

            //socket.emit("joingame",)
            if (connectedCount > 0) {
                if (game) {
                    // join the existing game
                    if (game.status.isRunning) {

                        let aliasIndex = game.status.users.findIndex((user) => user.alias == alias);
                        if (aliasIndex == -1) {
                            game.status.users = playersController.addPlayer(alias);
                            let user = game.status.users[game.status.users.findIndex((user) => user.alias == alias)];
                            socket.id = user.id;
                            console.log(socket.id)
                            socket.emit("alias", {success: true, msg: "Alias added to game"})
                        }
                        else {
                            console.log("ALIAS TAKEN")
                            socket.emit("alias", {success: false, msg: "Alias has already been claimed"})
                        }
                    }
                    else {
                        if (game.status.users.length > 0) {
                            // theres 1 user, but the game isnt running yet
                            let aliasIndex = game.status.users.findIndex((user) => user.alias == alias);
                            if (aliasIndex == -1) {
                                game.status.users = playersController.addPlayer(alias);
                                let user = game.status.users[game.status.users.findIndex((user) => user.alias == alias)];
                                socket.id = user.id;
                                console.log(socket.id)
                                socket.emit("alias", {success: true, msg: "Alias added to game"})
                            }
                            else {
                                console.log("ALIAS TAKEN")
                                socket.emit("alias", {success: false, msg: "Alias has already been claimed"})
                            }
                            game.startGame();
                        }
                    }
                }
                else {
                    // start a new game
                    game = new Game(io);
                    //game.startGame();
                    game.status.users = playersController.addPlayer(alias)
                    let user = game.status.users[game.status.users.findIndex((user) => user.alias == alias)];
                    socket.id = user.id;
                    console.log(socket.id)
                    socket.emit("alias", {success: true, msg: "Alias added to game"})
                }
            }
        }
    })

    socket.on("caption", (caption) => {
        let userIndex = game.status.users.findIndex((user) => user.id == socket.id);
        let user = game.status.users[userIndex];
        game.status.currentCaptions.push({alias: user.alias, caption: caption});

        game.status.users[userIndex].canSubmit = false;
        game.status.users[userIndex].currentCaption = caption;

        let cardIndex = game.status.users[userIndex].cards.indexOf(caption);

        game.status.users[userIndex].cards.splice(cardIndex, 1);
        game.status.users[userIndex].cards.push(captionsController.draw().randomCard)
    })

    socket.on("vote", (vote) => {
        //alias, caption
        let alias = vote;
        let userIndex = game.status.users.findIndex((user) => user.alias == alias);
        game.status.users[userIndex].score++;

        let roundIndex = game.status.currentRound.findIndex((user) => user.alias == alias);
        game.status.currentRound[roundIndex].score++;
        game.status.currentRound[roundIndex].caption = game.status.users[userIndex].currentCaption;

        let voterIndex = game.status.users.findIndex((user) => user.id == socket.id);
        game.status.users[voterIndex].canVote = false;
    })


    socket.on('disconnect', function () {
        if (game) {
            // quit the game
            game.status.users = playersController.removePlayer(socket.id)
            if (io.engine.clientsCount < 1) {
                game.endGame();
                // set the game to an empty initial state
                game = new Game(io);
            }
        }
    });

    socket.on('reconnect', function () {
        var total = io.engine.clientsCount;
        console.log(total);
    });


})

webserver.get("/", (req, res) => {
    res.sendFile(__dirname + "/temp/index.html")
})

webserver.get("/api/users/:alias", (req, res) => {
    let {alias}= req.params;
    if (game && alias) {
        let index = game.status.users.findIndex((user) => user.alias == alias);
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

