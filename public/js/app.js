// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('budgetTrackerApp', ['ionic'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});
})

.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider

	.state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'mainController'
	})

	.state("app.home",{
		url:"/home",
		views: {
			'menuContent': {
				templateUrl: 'templates/home.htm',
				controller: 'mainController'
			}
		}
	})

	.state("app.add",{
		url:"/add",
		views: {
			'menuContent': {
				templateUrl: 'templates/add.htm',
				controller: 'mainController'
			}
		}
	})

	.state("app.addTransaction",{
		url:"/addTransaction",
		views: {
			'menuContent': {
				templateUrl: 'templates/addTransaction.htm',
				controller: 'mainController'
			}
		}
	})

	.state("app.addCategory",{
		url:"/addCategory",
		views: {
			'menuContent': {
				templateUrl: 'templates/addCategory.htm',
				controller: 'mainController'
			}
		}
	})

	.state("app.addBudget",{
		url:"/addBudget",
		views: {
			'menuContent': {
				templateUrl: 'templates/addBudget.htm',
				controller: 'mainController'
			}
		}
	})

	.state("app.transactions", {
		url:"/transactions",
		views:{
			'menuContent':{
				templateUrl: 'templates/transactions.htm',
				controller: "mainController"
			}
		}
	})

	.state("app.categories", {
		url:"/categories",
		views:{
			'menuContent':{
				templateUrl: 'templates/categories.htm',
				controller: "mainController"
			}
		}
	})

	.state("app.budgets", {
		url:"/budgets",
		views:{
			'menuContent':{
				templateUrl: 'templates/budgets.htm',
				controller: "mainController"
			}
		}
	})

	.state("app.settings", {
		url:"/settings",
		views:{
			'menuContent':{
				templateUrl: 'templates/settings.htm',
				controller: "mainController"
			}
		}
	});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/home');
});
