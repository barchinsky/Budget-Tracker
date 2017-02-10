angular.
	module("budgetTrackerApp").
	controller("loginController", loginController).
	factory("ds", DataService);

DataService.$inject = ["$http", "$localStorage"];
loginController.$inject = ["$scope", "$rootScope", "ds", "$timeout", "$state"];

function loginController($scope, $rootScope, ds, $timeout, $state){
	var local = $scope;
	var vm = this;

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
			//console.log("r.status:"+r.status);
			if(+r.status){

				//$timeout(function(){
				//	$scope.$apply(function(){
				//local.authorized = true; // update authorization status
				ds.setCurrentUser(r.user);
				//local.currentUser = ds.getCurrentUser();
						//$sc.$apply();
				//	})
				//}, 50);
				
				//ds.setCurrentUser(r.user); // save recieved user info
				ds.setToken(r.token); // save recieved token
				//ds.setLoginData(local.loginData); // save login data for futher use
				console.log("local.currentUser:", $scope.currentUser);

				local.notify("Welcome "+r.user.name+"!");
				local.barHeaderTitle = "Home";

				$timeout(function(){
					$scope.changeAuthEvent();
					local.hideLoading();
					$state.go("app.home"); // go to the main page
				}, 1000);
			}
			else {
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