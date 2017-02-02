"use strict";

class Budget{
	constructor(obj=null){
		if( obj !== null ){
			this.id = obj.id;
			this.name = obj.name;
			this.startDate = obj.startDate;
			this.endDate = obj.endDate;
			this.categories = obj.categories;
			this.totalCosts = obj.totalCosts;
			this.incomeCosts = obj.incomeCosts===null?0:obj.incomeCosts;
			this.spentCosts = obj.spentCosts===null?0:obj.spentCosts;
			this.spentPerc = obj.spentPerc===null?0:obj.spentPerc;
		}
		else{
				this.id = null;
				this.name = "";
				this.startDate = null;
				this.endDate = null;
				this.startRawDate = null;
				this.endRawDate = null;
				this.categories = [];
				this.totalCosts = 0;
				this.incomeCosts = 0;
				this.spentCosts = 0;
				this.spentPerc = 0.0;
		}
	}

	static parseArray(arr){
		var res = arr.map(function(obj){
			return Budget.parseObj(obj);

		});

		return res;
	}

	static parseObj(obj){
		return new Budget(obj);
	}
}