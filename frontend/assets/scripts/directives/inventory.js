angular.module('auction').directive('inventory', function($window, $dialog, auctionapi, socket) {
	return {
		restrict: 'E',
        replace: true,
        templateUrl: 'assets/scripts/directives/templates/inventory.html',
        scope: {
        	user: '=',
        	auction: '='
        },
        controller: function ($scope, $element, $attrs) {
        	socket.on('user:update', function(user) {
        		$scope.user = user;
        	});
        	
        	function showError(){
        		$dialog.errorDialog({
    				header: 'Error',
    				content: 'You can not make another auction once there is an existing one in progress.'
    			});
        	};
        	
        	function startNewAuction(item) {
        		$dialog.openDialog({
                    windowClass: 'start-auction-modal',
                    templateUrl: 'assets/scripts/dialogs/templates/startAuction.html',
                    controller: 'startAuction',
                    resolve: {
                        currentItem: function () {
                            return item;
                        },
                        currentUser: function () {
                            return $scope.user;
                        }
                    }
                }, function (result) {
                    if (!!result) {
                    	$scope.auction = result.auction;
                    }
                });
        	};
        	
        	$scope.onStartAuction = function(item) {
        		auctionapi.getCurrentAuction().then(function(currentAuction) {
        			if (!!currentAuction) {
        				showError();
        				return;
        			}
        			
        			startNewAuction(item);
        		});
        	};
        }
	}
});