/* Convert string to sentence case */

angular.
	module('budgetTrackerApp').
	filter('titleCase', titleCase);


function titleCase(){
	return function(str){
			console.log("str:", str);
			str = str.toLowerCase().trim().split(' ')[0];
	        return str.substring(0,1).toUpperCase() + str.slice(1);
	}
}