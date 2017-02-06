console.log("Category loading...");

"use strict";

class Category{
	constructor(obj=null){
		if(obj != null){
			this.id = obj.id;
			this.name = obj.name;
			this.style = obj.style;
			this.type = obj.type;
			this.id = obj.id;
			this.budgetId = obj.budgetId?obj.budgetId:null;
			this.spentPerc = obj.spentPerc?obj.spentPerc:0;
			this.spent = obj.spent?obj.spent:0;
			this.booked = obj.booked?obj.booked:0;
		}
		this.nameLen = 30;
	}

	static parseArray(arr){
		var res = arr.map(function(obj){
			return Category.parseObj(obj);

		});

		return res;
	}

	static parseObj(obj){
		return new Category(obj);
	}
};

Category.prototype.toString = function(){
	return JSON.stringify(this);
};


console.log("Category loaded.");