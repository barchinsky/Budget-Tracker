angular.
	module("budgetTrackerApp").
	controller("loginController", loginController).
	factory("ds", DataService);

DataService.$inject = ["$http", "$localStorage"];
loginController.$inject = ["$scope", "$rootScope", "ds", "$timeout", "$state"];

function loginController($scope, $rootScope, ds, $timeout, $state){
	var local = $scope;
	var vm = this;

	local.version = config.version;

	local.loginData = {}; // store login data
	local.regData = {name:"", surname:"", login:"", passConf:{value:"", valid:false}}; // registration data
	//local.currentUser = {name:"unknown", surname:"unknown"}; // current user name and surname

	local.changeAuthEvent = function(event, value){
		$rootScope.$broadcast("change.auth.event", true);
	}

	/* 
	* Authorize user
	*/
	local.authorize = function(){
		console.log("authorize()");
		//local.closeLoginModal();
		local.showLoading();

		ds.authorize(local.loginData).then(function(r){
			// if authorization success
			if(+r.status){
				ds.setCurrentUser(r.user);
				ds.setToken(r.token); // save recieved token
				//console.log("local.currentUser:", $scope.currentUser);

				local.notify("Welcome "+r.user.name+"!");
				local.barHeaderTitle = "Home";

				// notify other about authorization status changed
				$timeout(function(){
					$scope.changeAuthEvent();
					local.hideLoading();
					$state.go("app.home"); // go to the main page
				}, 1000);
			}
			else { // if notification failed
				local.hideLoading();
				local.notify(r.msg);
			}
		}, local.errorHandler);

		console.log("~authorize()");
	}

	local.notify = function(text){
		//console.log("controller::notify()");
		console.log(text);

		$("#notification").html(text);
		$("#notification").slideDown(600);

		$timeout(function(){
			$("#notification").slideUp(600);
		},1500);
		

		//console.log("~controller::notify()");
	}

	console.log(" ------------------ loginController init --------------------");
}