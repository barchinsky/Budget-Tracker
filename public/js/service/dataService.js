/*
* Define the app data exchange logic 
*/

function DataService($http, $localStorage){

	//var isDev = true;
	var host = config.isDev?config.devHost:config.host;
	//var appData = {};
	//appData.authorized = false;
	//appData.currentUser = {};
	
	var $storage = $localStorage.$default({
		token:null,
		uname: "",
		usurname: "",
		//loginData:{login:null, pass:null},
	});

	var services = {
		getTransactions: getTransactions,
		deleteTransaction: deleteTransaction,
		getBudgetSpentCosts: getBudgetSpentCosts,
		getBudgets: getBudgets,
		loadBudgetCategories: loadBudgetCategories,
		deleteBudget: deleteBudget,
		getCategories: getCategories,
		register: reg,
		authorize: authorize,
		logout: logout,
		isAuthorized: isAuth,
		saveTransaction: saveTransaction,
		updateTransaction: updateTransaction,
		saveCategory: saveCategory,
		deleteCategory: deleteCategory,
		saveBudget: saveBudget,
		getBudget: getBudget,
		budgetExists: budgetExists,
		categoryExists: catExists,
		getTransactionsByCategory: getTranByCat,
		/*setAuthorization: setAuthorization,*/
		authorized: authorized,
		setCurrentUser: setCurrentUser,
		getCurrentUser: getCurrentUser,
		getLoginData: getLoginData,
		setLoginData: setLoginData,
		setToken: setToken,
		getToken: getToken,
	};

	return services;

	function getTransactions(b){
		/* Loads transactions for budget */
		//console.log('dataService.js:getTransactions()');
		//console.log("Prev tranCounter=", $storage.tranCounter);
		$storage.tranCounter += 1;

		return $http.post(host+"/transactions", {budget:b, token:getToken()}).
			then(end);
	}

	function deleteTransaction(tId){
		return $http.post(host+"/deleteTransaction", {transactionId:tId, token:getToken()}).
			then(end);	
	}

		function saveTransaction(t){
		return $http.post(host+"/addTransaction", {transaction:t, token:getToken()}).
			then(end);
	}

	function updateTransaction(t){
		return $http.post(host+"/updateTransaction", {transaction:t, token:getToken()}).
			then(end);
	}

	function getTranByCat(cId, bId){
		return $http.post(host+"/getTransactionsByCat", {categoryId:cId, budgetId:bId, token:getToken()}).
			then(end);
	}


	/***** Budget section ******/

	function getBudgetSpentCosts(bId){
		return $http.post(host+"/getBudgetSpentCosts",{budget:bId, token:getToken()}).
			then(end);
	}

	function saveBudget(b){
		return $http.post(host+"/addBudget",{budget:b, token:getToken()}).
			then(end);
	}

	function getBudgets(){
		return $http.post(host+"/budgets", {token:getToken()}).
			then(end);
	}

	function getBudget(bId){
		return $http.post(host+"/getBudget",{budget:bId, token:getToken()}).
			then(end);
	}

	function budgetExists(bName){
		return $http.post(host+"/budgetExists",{budget:bName, token:getToken()}).
			then(end);	
	}

	function loadBudgetCategories(b){
		return $http.post(host+"/getBudgetCategories", {budget:b, token:getToken()}).
			then(end);
	}

	function deleteBudget(b){
		return $http.post(host+"/deleteBudget",{budget:b, token:getToken()}).
			then(end);
	}


	/******* Categories section *********/

	function getCategories(){
		return $http.post(host+"/categories", {token:getToken()}).
			then(end);
	}

	function saveCategory(c){
		return $http.post(host+"/addCategory", {category:c, token:getToken()}).
			then(end);
	}

	function deleteCategory(c){
		//console.log("deleteCategory:c",c);
		return $http.post(host+"/deleteCategory", {category:c, token:getToken()}).
			then(end);
	}

	function catExists(c){
		return $http.post(host+"/categoryExists", {category:c, token:getToken()}).
			then(end);
	}

	// *********** Auth ***************** //

	function reg(regData){
		return $http.post(host+"/register", {name:regData.name, surname:regData.surname, login:regData.login, pass:regData.pass, email:regData.email, token:getToken()}).
			then(end);
	}

	function authorize(loginData){
		return $http.post(host+"/authorize", {login:loginData.login, pass:loginData.pass}).
			then(end);
	}

	function logout(){
		return $http.post(host+"/logout", {token:getToken()}).
			then(end);
	}

	function isAuth(callback){
		return $http.post(host+"/isauth", {token:getToken()}).
			then(callback);
	}

	function authorized(){
		//console.log("authorized:", $storage.token !== null);
		return $storage.token !== null;
	}

	function setCurrentUser(u){
		//console.log("setCurrentUser:", u);
		//appData.currentUser = u;
		$storage.uname = u.name;
		$storage.usurname = u.surname;
	}

	function getCurrentUser(){
		//console.log("getCurrentUser");
		var user = {};
		user.name = $storage.uname;
		user.surname = $storage.usurname;
		return user;
	}

	function getLoginData(){
		// TODO: define method for retrieving stored login data

		// mock implementation
		//var loginData = {login:"max", pass:"asd"};

		return $storage.loginData;
	}

	function setLoginData(loginData){
		//console.log("setLoginData:", loginData);
		$storage.loginData = loginData;
	}

	function setToken(token){
		//console.log("setToken()");
		$storage.token = token;
	}

	function getToken(){
		//console.log("$storage.token:", $storage.token);
		return $storage.token;
	}

	// local utilities
	function end(r){
		//returns response data
		//console.log('r.data:', r.data);
		//console.log('result:',r);
		return r.data;
	}
}