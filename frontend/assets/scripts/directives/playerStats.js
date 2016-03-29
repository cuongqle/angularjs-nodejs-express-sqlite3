angular.module('auction').directive('playerStats', function($window, $location, socket) {
	return {
		restrict: 'E',
        replace: true,
        templateUrl: 'assets/scripts/directives/templates/playerStats.html',
        scope: {
        	user: '='
        },
        controller: function ($scope, $element, $attrs) {
        	$scope.onLeave = function() {
        		// broadcast left
        		socket.emit('user:left', $scope.user.name);
        		// redirect to login
        		$location.path('/');
        	};
        	socket.on('user:update', function(user) {
        		$scope.user = user;
        	});
        }
	}
});