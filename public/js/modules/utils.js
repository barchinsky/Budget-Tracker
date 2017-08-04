"use strict";
// Parse date from Android format to mysql

var formatDate = function(d){
	var date  = new Date(d);
	var r = date.getFullYear() + "-"+ (date.getMonth() + 1) + "-" + date.getDate() + " " + new Date().getHours() + ":" + new Date().getMinutes();

	return r;
}

var validatePass = function(p1, p2){
	console.log("validatePath");
	return p1 === p2 ?true:false;
}