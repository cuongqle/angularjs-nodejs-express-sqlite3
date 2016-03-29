angular.module('auction').directive('currentAuction', function($window, $dialog, auctionapi, socket) {
	return {
		restrict: 'E',
        replace: true,
        templateUrl: 'assets/scripts/directives/templates/currentAuction.html',
        scope: {
        	user: '=',
        	auction:'=auction'
        },
        controller: function ($scope, $element, $attrs) {
        	function showError(){
        		$dialog.errorDialog({
    				header: 'Error',
    				content: 'Invalid bid value, please input another valid value.'
    			});
        	};
        	
        	$scope.amount = 0;
        	
        	auctionapi.getCurrentAuction().then(function(result) {
        		$scope.auction = result;
        	});

        	socket.on('auction:refresh', function(newAuction) {
        		$scope.auction = newAuction;
        		$scope.amount = 0;
        	});
        	
        	socket.on('auction:timeleft', function(timeelapsed) {
        		$scope.auction.timeleft = timeelapsed;
        		
        		if ($scope.auction.timeleft === 0) {
        			// broadcast timer
        			socket.emit('auction:completed', $scope.auction);
        		}
        	});
        	
        	$scope.onBid = function() {
        		if ($scope.auction.winningbid == 0 && $scope.amount < $scope.auction.minimum) {
        			showError();
        			return;
        		}
        		
        		if ($scope.amount < $scope.auction.winningbid) {
        			showError();
        			return;
        		}
        		
        		if ($scope.amount > $scope.user.coin) {
        			showError();
        			return;
        		}
        		
        		// call bid auction with bidder name (current user name) and amount arguments
        		auctionapi.bidAuction($scope.auction, $scope.user.name, $scope.amount).then(function(result) {
            		$scope.auction = result;
            		// broadcast refresh auction
        			socket.emit('auction:refresh', result);
            	});
        	};
        }
	}
});