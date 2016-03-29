/**
 * default values define
 */
var AuctionDefaultValues = {
	locale: window.navigator.userLanguage || window.navigator.language,	
	host: 'http://127.0.0.1:9081'
};

/**
 * loading busy
 */
var blocking = {
	blockUI: function(options) {
		var options = $.extend(true, {}, options);
	    var html = '<div class="loading-message"><img src="assets/images/loading-spinner-blue.gif" align=""><span>&nbsp;&nbsp;</span></div>';
	    if (options.target) { // element blocking
	        var el = $(options.target);
	        if (el.height() <= ($(window).height())) {
	            options.cenrerY = true;
	        }            
	        el.block({
	            message: html,
	            baseZ: options.zIndex ? options.zIndex : 1000,
	            centerY: options.cenrerY != undefined ? options.cenrerY : false,
	            css: {
	                top: '10%',
	                border: '0',
	                padding: '0',
	                backgroundColor: 'none'
	            },
	            overlayCSS: {
	                backgroundColor: options.overlayColor ? options.overlayColor : '#000',
	                opacity: options.boxed ? 0.05 : 0.1, 
	                cursor: 'wait'
	            }
	        });
	    } else { // page blocking
	        $.blockUI({
	            message: html,
	            baseZ: options.zIndex ? options.zIndex : 1000,
	            css: {
	                border: '0',
	                padding: '0',
	                backgroundColor: 'none'
	            },
	            overlayCSS: {
	                backgroundColor: options.overlayColor ? options.overlayColor : '#000',
	                opacity: options.boxed ? 0.05 : 0.1,
	                cursor: 'wait'
	            }
	        });
	    }       
	},
	unblockUI: function(target) {
		if (target) {
	        $(target).unblock({
	            onUnblock: function () {
	                $(target).css('position', '');
	                $(target).css('zoom', '');
	            }
	        });
	    } else {
	        $.unblockUI();
	    }
	}
};

/*dialogs centralize*/
function centerModals() {
    var dialogs = $(".modal-dialog");
    for (var i = 0; i < dialogs.length; i++) {
        var $dialog = $(dialogs[i]);
        var $content = $dialog.find('.modal-content');
        var offsettop = ($(window).height() - $dialog.height()) / 2;
        var offsetleft = ($(window).width() - $content.width()) / 2;
        // Center modal vertically in window
        $dialog.css("margin-top", offsettop);
        // Center modal horizontal in window
        $dialog.css("margin-left", offsetleft);
        // show dialog
        $dialog[0].style.display = "block";
    }
};

angular.module('auction', ['ui.bootstrap', 'ngRoute', 'ngTouch']).config(function($routeProvider, $httpProvider, $provide, datepickerConfig, datepickerPopupConfig) {
	// datepicker behaviours
    datepickerConfig.showWeeks = false;
    datepickerPopupConfig.showButtonBar = false;
    // 'loading' interceptor
    $httpProvider.interceptors.push('blockingInterceptor');
	// a known issue of angular transform response
    $httpProvider.defaults.transformResponse.push(function (data) {
        if (data === "null") {
            data = null;
        }
        return data;
    });
    $routeProvider.when('/', {
		templateUrl: 'assets/views/login.html',
        controller: 'login'
	}).when('/dashboard/:user', {
		templateUrl: 'assets/views/dashboard.html',
        controller: 'index'
	}).otherwise({ redirectTo: '/' });
}).factory('blockingInterceptor', function ($q, $rootScope) {
	var activeRequests = 0;
    var started = function() {
        if(activeRequests == 0) {
        	blocking.blockUI();
        }    
        activeRequests++;
    };
    var ended = function() {
        activeRequests--;
        if(activeRequests==0) {
        	blocking.unblockUI();
        }
    };
    return {
        request: function (config) {
            started();
            return config || $q.when(config);
        },
        response: function (response) {
            ended();
            return response || $q.when(response);
        },
        responseError: function (rejection) {
            ended();
            return $q.reject(rejection);
        }
    };
}).service('commonService', function($http, $q, $rootScope, $window) {
	this.executeRequest = function(apiUrl, method, params, data) {
		var request = {
			url: AuctionDefaultValues.host + '/' + apiUrl,
			method: method
		};
		
		if (params) {
			request.params = params;
		} 
		
		if (data) {
			request.data = data;
		} 
		
		var def = $q.defer();
		var that = this;
		$http(request)
		   .success(function(response) {
			   def.resolve(response);
		   })
		   .error(function(response) {
			   def.reject(response);
			   // handle error
			   blocking.unblockUI();
		   });
		
		return def.promise;
	};
}).service('$dialog', function ($modal, $log, $timeout) {
	
	this.errorDialog = function (options, callback) {
        options = _.extend(options || {}, {
            windowClass: 'default-modal',
            templateUrl: 'assets/scripts/dialogs/templates/error.html'
        });
        open(options, callback);
    };
    
    function open(options, callback) {
        var modalInstance = $modal.open(_.extend(options, {
            backdrop: 'static',
            controller: createController(options)
        }));

        function createController() {
            return ['$scope', '$modalInstance', '$timeout',
                function ($scope, $modalInstance, $timeout) {
                    $scope.header = options.header;
                    $scope.content = options.content;
                    $scope.buttonOK = options.buttonOK || 'OK';
                    $scope.buttonYes = options.buttonYes || 'Yes';
                    $scope.buttonNo = options.buttonNo || 'No';
                    $scope.buttonCancel = options.buttonCancel || 'Cancel'

                    $scope.result = {
                        yes: 0,
                        no: 1,
                        cancel: 2
                    };

                    $scope.close = function (result) {
                        $modalInstance.close(result);
                    };
                }
            ]
        };

        $timeout(function () {
            centerModals();
        }, 1000);

        modalInstance.result.then(function (result) {
            if (callback) {
                callback(result);
            }
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
    
    this.openDialog = function (options, callback) {
    	var modalInstance = $modal.open(_.extend(options, {
            backdrop: 'static',
            controller: options.controller
        }));

        modalInstance.result.then(function (result) {
            if (callback) {
                callback(result);
            }
        });

        $timeout(function () {
            centerModals();
        }, 1000);
    };
}).factory('socket', function($rootScope) {
	var socket = io.connect(AuctionDefaultValues.host);
	
	return {
		on: function(eventName, callback){
			socket.on(eventName, function () {  
				var args = arguments;
		        $rootScope.$apply(function () {
		        	callback.apply(socket, args);
		        });
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function () {
		        var args = arguments;
		        $rootScope.$apply(function () {
		        	if (callback) {
		        		callback.apply(socket, args);
		        	}
		        });
			})
		}
	};
});

angular.module('auction').controller('login', function($scope, $window, $location, commonService, socket, auctionapi) {
	$scope.username = undefined;
	$scope.onLogin = function() {
		auctionapi.login($scope.username).then(function(user) {
			// redirect to dashboard
			$location.path('/dashboard/' + $scope.username);
		});
	};
});

angular.module('auction').controller('index', function($scope, $rootScope, $routeParams, $location, $window, commonService, socket, auctionapi) {
	auctionapi.getUser($routeParams.user).then(function(result) {
		if (!!result) {
			// assign user to rootScope
			$rootScope.user = result;
			// broadcast join
			socket.emit('user:join', $rootScope.user.name);
		} else {
			$location.path('/');
		}
	});
	// register kickoff
	socket.on('user:kickoff', function() {
		$location.path('/');
	});
});
