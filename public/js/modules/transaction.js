"use strict";

class Transaction {
	constructor(obj=null){
			if(obj!=null){
				this.id = +obj.id;
				this.name = obj.name;
				this.date = new Date(obj.date);
				this.cost = +obj.cost;
				this.category = {name:obj.catName, style:obj.catStyle};
				this.comment = obj.comment;
				this.catStyle = obj.catStyle;
				this.rawDate = obj.rawDate;
				this.categoryName = obj.categoryName;
				this.categoryId = obj.categoryId;
			}
			else{
				this.date = new Date();
				this.rawDate = new Date();
			}
			this.nameLen = 30;
			this.commentLen = 100;
	}

	static parseArray(arr){
		var res = arr.map(function(obj){
			return Transaction.parseObj(obj);

		});

		//console.log("Transaction.parseArray.res:", res);

		return res;
	}

	static parseObj(obj){
		return new Transaction(obj);
	}
}