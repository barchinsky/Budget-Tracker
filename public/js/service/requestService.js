/*
* Service to send and get requests from the server
*/

function Request($http, $timeout){
	var response = null;

	return {
		post: function(path, params, callback){
			$http.post(path, params).success(function(r){
				callback(r);
			});
		}
	};
}