/*
* greeterService.js
*
* Greater service object
* 
* API
* 	- greet(text)
*/

function greeter($window){
	return{
		greet:function(text){
			$window.alert("Hello to " + text + " from greeter!");

		}
	};
}