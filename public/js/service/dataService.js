/*
* Define the app data exchange logic 
*/

function DataService($http){

	//var isDev = true;
	var host = config.isDev?config.devHost:config.host;

	var services = {
		getTransactions: getTransactions,
		deleteTransaction: deleteTransaction,
		getBudgetSpentCosts: getBudgetSpentCosts,
		getBudgets: getBudgets,
		loadBudgetCategories: loadBudgetCategories,
		deleteBudget: deleteBudget,
		getCategories: getCategories,
		register: reg,
		auth: auth,
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
	};

	return services;

	function getTransactions(b){
		/* Loads transactions for budget */
		console.log('dataService.js:getTransactions()')

		return $http.post(host+"/transactions", {budget:b}).
			then(end);
	}

	function deleteTransaction(tId){
		return $http.post(host+"/deleteTransaction", {transactionId:tId}).
			then(end);	
	}

		function saveTransaction(t){
		return $http.post(host+"/addTransaction", {transaction:t}).
			then(end);
	}

	function updateTransaction(t){
		return $http.post(host+"/updateTransaction", {transaction:t}).
			then(end);
	}

	function getTranByCat(c, b){
		return $http.post(host+"/getTransactionsByCat", {category:c, budget:b}).
			then(end);
	}


	/***** Budget section ******/

	function getBudgetSpentCosts(b){
		return $http.post(host+"/getBudgetSpentCosts",{budget:b}).
			then(end);
	}

	function saveBudget(b){
		return $http.post(host+"/addBudget",{budget:b}).
			then(end);
	}

	function getBudgets(){
		return $http.get(host+"/budgets",[]).
			then(end);
	}

	function getBudget(bName){
		return $http.post(host+"/getBudget",{budget:bName}).
			then(end);
	}

	function budgetExists(bName){
		return $http.post(host+"/budgetExists",{budget:bName}).
			then(end);	
	}

	function loadBudgetCategories(b){
		return $http.post(host+"/getBudgetCategories", {budget:b}).
			then(end);
	}

	function deleteBudget(b){
		return $http.post(host+"/deleteBudget",{budget:b}).
			then(end);
	}
	/****** END Budget section ******/

	/******* Categories section *********/

	function getCategories(){
		return $http.get(host+"/categories", []).
			then(end);
	}

	function reg(n,l,p){
		return $http.post(host+"/register", {name:n, login:l, pass:p}).
			then(end);
	}

	function auth(l,p){
		return $http.post(host+"/authorize", {login:l, pass:p}).
			then(end);
	}

	function logout(){
		return $http.get(host+"/logout",[]).
			then(end);
	}

	function isAuth(){
		return $http.get(host+"/isauth",[]).
			then(end);
	}

	function saveCategory(c){
		return $http.post(host+"/addCategory", {category:c}).
			then(end);
	}

	function deleteCategory(c){
		console.log("deleteCategory:c",c);
		return $http.post(host+"/deleteCategory", {category:c}).
			then(end);
	}

	function catExists(c){
		return $http.post(host+"/categoryExists", {category:c}).
			then(end);
	}

	// local utilities
	function end(r){
		// returns response data
		// console.log('r.data:', r.data);
		return r.data;
	}
}