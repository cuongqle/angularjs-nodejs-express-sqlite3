var timeinterval  = undefined;

exports.startCountingdown = function(auction, socket) {
	timeinterval = setInterval(function() {  
		auction.timeleft--;
		socket.emit('auction:timeleft', auction.timeleft);
		socket.broadcast.emit('auction:timeleft', auction.timeleft);
		if (auction.timeleft === 0) {
			clearInterval(timeinterval);
		}
	}, 1000);
};

exports.stopCountingdown = function(auction, socket) {
	clearInterval(timeinterval);
};

exports.startWaitingBeforeCompleted = function(socket, callback) {
	var counter = 10;
	timeinterval = setInterval(function() {  
		counter--;
		if (counter === 0) {
			clearInterval(timeinterval);
			if (callback) {
				callback();
			}
			socket.emit('auction:refresh', null);
			socket.broadcast.emit('auction:refresh', null);
		}
	}, 1000);
};