"use strict";

class Budget{
	constructor(obj=null){
		if( obj !== null ){
			this.name = obj.name;
			this.startDate = obj.startDate;
			this.endDate = obj.endDate;
			this.categories = obj.categories;
			this.totalCosts = obj.totalCosts;
			this.incomeCosts = obj.incomeCosts;
		}
		else{
				this.name = "";
				this.startDate = null;
				this.endDate = null;
				this.startRawDate = null;
				this.endRawDate = null;
				this.categories = [];
				this.totalCosts = 0;
				this.incomeCosts = 0;
		}
	}
}