var _ = require('underscore');
var currentAuction = undefined;
var status = { inprogress: 0, completed: 1 };

exports.newAuction = function(auction) {
	currentAuction = {
		seller: auction.seller.name,
		item: auction.item,
		quantity: auction.quantity,
		minimum: auction.minimum,
		status: status.inprogress,
		winningbid: 0,
		timeleft: 90
	};
	return currentAuction;
};

exports.getCurrentAuction = function() {
	if (!!currentAuction && currentAuction.status === status.inprogress) {
		return currentAuction;
	}
	
	return null;
};

exports.setCurrentAuction = function(auction) {
	currentAuction = auction;
};

exports.bidAuction = function(auction, bidder, amount) {
	auction.winningbid = amount;
	auction.bidder = bidder;
	currentAuction = auction; 
	return auction;
};

exports.completeAuction = function() {
	currentAuction.status = status.completed;
};