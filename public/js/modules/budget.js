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
			this.startRawDate = new Date();
			this.endRawDate = new Date(this.startRawDate.getFullYear(), this.startRawDate.getMonth()+1, this.startRawDate.getDay());
			this.categories = [];
			this.totalCosts = 0;
			this.incomeCosts = 0;
			this.spentCosts = 0;
			this.spentPerc = 0.0;
		}

		this.datesValid = true;
		this.suchNameAlreadyExists = false;
	}

	isDatesValid(){
		console.log("isDatesValid()");

		if( this.startRawDate > this.endRawDate ) this.datesValid = false;
		if( !this.startRawDate || ! this.endRawDate ) this.datesValid = false;
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