angular.
module("budgetTrackerApp").
controller("menuController", menuController).
factory("ds", DataService);

menuController.$inject = ["$scope", "$ionicModal", "ds", "$ionicLoading", "$rootScope"];

function menuController($scope, $ionicModal, ds, $ionicLoading, $rootScope){
	local = $scope;
	vm = this;

	local.authorized = ds.getAuthorization();
	local.menuItems = [config.homePage, config.addPage, config.transactionsPage, config.categoriesPage, config.budgetsPage, config.settingsPage]; // keep page titles with path
	local.loginData = {};
	local.alerts= config.alerts;
	local.barHeaderTitle = config.homePage.title;


	/*
	* Broadcast authorization status change event
	*/
	local.changeAuthEvent = function(event, value){
		$rootScope.$broadcast("change.auth.event", ds.getAuthorization());
	}

	/*
	* Watch on authorized var
	* Notify other controlles about authorization status change
	*/
	local.$watch("authorized", function(newValue, oldValue){
		ds.setAuthorization(newValue);
		local.changeAuthEvent();

	});

	local.$on("change.auth.event", function(event, value){
		local.authorized = value;
	});

	local.prepareModals = function(){
		// Create the login modal
		$ionicModal.fromTemplateUrl('templates/login.html', {
			scope: local
		}).then(function(modal) {
			local.loginModal = modal;
		});

		$ionicModal.fromTemplateUrl('templates/registration.htm', {
			scope: local
		}).then(function(modal) {
			local.registrationModal = modal;
		});
	}

	/*
	* Perform user authorization verification
	* If user data stored, authorize in silend mode
	*/
	local.isauth = function(){
		console.log("isauth()");
		local.showLoading();

		ds.isAuthorized().then(function(r){
			if(+r.status){ // if user already authorized
				// update app data
				local.authorized = true;
				ds.setCurrentUser(r.user);
				local.notify("Authorizated!",1);
				local.hideLoading();
			}
			else{ // else perform
				// perform authorization using stored data
				console.log('not authorized');
				local.loginData = ds.getLoginData();
				local.authorize();
				local.notify("Not authorized!", 2);
			}
		}, local.errorHandler);

		console.log("~isauth()");
	}

	/* 
	* Authorize user
	* Used in UI
	*/
	local.authorize = function(){
		console.log("authorize()");
		local.closeLoginModal();
		local.showLoading();

		ds.authorize(local.loginData).then(function(r){
			console.log("r.status:"+r.status);
			if(+r.status){
				local.authorized = true;
				ds.setCurrentUser(r.user);
				local.notify(r.msg, 0);
				local.hideLoading();
			}
			else {
				local.hideLoading();
				local.notify(r.msg, 2);
			}
		}, local.errorHandler);
		console.log("~authorize()");
	}

	local.register = function(){
		//console.log("register()");

		local.showLoading();

		ds.register(local.regData).then(function(r){
			//if( +r.status )	local.notify("Registration is successfull",0);
			//else local.notify(r.msg, 3);
			local.hideLoading();
			local.closeRegistrationModal();
		}, local.errorHandler);

		//console.log("~register()");
	}

	local.validatePass = function(){
		console.log(local.regData);
		if( local.regData.pass !== local.regData.passConf.value){
			//local.notify("Password confirmation missmatch!",2);
			local.regData.passConf.valid=false;
		}else{ local.regData.passConf.valid = true; }
	}

	local.logout = function(){
			ds.logout().then(function(r){
				if(+r.status){
					local.authorized = false;
					console.log("Logged out.");
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

	local.notify = function(text,id){
		console.log("controller::notify()");
		console.log(text);

		//local.notification.text = text;
		//$("#notification").html(text);
		//var nType = local.alerts[id]; // notification type

		//local.alertType = nType;

		//$("#notification").slideDown(800);
		//$("#notification").slideUp(1200);
		
		console.log("~controller::notify()");
	}

	local.updateBarHeaderTitle = function(menuItem){
		local.barHeaderTitle = menuItem.title;
	}



	local.prepareModals();
	local.isauth();

}