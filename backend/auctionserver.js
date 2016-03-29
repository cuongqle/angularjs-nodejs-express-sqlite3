// definitions and requires
var bodyParser = require('body-parser');
var cors = require('cors'); 
var express = require('express');
var app = express();
var _ = require('underscore');
var connections = {};
//load models
var auctions = require('./models/auctions');
var timers = require('./models/timers'); 
//load persistent
var auctiondb = require("./persistent/auctiondb");
auctiondb.initialize();
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.get('/', function (req, res) {
	res.end();
});
app.get('/auction/api/user/login', function (req, res) {
	var name = req.query.name;
	auctiondb.getUserByName(name, function(user) {
		if (!user) {
			user = auctiondb.addNewUser(name);
		}
		res.end(JSON.stringify(user));
	});
});
app.get('/auction/api/user/get', function (req, res) {
	auctiondb.getUserByName(req.query.name, function(user) {
		if (!!user) {
			res.end(JSON.stringify(user));
		} else {
			res.end();
		}
	});
});
app.post('/auction/api/auction/new', function (req, res) {
	var auction = auctions.newAuction(req.body.auction);
	console.log('-------------------------------------------------------');
	console.log('New auction: ' + JSON.stringify(auction));
	console.log('-------------------------------------------------------');
	res.end(JSON.stringify(auction));
});
app.post('/auction/api/auction/bid', function (req, res) {
	var auction = auctions.bidAuction(req.body.auction, req.body.bidder, req.body.amount);
	console.log('-------------------------------------------------------');
	console.log('Bid auction: ' + JSON.stringify(auction));
	console.log('-------------------------------------------------------');
	res.end(JSON.stringify(auction));
});
app.get('/auction/api/auction/current', function (req, res) {
	var auction = auctions.getCurrentAuction();
	console.log('Current auction: ' + JSON.stringify(auction));
	if (!!auction) {
		res.end(JSON.stringify(auction));
	} else {
		res.end();
	}
});

var server = app.listen(9081, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Auction Server is listening at http://%s:%s", host, port);
});

var io = require('socket.io')(server);
io.sockets.on('connection', function(socket) {
	socket.on('user:join', function(username) {
		console.log('-------------------------------------------------------');
		console.log('User \"' + username + '\" joined');
		var connection = connections[username];
		if (!!connection) {
			console.log('Kickoff');
			connection.emit('user:kickoff', username);
			delete connections[username];
		}
		console.log('-------------------------------------------------------');
		connections[username] = socket;
	});
	socket.on('user:left', function (username) {
		console.log('-------------------------------------------------------');
		console.log('User \"' + username + '\" left');
		console.log('-------------------------------------------------------');
		delete connections[username];
	});
	socket.on('auction:refresh', function(refreshedAuction) {
		// update current auction
		auctions.setCurrentAuction(refreshedAuction);
		// start counting
		if (refreshedAuction.timeleft > 0 && refreshedAuction.timeleft < 10) {
			timers.stopCountingdown(refreshedAuction, socket);
			// reset timeleft to 10
			refreshedAuction.timeleft = 10;
			// start counting down again
			timers.startCountingdown(refreshedAuction, socket);
		} 
		// and broadcasting
		socket.broadcast.emit('auction:refresh', refreshedAuction);
	});
	socket.on('auction:timer', function(auction) {
		// update current auction
		auctions.setCurrentAuction(auction);
		// start counting
		timers.startCountingdown(auction, socket);
	});
	socket.on('auction:completed', function(auction) {
		timers.startWaitingBeforeCompleted(socket, function() {
			console.log('-------------------------------------------------------');
			console.log('Auction completed');
			console.log('-------------------------------------------------------');
			// complete current auction
			auctions.completeAuction();
			if (!!auction.bidder) {
				// complete seller auction
				auctiondb.sellerCompleteAuction(auction, function() {
					auctiondb.getUserByName(auction.seller, function(user) {
						console.log('Seller: ' + JSON.stringify(user))
						// broadcast refreshed user data
						connections[auction.seller].emit('user:update', user);
					});
				});
				// complete buyer auction
				auctiondb.buyerCompleteAuction(auction, function() {
					auctiondb.getUserByName(auction.bidder, function(user) {
						console.log('Bidder: ' + JSON.stringify(user))
						// broadcast refreshed user data
						connections[auction.bidder].emit('user:update', user);
					});
				});
			}
		});
	});
});

//export app so we can test it
exports = module.exports = app;