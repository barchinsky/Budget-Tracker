/*
* Shared Data Stored object serves as buffer storage between the controllers
*/

"use strict";

function SharedStorageService(){
	let obj = {
		user:null,
		authorized:false,
		url:config.authPage,
	};

	return obj;
}