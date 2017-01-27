#!/bin/env node

// https://learn.javascript.ru/screencast/nodejs

//var https = require("https");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var fs = require("fs");
var cookieParser = require('cookie-parser')
var session = require('express-session');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var db = require("./database");

var LoggerFactory = require("./public/js/modules/logger.js").LoggerFactory;
var logger = LoggerFactory.getLogger({label:"Server"});

var host = process.env.OPENSHIFT_NODEJS_IP; 
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

if (typeof host === "undefined") {
	//  Log errors on OpenShift but continue w/ 127.0.0.1 - this
	//  allows to run/test the app locally.	
	host = process.env.BUDGET_HOST;
	logger.info("No OPENSHIFT_NODEJS_IP var, using %s",host);
}

app = express();

/*
var options = {
	key  : fs.readFileSync('security/server.key'),
	cert : fs.readFileSync('security/server.crt')
};
*/

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( urlencodedParser ); // Parse request body into request.body.
app.use( cookieParser() );
app.use( session({ 
	secret: 'fskljlsdkfkljsdf',
	resave:false,
	saveUninitialized:true,
	maxAge:null,
} ) );


app.use(express.static(path.join(__dirname, 'public')));

//******************* API *****************************\\


/********************* Transactions *******************************/
app.post("/transactions", function(request,response){
	logger.info("transactions()");

	logger.info('budget:',typeof request.body.budget !== 'undefined');

	if( isAuthorized(request, response)  &&  typeof request.body.budget !== 'undefined'){
		// logger.info("request.body",request.body.season, request.body);
		db.loadTransactions(request.session.user, request.body.budget ,response, sendResponse);
	}
	else{
		sendResponse(response, {status:1});
	}

	logger.info("~transactions()");
});

app.post("/addTransaction", function(request, response){
	logger.info("addTransaction()");

	if( isAuthorized(request, response) ){

		var transaction = request.body.transaction;
		db.addTransaction(request.session.user, transaction, response, sendResponse);
	}

	logger.info("~addTransaction()");
});

app.post("/deleteTransaction", function(request, response){
	logger.info("Delete transaction.");

	if( isAuthorized(request, response) ){
		db.deleteTransaction(request.session.user, request.body.transactionId, response, sendResponse);
	}

	logger.info("Transaction deleted.")
});

app.post("/updateTransaction", function(request, response){
	logger.info("updateTransaction()");

	if( isAuthorized(request, response) ){
		db.updateTransaction(request.session.user, request.body.transaction, response, sendResponse);
	}

	logger.info("~updateTransaction()");
});

app.post("/getTransactionsByCat", function(request, response){
	logger.info("getTransactionsByCat()");

	if( isAuthorized(request, response) ){
		db.loadTransactionsByCat(request.body.category, request.body.budget, request.session.user, response, sendResponse);
	}

	logger.info("~getTransactionsByCat()");
});



/************************ Categories ********************************/

app.get("/categories", function(request, response){
	logger.info("transactions()");

	if( isAuthorized(request, response) ){
		db.loadCategories(request.session.user, response, sendResponse);
	}

	logger.info("~transactions()");
});

app.post("/addCategory", function(request, response){
	logger.info(".addCategory");

	if( isAuthorized(request, response) ){
		var cat = request.body.category;
		db.addCategory(request.session.user, cat, response, sendResponse);
	}

	logger.info("~addCategory()");
});

app.post("/deleteCategory", function(request, response){
	logger.info("/deleteCategory");

	if( isAuthorized(request, response) ){
		db.deleteCategory(request.session.user, request.body.category, response, sendResponse);
	}
});

app.post("/categoryExists", function(request, response){
	logger.info("/categoryExists");

	if( isAuthorized(request, response) ){
		db.categoryExists(request.session.user, request.body.category, response, sendResponse);
	}
});

/***************************** END Categories **********************************/

/**************************** Budgets ********************************************/

