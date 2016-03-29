angular.module('auction').service('auctionapi', function(commonService) {
	this.login = function(name) {
		var params = { 
			name: name
		}; 
		return commonService.executeRequest('auction/api/user/login', 'GET', params, null);
	};
	
	this.getUser = function(name) {
		var params = { 
			name: name
		}; 
		return commonService.executeRequest('auction/api/user/get', 'GET', params, null);
	};
	
	this.newAuction = function(auction) {
		var data = JSON.stringify({
			auction: auction
        });
		
		return commonService.executeRequest('auction/api/auction/new', 'POST', null, data); 
	};
	
	this.bidAuction = function(auction, bidder, amount) {
		var data = JSON.stringify({
			auction: auction,
			bidder: bidder,
			amount: amount
        });
		
		return commonService.executeRequest('auction/api/auction/bid', 'POST', null, data); 
	};
	
	this.getCurrentAuction = function() {
		return commonService.executeRequest('auction/api/auction/current', 'GET', null, null);
	};
});