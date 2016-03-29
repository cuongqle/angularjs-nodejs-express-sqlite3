angular.module('auction').controller('startAuction', function ($scope, $modalInstance, $dialog, currentItem, currentUser, auctionapi, socket) {
	$scope.auction = {
		seller: currentUser,
		item: currentItem,
		quantity: 0,
		minimum: 0
	};
	
	$scope.onStart = function() {
		if ($scope.auction.item.quantity < $scope.auction.quantity) {
			$dialog.errorDialog({
				header: 'Error',
				content: 'Quantity shouldn\'t be greater than ' + $scope.auction.item.quantity
			});
			return;
		}
		
		auctionapi.newAuction($scope.auction).then(function(result) {
			// broadcast refresh auction
			socket.emit('auction:refresh', result);
			// broadcast timer
			socket.emit('auction:timer', result);
			$modalInstance.close({ auction: result });
		});
	};
	
	$scope.onCancel = function() {
		$modalInstance.close();
	};
});