app.get("/budgets", function(request, response){
	//logger.info("budgets()");

	if( isAuthorized(request, response) ){
		db.loadBudgets(request.session.user, response, sendResponse);
	}

	//logger.info("~budgets()");
});

app.post("/getBudget", function(request, response){
	//logger.info("getBudget()");

	if( isAuthorized(request,response) ){
		db.loadBudget(request.session.user, request.body.budget, response, sendResponse);
	}

	//logger.info("~getBudget()");
});

app.post("/addBudget", function(request, response){
	logger.info("addBudget()");

	if( isAuthorized(request, response) ){
		db.addBudget(request.session.user, request.body.budget, response, sendResponse);
	}

	logger.info("~addBudget()");
});

app.post("/getBudgetSpentCosts", function(request, response){
	logger.info("server:getSpentCosts()");

	if( isAuthorized(request, response) ){
		var budget = request.body.budget;
		db.getBudgetSpentCosts(request.session.user, request.body.budget, response, sendResponse);
	}

	logger.info("~server:getSpentCosts()");
});

app.post("/getBudgetCategories", function(request, response){
	logger.info("budgetCategories()");

	if( isAuthorized(request, response) ){
		db.loadBudgetCategories(request.session.user, request.body.budget, response, sendResponse);
	}

	logger.info("~budgetCategories()");
});

app.post("/deleteBudget", function(request, response){
	logger.info("/deleteBudget");

	if( isAuthorized(request, response) ){
		db.deleteBudget(request.session.user, request.body.budget, response, sendResponse);
	}

});

app.post("/budgetExists", function(request, response){

	if( isAuthorized(request, response) ){
		db.budgetExists(request.session.user, request.body.budget, response, sendResponse);
	}

});

/************************* END Budgets **************************************************/


/************************* Common API ***************************************************/

app.post("/authorize", function(request, response){
	//logger.info("authorize()");

	//logger.info(request.body.login, request.body.pass);
	//logger.info("session.authorized:"+request.session.authorized);

	if( !session.authorized ){
		db.authorize(request.body.login, request.body.pass, response, function(r){
			if(r.status){
				request.session.authorized = true;
				request.session.user=request.body.login;
				sendResponse( response, r );
			}
			else{
				sendResponse(response, r);
				logger.warn("Authorization attempt failed:",request.body.login, request.body.pass);
			}
		});
	}
	else{
		logger.info("Already authorized.");
	}

	//logger.info("~authorize()");
});

app.get("/logout", function(request, response){
	logger.info("logout()");

	// clear user information
	delete request.session.authorized;
	delete request.session.user;

	// redirect to main page
	sendResponse(response, {status:1, msg:"Good bye!"});

	logger.info("~logout()");
});

app.get("/isauth", function(request, response){
	//logger.info("isauth()");
	if( isAuthorized(request, response) ){
		sendResponse(response, {status:1, user:request.session.user});
	}
	//logger.info("~isauth()");
});

app.post("/register", function(request, response){
	logger.info("register()");
	db.register(request.body.name, request.body.login , request.body.pass , response, sendResponse);
	logger.info("register()");
});

/************************************ END Common API *****************************************/


/*********************************** Utils ***************************************************/

sendResponse = function(response, data){
	//logger.info("sendResponse()");
	// Convert data to Json-friendly object
	// Send results back to the client
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.send(data);
	response.end();

	//logger.info("~sendResponse()");
}

// check user authorization
isAuthorized = function(request,response){
	//logger.info("isAuthorized()");

	if( request.session.authorized ){
		//logger.info("+");
		return true;
	}

	//response.writeHead(303,{Location:"/"});
	response.send({status:0, msg:"Not authorized"});
	response.end();
	//logger.info("-");
	return false;
}

/******************************** END Utils ******************************************************/

app.listen(port,host);
logger.info("Server started at host:"+host+":"+port);
