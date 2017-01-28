console.log("Category loading...");

"use strict";

class Category{
	constructor(obj=null){
		if(obj != null){
			this.name = obj.name;
			this.style = obj.style;
			this.type = obj.type;
			this.id = obj.id;
		}
		this.nameLen = 30;
	}
};

Category.prototype.toString = function(){
	return JSON.stringify(this);
};

console.log("Category loaded.");