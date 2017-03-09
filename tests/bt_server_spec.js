//var server = require("../server.js");
var Category = require("../public/js/modules/category.js");
var request = require("request");

var host = "http://localhost:8080";
var testToken = "eyJhbGciOiJIUzI1NiJ9.dGVzdA.fdnckibWxoDmu_0WM4tindnxCnp6kxXUYs-1B6E6yiM";

describe("Budget Tracker server", function(){

	/* 
	* Test /api service
	*/
	describe("Test api service", function(){
		var uri = "/api";

		it("GET /api exists and returns code 200", function(done){
			
			request.get(host+uri, function(err, response, body){
				expect(response.statusCode).toBe(200);
				done();

			});
		});

		it("Test /api check body status to be 1", function(done){
			
			request.get(host+uri, function(err, response, body){
				var b = JSON.parse(body);

				expect(b.status).toBe(1);
				done();
			});
		});

		it("Test /api check apiList length to be 1", function(done){
			
			request.get(host+uri, function(err, response, body){
				var b = JSON.parse(body);

				expect(b.data).not.toBe(null);
				expect(b.data.length).toBe(1);
				done();

			});

		});

	});

	/*
	* Test category related services
	*/

	describe("Test category related services", function(){
		/*
		* input args:
		* 	- token
		*/
		it("Test /categories status 200", function(done){
			var uri = "/categories";

			request.post({url:host+uri, form:{token:testToken}}, function(err, response, body){
				expect(response.statusCode).toBe(200);
				done();
			});
		});

		/*
		* input args:
		* 	- token
		*/
		it("Test /categories body status 1", function(done){
			var uri = "/categories";

			request.post({url:host+uri, form:{token:testToken}}, function(err, response, body){
				var b = JSON.parse(body);

				expect(b.status).toBe(1);
				done();

			});

		});

		/*
		* input args:
		* 	- token
		*/
		it("Test /categories data length is 0", function(done){
			var uri = "/categories";

			request.post({url:host+uri, form:{token:testToken}}, function(err, response, body){
				var b = JSON.parse(body);

				expect(b.data.length).toBe(0);
				done();
			});

		});

		/*
		* input args:
		* 	- token
		* 	- category - model to add
		*/
		it("Test /addCategory with null category", function(done){
			var uri="/addCategory";
			var catToAdd = null;

			request.post({url:host+uri, form:{category:catToAdd, token:testToken}}, function(err, response, body){
				var b = JSON.parse(body);

				expect(b.status).toBe(0);
				expect(b.msg).toBe("No category found!");
				done();
			});			
		});

		var insertId = null;
		
		/*
		* input args:
		* 	- token
		* 	- category - model to add
		*/
		it("Test /addCategory with category", function(done){
			var uri="/addCategory";
			var catToAdd = {};

			catToAdd.name = "Test1";
			catToAdd.type = 1;
			catToAdd.style = "Yellow";

			var formData = {category:catToAdd, token:testToken};

			var options = {
			    url: host+uri,
			    method: 'POST',
			    //Lets post the following key/values as form
			    json: formData
			}

			request(options, function(err, response, body){
				if(err) console.log(err);

				//console.log("status:",body.status);
				insertId = body.data.insertId;
				//console.log("\n insertId:"+insertId);

				expect(body.status).toBe(1);
				done();
			});
		});

				/*
		* input args:
		* 	- token
		* 	- category - model to find
		* result:
			- body.status to be 1
			- body.data[0].categories to be 1
		*/
		it("Test /categoryExists", function(done){
			var uri="/categoryExists";
			var catToDel = {};

			catToFind = "Test1";
			
			var formData = {category:catToFind, token:testToken};

			var options = {
			    url: host+uri,
			    method: 'POST',
			    json: formData
			}

			request(options, function(err, response, body){
				if(err) console.log(err);

				expect(body.status).toBe(1);
				expect(body.data[0].categories).toBe(1);
				done();
			});
		});


		/*
		* input args:
		* 	- token
		* 	- category - model to delete
		* result:
			- body.status to be 1
			- body.msg to be "Delete successfull!"
		*/
		it("Test /deleteCategory", function(done){
			var uri="/deleteCategory";
			var catToDel = {};

			catToDel.id = insertId;
			
			var formData = {category:catToDel, token:testToken};

			var options = {
			    url: host+uri,
			    method: 'POST',
			    json: formData
			}

			request(options, function(err, response, body){
				if(err) console.log(err);

				expect(body.status).toBe(1);
				expect(body.msg).toBe("Delete successfull!");
				done();
			});
		});

	});

	/*
	* Test /budgets service
	* input args:
	* 	- token
	*/

	describe("Test budget related services", function(){
		var uri = "/budgets";

		it("/budgets status 200", function(done){

			request.post({url:host+uri, form:{token:testToken}}, function(err, response, body){
				expect(response.statusCode).toBe(200);
				done();
			});
		});

		it("/budgets body status 1", function(done){

			request.post({url:host+uri, form:{token:testToken}}, function(err, response, body){
				var b = JSON.parse(body);

				expect(b.status).toBe(1);
				done();

			});

		});

		it("/budgets data length is 1", function(done){

			request.post({url:host+uri, form:{token:testToken}}, function(err, response, body){
				var b = JSON.parse(body);

				expect(b.data.length).toBe(0);
				done();
			});

		});

	});

	/*
	* Test Transactions services
	* input args:
	* 	1. token
	* 	2. budgetName
	*/

	describe("Test transaction related services", function(){
		var uri = "/transactions";

		it("Test load transaction status 200", function(done){

			request.post({url:host+uri, form: {token:testToken, budget:null}}, function(err, response, body){
				var b = JSON.parse(body);

				expect(response.statusCode).toBe(200);
				expect(b.status).toBe(0);
				done();
			});
		});

		it("Test load transactions with null budget", function(done){

			request.post({url:host+uri, form: {token:testToken, budget:null}}, function(err, response, body){
				var b = JSON.parse(body);
				//console.log(b);

				expect(b.status).toBe(0);
				expect(b.data.length).toBe(0);
				expect(b.msg).toBe("No budget found!");
				done();
			});
		});
	});
});