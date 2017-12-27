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
    var total = io.engine.clientsCount;

    if (socket.alias) {
        console.log(socket.alias)
    }


    socket.on("alias", (alias) => {
        console.log(alias)
        if (alias) {
            socket.alias = alias;
            //socket.emit("joingame",)
            if (total > 0) {
                if (game) {
                    // join the game
                    game.status.users = playersController.addPlayer(alias)

                }
                else {
                    game = new Game(io);
                    game.startGame();
                    game.status.users = playersController.addPlayer(alias)
                }
            }
        }

    })


    socket.on('disconnect', function () {
        var total = io.engine.clientsCount;
        console.log(total);
    });

    socket.on('reconnect', function () {
        var total = io.engine.clientsCount;
        console.log(total);
    });

    //socket.on("join")

    let send = (data) => {
        socket.broadcast.emit(`${draw.randomCard} - ${draw.captions.length} Cards In Deck - ${draw.usedCaptions.length} Cards Have Been Used`);
    }

    socket.on('draw', function () {
        let draw = captionsController.draw();
        socket.broadcast.emit(`${draw.randomCard} - ${draw.captions.length} Cards In Deck - ${draw.usedCaptions.length} Cards Have Been Used`);
    })


})

webserver.get("/", (req, res) => {
    res.sendFile(__dirname + "/temp/index.html")
})

webserver.get('/api/cards/draw', function (req, res) {
    let draw = captionsController.draw();
    res.send(`${draw.randomCard} - ${draw.captions.length} Cards In Deck - ${draw.usedCaptions.length} Cards Have Been Used`);
})

webserver.get('/api/cards/start', function (req, res) {
    let startingHand = captionsController.startingHand();
    res.send(`${startingHand}`);
})

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

webserver.get('/api/game/start', function (req, res) {
    try {

        game.startGame();
        console.log("TEST")
        res.send({success: true})
    }
    catch (err) {
        res.send({success: false, msg: err})
    }
})


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

//listen for requests
http.listen(port, function () {
    console.log('listening on ' + port);
});