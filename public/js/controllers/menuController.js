angular.
	module("budgetTrackerApp").
	controller("menuController", menuController).
	factory("ds", DataService);

DataService.$inject = ["$http", "$localStorage"];
menuController.$inject = ["$scope", "$timeout","$ionicModal", "ds", "$ionicLoading", "$rootScope", "$filter", "$state"];

function menuController($scope, $timeout, $ionicModal, ds, $ionicLoading, $rootScope, $filter, $state){
	var local = $scope;
	var vm = this;

	local.authorized = ds.authorized(); // used to manage app resources access
	local.menuItems = [config.homePage, config.addPage, config.transactionsPage, config.categoriesPage, config.budgetsPage, config.settingsPage]; // keep page titles with path
	local.barHeaderTitle = config.homePage.title; // header title
	local.currentUser = {name:"unknown", surname:"unknown"}; // current user name and surname
	local.regData = {name:"", surname:"", login:"", passConf:{value:"", valid:false}}; // registration data
	local.defaultUser = {name:"Authorization", surname:"required"};

	/*
	* Broadcast authorization status change event
	*/
	local.changeAuthEvent = function(event, value){
		$rootScope.$broadcast("change.auth.event", ds.authorized());
	}

	/*
	* Watch on authorized var
	* Notify other controlles about authorization status change
	*/
	local.$watch("authorized", function(newValue, oldValue){
		//ds.setAuthorization(newValue);
		local.changeAuthEvent();

	});

	local.$on("change.auth.event", function(event, value){
		//console.log("menuController:onchange:", value);
		$timeout(function(){
			local.$apply(function(){
				local.authorized = value;
				local.currentUser = ds.getCurrentUser();
				//console.log("menuController:applied:",value);
			})
		},50);
	});

	local.prepareModals = function(){
		// Create the login modal

		$ionicModal.fromTemplateUrl('templates/registration.htm', {
			scope: local
		}).then(function(modal) {
			local.registrationModal = modal;
		});
	}

	/*
	* Perform user authorization verification
	*/
	local.isauth = function(){
		//console.log("isauth()");
		local.showLoading();

		//console.log("ds.authorized()", ds.authorized());

		ds.isAuthorized(function(r){
			//console.log("------r",r);
			if( r.data.authorized ){
				//console.log("Authorizated");
				local.authorized = true;
				local.barHeaderTitle = "Home";
				$state.go("app.home");
				local.changeAuthEvent();
				local.currentUser = ds.getCurrentUser();
				local.hideLoading();
				local.notify("Welcome!")
			}else{
				//console.log("non-Authorized");
				local.barHeaderTitle = "Log in";
				$state.go("app.login");
				local.authorized = false;
				ds.setToken(null);
				local.hideLoading();
				local.notify("Authorization required!")
			}
		});

		//console.log("~isauth()");
	}

	local.register = function(){
		//console.log("register()");
		//return;

		local.showLoading();
		local.formatRegData(local.regData);
		//return;

		ds.register(local.regData).then(function(r){
			if( r.status ){
				local.notify("Registration is successfull!");
				var token = r.token;
				//console.log("token recieved:",token);
				ds.setToken(token);
				ds.setCurrentUser(local.regData);
				local.isauth();
				local.regData={};

				local.closeRegistrationModal();
				local.hideLoading();
			}
			else {
				local.hideLoading();
				local.notify(r.msg);
			}
		}, local.errorHandler);

		//console.log("~register()");
	}

	local.validatePass = function(){
		//console.log("validatePass()");
		//console.log(local.regData);

		if( local.regData.pass !== local.regData.passConf.value){
			local.notify("Password confirmation missmatch!");
			local.regData.passConf.valid=false;
		}else
			local.regData.passConf.valid = true;

		//console.log("validatePass()");
	}

	local.formatRegData = function(el){
		//console.log("validateRegData()");

		//var name = data.name;
		//var surname = data.surname;
		//var login = data.login;
		//data = $filter("titleCase")(data);

		switch(el){
			case "n": local.regData.name = $filter("titleCase")(local.regData.name);
			case 'sn': local.regData.surname = $filter("titleCase")(local.regData.surname);
			case 'l': local.regData.login = local.regData.login.split(' ')[0].toLowerCase();
			default: console.log("Registration element not recognized.");
		}
		//local.regData.name = $filter("titleCase")(local.regData.name);
		//console.log("new name:", local.regData.name);

		//local.regData.surname = $filter("titleCase")(local.regData.surname);
		//console.log("new surname:",local.regData.surname);

		//console.log(name, surname, login);
	}

	local.logout = function(){
			ds.logout().then(function(r){
				if(+r.status){
					local.authorized = false;
					//local.currentUser = local.defaultUser;
					ds.setCurrentUser(local.defaultUser);
					ds.setToken(null);
					local.changeAuthEvent();
					//console.log("Logged out.");
				}
			}, local.errorHandler);
		}

	local.showRegistrationModal = function(){
		local.registrationModal.show();
	}

	local.closeRegistrationModal = function(){
		local.registrationModal.hide();
	}

	local.showLoginModal = function(){
		//console.log("showLoginModal");
		local.loginModal.show();
	}

	local.closeLoginModal = function(){
		local.loginModal.hide();
		//console.log("closeLoginModal");
	}

	local.showLoading = function() {
	    $ionicLoading.show({
			template: 'Loading...',
			duration: 5000,
			scope: local
		}).then(function(){
			//console.log("The loading indicator is now displayed");
		});
	  }

	local.hideLoading = function(){
		$ionicLoading.hide().then(function(){
			//console.log("The loading indicator is now hidden");
		});
	}

	local.notify = function(text){
		//console.log("controller::notify()");
		//console.log(text);

		$("#notification").html(text);

		$("#notification").slideDown(600);

		$timeout(function(){
			$("#notification").slideUp(600);
		},1500);
		

		//console.log("~controller::notify()");
	}

	local.updateBarHeaderTitle = function(menuItem){
		local.barHeaderTitle = menuItem.title;
	}

	local.prepareModals();
	local.isauth();
	//console.log("!!!!!!!!!!!!!!! menuController init !!!!!!!!!!!")

}