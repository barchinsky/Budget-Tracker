angular.
	module("budgetTrackerApp").
	controller("mainController", mainController).
	factory("ds", DataService). // dataService manages all comunications with server
	factory("canvas", CanvasService);

mainController.$inject = ["$scope", "$ionicModal", "$http", "ds", "canvas", "$window", "$filter", "$ionicLoading", "$rootScope"]; 
DataService.$inject = ["$http"];

function mainController($scope, $ionicModal, $http, ds, canvas, $window, $filter, $ionicLoading, $rootScope){
	//console.log("mainController controller loaded.");

	////////////// App init //////////////////
	//var isDev = true;
	var local = $scope;
	var vm = this;
	
	local.version = config.version;
	local.host = config.isDev?config.devHost:config.host;

	local.tranCat = null;
	
	//var isDev = true;
	//var host=isDev? config.devHost : config.host; 

	local.colors = config.colors;
	local.alerts= config.alerts;//["success","info","warning","danger"];
	
	local.bodyHeaderTitle = null;
	local.userImageIcon = "media/incognito.jpg";
	//local.menuItems = [config.homePage, config.addPage, config.transactionsPage, config.categoriesPage, config.budgetsPage, config.settingsPage]; // keep page titles with path
	local.addItems = [config.addTransactionPage, config.addCategoryPage, config.addBudgetPage];
	local.currentView = config.authPage;
	local.regPage = config.regPage;

	// form vars
	local.readOnly = true;
	local.notification = {};
	local.canv={name:'', note:''};
	local.budgetName = '';
	local.tDate = new Date(2015, 0, 01);

	local.loginData = {};
	local.regData = {passConf:{value:"", valid:true}}; // registration data
	//local.authorized = false;

	local.$on("change.auth.event", function(event, value){
		console.log("auth event handled", value);
		local.authorized = ds.getAuthorization();
		console.log("local.authorized:", local.authorized);
	});

	local.$watch("authorized", function(newValue, oldValue){
		console.log("mainController.authorized:", newValue, oldValue);
	});


	local.initApp = function(){
		console.log("initApp()");

		local.history = [];
		local.category = new Category();
		local.transaction = new Transaction();
		local.budget = new Budget();//{categories:[]};
		local.budgets = [];
		local.budgetCategories = [];
		local.categoryStyle = null; // used for styling category on add
		local.selectedItem = null;
		//local.authorized = false;
		local.categories = [];
		local.budgets = null;
		local.transactions = null;
		local.canv={};
		local.pass_conf={invalid:false, value:null};

		local.prepareModals();
		//local.isauth();

		console.log("~initApp()");
	}

	local.prepareModals = function(){
		// Create the login modal
		/*$ionicModal.fromTemplateUrl('templates/login.html', {
			scope: local
		}).then(function(modal) {
			local.loginModal = modal;
		});*/

		$ionicModal.fromTemplateUrl('templates/transactionDetails.htm', {
			scope: local
		}).then(function(modal) {
			local.transactionDetailsModal = modal;
		});

		$ionicModal.fromTemplateUrl('templates/budgetDetails.htm', {
			scope: local
		}).then(function(modal) {
			local.budgetDetailsModal = modal;
		});

		$ionicModal.fromTemplateUrl('templates/categoryDetails.htm', {
			scope: local
		}).then(function(modal) {
			local.categoryDetailsModal = modal;
		});

		/*$ionicModal.fromTemplateUrl('templates/registration.htm', {
			scope: local
		}).then(function(modal) {
			local.registrationModal = modal;
		});*/

	}

	///////////////////// Transaction //////////////////////////////////

	local.saveTransaction = function(){
		console.log("saveTransaction()");
		//console.log(local.transaction);
		
		// set time to current time
		local.transaction.rawDate.setHours( new Date().getHours() );
		local.transaction.rawDate.setMinutes( new Date().getMinutes() );

		// format date
		local.transaction.date = $filter("date")(local.transaction.rawDate, "yyyy-MM-dd HH:mm");
		console.log("local.category", local.transaction.category);
		console.log("transaction to add:", local.transaction);

		//return;

		ds.saveTransaction(local.transaction).then(function(r){
			if(+r.status) local.notify("Transaction added", 0);
			else local.notify(r.msg, 3);
		}, local.errorHandler);

		// recreate current transaction
		local.transaction = new Transaction();
		console.log("~saveTransaction()");
	}

	local.initTransactions = function(){
		console.log("initTransactions()");
		local.transactions = [];
		local.getBudgets();

		console.log("~initTransactions()");
	}

	local.getTransactions = function(b){
		// function loads transactions info from database
		console.log("getTransactions()");
		local.showLoading();

		ds.getTransactions(b).then(function(r){
			//local.transactions = r.data;
			//console.log("r.data:",r.data)
			local.transactions = Transaction.parseArray(r.data);
			console.log("local.transactions:", local.transactions);
		}, local.errorHandler);

		local.hideLoading();

		console.log("~getTransactions()");
	}

	local.getTransactionsByCategory = function(c,b){
		console.log("getTransactionsByCategory()");

		//console.log(c.catName, b.name);
		ds.getTransactionsByCategory(c.catName, b.name).then(function(r){
			if( +r.status ) {
				local.transactions = Transaction.parseArray(r.data);
				local.route(config.transactionsByCategoryPage);
			}
		}, local.errorHandler);

		console.log("~getTransactionsByCategory()");
	}

	local.deleteTransactionConfirm = function(){
		console.log("deleteTransaction()");
		$('#deleteTransactionModal').modal('toggle');
	}

	local.initAddTransaction = function(){
		console.log("initAddTransaction()");
		//local.initDatePicker();
		local.transaction = new Transaction();
		local.transaction.rawDate = new Date();
		//local.category = new Category();
		local.getCategories();
		console.log("~initAddTransaction()");
	}

	local.deleteTransaction = function(id){
		//console.log("tran:", local.transaction.id);
		//console.log("Delete confirmed");

		ds.deleteTransaction(id).then(function(r){
			if(+r.status){
				local.notify("Transaction deleted", 0);
				local.getTransactions(local.budgetName);
				local.goBack();
			}
			else local.notify(r.msg, 3);
		}, local.errorHandler);
	}

	local.openTransaction = function(tran){
		//console.log("openTransaction()");
		local.transaction = tran;
		local.tCat = tran.category;
		local.showTransactionModal();
		//local.route(config.transactionDetailsPage);

		//console.log("~openTransaction()");
	}

	local.allowToEditTransaction = function(){
		// edit current transaction
		//console.log("editTransaction()");
		
		local.readOnly = false;
		//local.initDatePicker();

		//console.log("~editTransaction()");
	}


	local.updateTransaction = function(tran){
		// update transaction by id after editing
		console.log("updateTransaction()");

		local.readOnly = true;
		//local.transaction.category = JSON.parse(local.transaction.category);
		//console.log("local.transaction", local.transaction);

		ds.updateTransaction(local.transaction).then(function(r){
			if(+r.status) local.notify("Updated!", 0);
		}, local.errorHandler);

		console.log("~updateTransaction()");
		
	}

	/////////////////////////// Budget ////////////////////////////////

	local.initAddBudget = function(){
		//console.log("initAddBudget()");
		local.budget = new Budget();//{categories:[]};
		//local.initDatePicker();
		local.getCategories();
		//console.log("~initAddBudget()");
	}

	local.getBudgets = function(){
		console.log("getBudgets()");

		ds.getBudgets().then(function(r){
			local.budgets = r.data;
			console.log("budgets:", local.budgets);
		}, local.errorHandler);

		//console.log("~getBudgets()")
	}

	local.loadBudget = function(b){
		//console.log("loadBudget()");
		local.budget = b;
		//local.route(config.budgetDetailsPage, false);
		//console.log("~loadBudget()");
	}

	/*local.budgetDetailsInit = function(){
		console.log("budgetDetailsInit()");

		//$("#bs-date").val(local.budget.startDate);
		//$("#be-date").val(local.budget.endDate);
		
		local.loadBudgetCategories(local.budget);
		console.log("~budgetDetailsInit()");
	}*/

	local.loadBudgetCategories = function(b){
		console.log("loadBudgetCategories()");

		ds.loadBudgetCategories(b).then(function(r){
			if( +r.status ) {
				local.budgetCategories = r.data;
				console.log("local.budgetCategories:", local.budgetCategories);
			}
			else local.notify(r.msg, 3);
		}, local.errorHandler);

		console.log("~loadBudgetCategories()");
	}

	local.deleteBudget = function(name){
		ds.deleteBudget(name).then(function(r){
			if( +r.status ){
				//local.getBudgets();
				local.route(config.budgetsPage);	
				local.notify("Budget deleted", 0);
			}
			else local.notify(r.msg, 3);
		}, local.errorHandler);
	}

	local.deleteBudgetConfirm = function(){
		//console.log("deleteBudget()");
		//console.log(local.budget.name);
		$('#deleteBudgetModal').modal('toggle'); // hide modal
	}

	local.getBudgetSum = function(){
		console.log("getBudgetSum()");
		var sum = 0;
		for(var i=0; i<local.budget.categories.length; i++ ){
			//console.log("add:",local.budget.categories[i]);
			if( local.budget.categories[i].type ) // if current property is expense
				sum += +(local.budget.categories[i].amount);
		}
		//console.log("sum:", sum);
		local.budget.totalCosts = sum;
		//console.log("local.budget.totalCosts:",local.budget.totalCosts);

		console.log("~getBudgetSum()");
	}

	local.saveBudget = function(){
		//console.log("saveBudget()");
		console.log("before:",local.budget);
		local.budget.startDate = $filter("date")(local.budget.startRawDate, "yyyy-MM-dd HH:mm");
		local.budget.endDate = $filter("date")(local.budget.endRawDate, "yyyy-MM-dd HH:mm");

		console.log(local.budget);
		//return;

		ds.saveBudget(local.budget).then(function(r){
			if(+r.status){
				local.notify("Budget saved", 0);
				local.budget = {};
			}
			else local.notify(r.msg, 3);
		}, local.errorHandler);

		//console.log("~saveBudget()");
	}

	local.validateBudgetName = function(b){
		//console.log("validateBudgetName()");

		ds.budgetExists(b.name).then(function(r){
			if( +r.status && r.data[0].budgets ){
				b.invalid=true;
				local.notify("Budget with this name already exists", 2);
			}
			else b.invalid = false;
		});
	}

	local.initBudgetCategory = function(id, cat){
		console.log("initBudgetCategory()");
		
		local.budget.categories.push({});
		local.budget.categories[id].name=cat.name;
		local.budget.categories[id].type=cat.type;
		local.budget.categories[id].id=cat.id;

		console.log("~initBudgetCategory()");
	}


	//////////////////////// Category ////////////////////////////

	local.getCategories = function(){
		console.log("getCategories()");
		// code to load data from server
		local.showLoading();

		local.categories = [];

		ds.getCategories().then(function(r){
			if(r.status){
				//console.log("Success.")
				for(var i=0; i < r.data.length; i++){
					var c = new Category(r.data[i]);
					local.categories.push(c);
				}

				console.log("categories:", local.categories);
				local.hideLoading();
			}
			else local.notify(r.msg, 3);
		}, local.errorHandler);
	}

	local.loadCategory = function(c){
		//console.log("loadCategory()");

		local.category = c;
		local.route(config.categoryDetailesPage);

		//console.log("~loadCategory()");
	}

	local.saveCategory = function(){
		//console.log("saveCategory()");
		//console.log("inputType:"+$("#radioExpense").is(":checked"));
		//local.category.type = $("#radioExpense").is(":checked") ? 1:0;
		local.category.type = local.category.type?1:0; // 1 is expense, 0 is income

		ds.saveCategory(local.category).then(function(r){
			if(+r.status){
				local.notify("Category added", 0);
				local.initCategory();
			}
			else local.notify(r.msg, 3);
		}, local.errorHandler);

		//console.log("~saveCategory()");
	}

	local.deleteCategory = function(c){
		console.log("deleteCategory()");

		ds.deleteCategory(c).then(function(r){
			if(+r.status){
				local.notify("Category deleted",0);
				//local.getCategories();
				local.route(config.categoriesPage);
			}
			else local.notify(r.msg, 3);
		}, local.errorHandler);
	}

	local.deleteCategoryConfirm = function(){
		$('#deleteCategoryModal').modal('toggle'); // hide modal
	}

	local.validateCategoryName = function(c){
		console.log('validateCategoryName()');

		ds.categoryExists(c).then(function(r){
			console.log(r);
			if(+r.status && r.data[0].categories) {
				local.category.invalid=true;
				local.notify("Category with such name already exists",2);
			}
		});
		
	}

	local.selectedCategory = function(tCat, setName){ // triggered by selection category at addTransaction.htm
		console.log("selectedCategory()");
		
		console.log("selectedCategory():transaction:before:", local.transaction);
		console.log("tCat:", tCat);
		local.transaction.category = JSON.parse(tCat);
		console.log("selectedCategory():transaction:after:", local.transaction);

		// need to set transaction name 
		if(setName) local.transaction.name = local.transaction.category.name.trim();
		
		//console.log("~selectedCategory()");
	}

	local.initCategory = function(){
		local.category = {};
	}

	//////////////////////// Utils ///////////////////////////////////

	local.route = function(page, isGoBack){
		//console.log("route()");

		if (typeof isGoBack === 'undefined' || !isGoBack) local.history.push(local.currentView); // add current view to the history
		local.currentView = page; // set current view
		local.bodyHeaderTitle = page.title; // set page title

		//console.log("~route()");
	}

	/*
	local.toogleMenu = function(){
		if( !local.authorized ) return; // menu does not available for not authorized users

		$window.scrollTo(0,0);
		//console.log("Menu toogled.")
		$("#nav-content").toggle( "slide" );
		//var currentViewState = $("#currentView").css("z-index");
		//currentViewState = (currentViewState > 0 || currentViewState=="auto") ? -1 : 1;
		//console.log("currentViewState:"+currentViewState+" "+Boolean(currentViewState));
		
		//$("#currentView").css("z-index", currentViewState); // set z-index
	}
	*/

	local.updateAllData = function(){
		//console.log("updateAllData()");

		//local.getTransactions();
		local.getCategories();
		local.getBudgets();

		//console.log("~updateAllData()");
	}

	local.notify = function(text,id){
		console.log("controller::notify()");
		console.log(text);

		//local.notification.text = text;
		//var nType = local.alerts[id]; // notification type

		//local.alertType = nType;

		//$("#notification").slideDown(800);
		//$("#notification").slideUp(1200);
		
		console.log("~controller::notify()");
	}

	local.showTransactionModal = function(){
		local.transactionDetailsModal.show();
	}

	local.closeTransactionModal = function(){
		console.log("closeTrasactionModal");
		local.transactionDetailsModal.hide();
	}

	/*
	local.showLoginModal = function(){
		console.log("showLoginModal");
		local.loginModal.show();
	}

	local.closeLoginModal = function(){
		local.loginModal.hide();
		console.log("closeLoginModal");
	}*/

	local.showBudgetDetailsModal = function(b){
		local.budget = b;
		//local.budgetDetailsInit();
		local.loadBudgetCategories(b);
		local.budgetDetailsModal.show();
	}

	local.closeBudgetDetailsModal = function(){
		local.budgetDetailsModal.hide();
	}

	local.showCategoryDetailsModal = function(){
		local.categoryDetailsModal.show();
	}

	local.closeCategoryDetailsModal = function(c){
		local.loadCategory(c);
		local.categoryDetailsModal.hide();
	}

	/*local.showRegistrationModal = function(){
		local.registrationModal.show();
	}

	local.closeRegistrationModal = function(){
		local.registrationModal.hide();
	}

	local.register = function(){
		//console.log("register()");

		/*if( local.regData.pass !== local.regData.passConf){
			local.notify("Password confirmation missmatch!",2);
			local.regData.passConf.invalid=true;
			return;
		}*/
		/*
		local.showLoading();

		ds.register(local.regData).then(function(r){
			if( +r.status )	local.notify("Registration is successfull",0);
			else local.notify(r.msg, 3);
			local.hideLoading();
			local.closeRegistrationModal();
		}, local.errorHandler);

		//console.log("~register()");
	}

	local.validatePass = function(){
		console.log(local.regData);
		if( local.regData.pass !== local.regData.passConf.value){
			local.notify("Password confirmation missmatch!",2);
			local.regData.passConf.valid=false;
		}else{ local.regData.passConf.valid = true; }
	}
	*/

	/*
	local.authorize = function(){
		console.log("authorize()");
		local.closeLoginModal();
		local.showLoading();

		ds.authorize(local.loginData).then(function(r){
			console.log("r.status:"+r.status);
			if(+r.status){
				ds.setAuthorization(true);
				local.currentUserName = r.user;
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

	local.logout = function(){
		ds.logout().then(function(r){
			if(+r.status){
				local.notify(r.msg, 0);	
				local.initApp();
				//ds.setAuthorization(false);

				console.log("Logged out.");
			}
			else local.notify(r.msg, 3);
		}, local.errorHandler);
	}*/

	/*local.isauth = function(){
		// check if user is athorized
		console.log("isauth()");
		local.showLoading();

		ds.isAuthorized().then(function(r){
			if(+r.status){
				local.notify("authorized");
				ds.setAuthorization(true);
				local.currentUserName = r.user;
				local.hideLoading();
			}
			else{
				console.log('not authorized');
				local.loginData = local.getLoginData();
				local.authorize();
				local.loginData = {};
			}
		}, local.errorHandler);

		console.log("~isauth()");
	}

	local.getLoginData = function(){
		// TODO: define method for retrieving stored login data

		// mock implementation
		var loginData = {login:"max", pass:"asd"};

		return loginData;
	}
	*/

	local.saveLoginData = function(){
		// TODO: define mothod to store login data
	}

	local.errorHandler = function(e){
		console.log('Error:',e);
		if( e.status == -1)
			local.notify("Something went wrong."+e, 3);
	}

	/*
	local.initDatePicker = function(){
		//console.log("initDatePicker()");
		$('#datetimepicker1').datetimepicker({format:"YYYY-MM-DD HH:mm", defaultDate:new Date()});
		$('#datetimepicker2').datetimepicker({format:"YYYY-MM-DD HH:mm", defaultDate:new Date()});
		$('#datetimepicker3').datetimepicker({format:"YYYY-MM-DD HH:mm", defaultDate:new Date()});
		//console.log("dtvalue:"+$('#datetimepicker1').val());		
		//console.log("~initDatePicker()");
	}
	
	local.goBack = function(){
		console.log("goBack()");

		if(local.history.length > 0){
			console.log(local.history);
			var target = local.history.pop();
			//console.log("Target:"+target.path + target.title +" history length:"+local.history.length);
			local.route(target, true);
		}

		console.log("~goBack()");
	}

	local.reset = function(){
		//console.log("reset()");

		local.category = new Category();
		local.transaction = new Transaction();

		//console.log("~reset()");	
	}
*/
	local.getProgressType = function(perc){
		var progressType = "success";
		
		if( perc > 80 && perc < 100) progressType = "warning";
		if( perc >= 100) progressType = "danger";

		return progressType;
	}

	//////////////////// Canvas ////////////////////////

	local.drawCanvas = function(bName){
		//local.budget=b;
		ds.getBudget(bName).then(function(r){
			if( r.status ) {
				local.budget = r.data[0];
				console.log('local.budget', local.budget);
				canvas.drawIncomeOutcome("incomeOutcomeChart", [local.budget.incomeCosts, local.budget.spentCosts]);
			}
			else local.notify(r.msg, 3);
			//console.log('local.Budget', local.budget);
			//canvas.drawIncomeOutcome("incomeOutcomeChart", [local.budget.incomeCosts, local.budget.spentCosts]);
		});
		
		// get budget expenses report
		ds.getBudgetSpentCosts(bName).then(function(r){
			console.log("getSpentCosts:r.data",r.data);
			canvas.drawExpensesPie("expensesPieChart", r.data);

		});
	}

	local.showLoading = function() {
	    $ionicLoading.show({
			template: 'Loading...',
			duration: 5000,
			scope: local
		}).then(function(){
			console.log("The loading indicator is now displayed");
		});
	  }

	local.hideLoading = function(){
		$ionicLoading.hide().then(function(){
			console.log("The loading indicator is now hidden");
		});
	}

	local.doRefresh = function(type) {
		console.log("Doing refresh");
		console.log("type:", type);

		if( type=="b" ) local.getBudgets(); // if budget refresh requested
		else if( type=="c" ) local.getCategories(); // if categries refresh requested
		else if( type == "t" ) {
			if( local.budgetName) local.getTransactions(local.budgetName);
			else local.notify("Please, select the budget", 1);
		}

		$scope.$broadcast('scroll.refreshComplete');
		
		console.log("Refresh done.");
	}

	local.initApp();
	//local.isauth();
	
}