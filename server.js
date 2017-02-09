#!/bin/env node

// https://learn.javascript.ru/screencast/nodejs

//var https = require("https");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
//var fs = require("fs");
//var cookieParser = require('cookie-parser')
//var session = require('express-session');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jwt = require("jsonwebtoken");

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

app.set("jwtsecret","btjwt102402022017");

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( urlencodedParser ); // Parse request body into request.body.
//app.use( cookieParser() );

/*app.use( session({ 
	secret: 'fskljlsdkfkljsdf',
	resave:false,
	saveUninitialized:true,
	maxAge:null,
} ) );
*/

app.use(express.static(path.join(__dirname, 'public')));

var openUrls = [
	{pattern:"^/register"},
	{pattern:"^/authorize"}
];

app.use("/", isAuthorized(openUrls) );

//******************* API *****************************\\


/********************* Transactions *******************************/
app.post("/transactions", function(request,response){
	logger.info("transactions()");

	logger.info('budget:',typeof request.body.budget !== 'undefined');

	//if( isAuthorized(request, response)  &&  typeof request.body.budget !== 'undefined'){
		// logger.info("request.body",request.body.season, request.body);
	var user = request.body.user;
	db.loadTransactions(user, request.body.budget ,response, sendResponse);
	//}
	//else{
	//	sendResponse(response, {status:1});
	//}

	logger.info("~transactions()");
});

app.post("/addTransaction", function(request, response){
	logger.info("addTransaction()");

	////if( isAuthorized(request, response) ){

	var transaction = request.body.transaction;
	var user = request.body.user;
	db.addTransaction(user, transaction, response, sendResponse);
	//}

	logger.info("~addTransaction()");
});

app.post("/deleteTransaction", function(request, response){
	logger.info("Delete transaction.");

	////if( isAuthorized(request, response) ){
	var user = request.body.user;
	db.deleteTransaction(user, request.body.transactionId, response, sendResponse);
	//}

	logger.info("Transaction deleted.")
});

app.post("/updateTransaction", function(request, response){
	logger.info("updateTransaction()");

	////if( isAuthorized(request, response) ){
	var user = request.body.user;
	db.updateTransaction(user, request.body.transaction, response, sendResponse);
	//}

	logger.info("~updateTransaction()");
});

app.post("/getTransactionsByCat", function(request, response){
	logger.info("getTransactionsByCat()");

	//if( isAuthorized(request, response) ){
	logger.info(request.body);

	var user = request.body.user;
	var cId = request.body.categoryId;
	var bId = request.body.budgetId;

	db.loadTransactionsByCat(cId, bId, user, response, sendResponse);
	//}

	logger.info("~getTransactionsByCat()");
});



/************************ Categories ********************************/

app.post("/categories", function(request, response){
	logger.info("transactions()");

	////if( isAuthorized(request, response) ){
	var user = request.body.user;
	db.loadCategories(user, response, sendResponse);
	//}

	logger.info("~transactions()");
});

app.post("/addCategory", function(request, response){
	logger.info(".addCategory");

	////if( isAuthorized(request, response) ){
	var user = request.body.user;
	var cat = request.body.category;
	db.addCategory(user, cat, response, sendResponse);
	//}

	logger.info("~addCategory()");
});

app.post("/deleteCategory", function(request, response){
	logger.info("/deleteCategory");

	////if( isAuthorized(request, response) ){
	var user = request.body.user;
	var category = request.body.category;
	logger.info("category:%s", category);
	db.deleteCategory(user, category, response, sendResponse);
	//}
});

app.post("/categoryExists", function(request, response){
	logger.info("/categoryExists");

	////if( isAuthorized(request, response) ){
	var user = request.body.user;
	db.categoryExists(user, request.body.category, response, sendResponse);
	//}
});


/**************************** Budgets ********************************************/

app.post("/budgets", function(request, response){
	logger.info("budgets()");

	////if( isAuthorized(request, response) ){
	var user = request.body.user;
	db.loadBudgets(user, response, sendResponse);
	//}

	logger.info("~budgets()");
});

app.post("/getBudget", function(request, response){
	//logger.info("getBudget()");

	//if( isAuthorized(request,response) ){
	var user = request.body.user;
	db.loadBudget(user, request.body.budget, response, sendResponse);
	//}

	//logger.info("~getBudget()");
});

app.post("/addBudget", function(request, response){
	logger.info("addBudget()");

	//if( isAuthorized(request, response) ){
	var user = request.body.user;
	db.addBudget(user, request.body.budget, response, sendResponse);
	//}

	logger.info("~addBudget()");
});

app.post("/getBudgetSpentCosts", function(request, response){
	logger.info("server:getSpentCosts()");

	//if( isAuthorized(request, response) ){
	var user = request.body.user;
	var budget = request.body.budget;
	db.getBudgetSpentCosts(user, request.body.budget, response, sendResponse);
	//}

	logger.info("~server:getSpentCosts()");
});

app.post("/getBudgetCategories", function(request, response){
	logger.info("budgetCategories()");

	//if( isAuthorized(request, response) ){
	var user = request.body.user;
	db.loadBudgetCategories(user, request.body.budget, response, sendResponse);
	//}

	logger.info("~budgetCategories()");
});

app.post("/deleteBudget", function(request, response){
	logger.info("/deleteBudget");

	//if( isAuthorized(request, response) ){
	var user = request.body.user;
	db.deleteBudget(user, request.body.budget, response, sendResponse);
	//}

});

app.post("/budgetExists", function(request, response){

	//if( isAuthorized(request, response) ){
	var user = request.body.user;
	db.budgetExists(user, request.body.budget, response, sendResponse);
	//}

});


/************************* Common API ***************************************************/

app.post("/authorize", function(request, response){
	logger.info("authorize()");

	var user = request.body.login;
	var pass = request.body.pass;

	if( user && pass){ // if credentials exists
		logger.info("credentials found in request.");
		db.authorize(user, pass, function(r){
			if( r.status ){ // user found and pass confirmed
				logger.info("user found and confirmed");
				var token = generateUserToken(user);
				
				var userInfo = db.getUserInfo(user, function(user){
					sendResponse(response, {status:1, token:token, user:user});
				});
			}
			else{
				logger.warn("Authorization failed. User or pass is invalid.")
				sendResponse(response, {status:0, data:{}, msg:"User or pass is invalid."});
			}
		});
	}
	else{
		logger.warn("User credentials not in request.");
		sendResponse(response, {status:0, msg:"User credentials not found!"});
	}

	
	//sendResponse( response, {status:1, user:request.body.user} );

	//logger.info(request.body.login, request.body.pass);
	//logger.info("session.authorized:"+request.session.authorized);

	/*if( !session.authorized ){
		db.authorize(request.body.login, request.body.pass, response, function(r){
			if(r.status){
				request.session.authorized = true;
				user=request.body.login;
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
	}*/

	logger.info("~authorize()");
});

app.post("/logout", function(request, response){
	logger.info("logout()");

	// clear user information
	//delete request.session.authorized;
	//delete user;

	// redirect to main page
	sendResponse(response, {status:1, msg:"Good bye!"});

	logger.info("~logout()");
});

app.post("/isauth", function(request, response){
	logger.info("isauth()");

	//logger.info(request.body);
	//if( isAuthorized(request, response) ){
	db.getUserInfo(request.body.user, function(r){
		sendResponse(response, {status:1, user:r});
	});
	//}
	logger.info("~isauth()");
});

app.post("/register", function(request, response){
	logger.info("register()");

	var login = request.body.login;
	//logger.info("request:", request.body);
	//logger.info("login:", login);
	db.userExist(login, function(r){
		if( !r ){
			var token = generateUserToken(login);
			logger.info("token for user:%s generated: %s", login, token );
			db.register(request.body.name, request.body.surname, request.body.login , request.body.pass, request.body.email, token, response, sendResponse);
		}
		else
			sendResponse(response, {status:0, data:{}, msg:"User already exists! Try another login."});
	});
	
	logger.info("register()");
});

app.get("/api", function(request, response){
	response.send({status:1, data:"empty"});
});


/*********************************** Utils ***************************************************/

generateUserToken = function(login){
	return jwt.sign(login, app.get("jwtsecret"), {});
}

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
function isAuthorized(openUrls){
	logger.info("isAuthorized()");

	function check(request, response, next){

		var requestedUrl = request.url;
		logger.info("requestedUrl:%s", requestedUrl);

		for(var ui in openUrls){
			 var pattern = openUrls[ui].pattern;
			 if( requestedUrl.match(pattern) ){
			 	logger.info("pattern matched.")
			 	next();
			 	return;
			 }
		}

		var token = request.body.token;
		//logger.info("token:%s,",token);

		// if token found
		if(token !== undefined && token !== null && token.length){
			// check token
			jwt.verify(request.body.token, app.get("jwtsecret"), {ignoreExpiration:true}, function(err, decoded){

				//if some errors occured
				if(err){
					logger.warn("isAuthorized()::%s", err.toString());
					sendResponse(response, {status:0, msg:"Authorization failed!"})
					return false;
				}

				logger.info("decoded:", decoded);
				 // if such user exists in db
				db.userExist(decoded, function(r){
					if (r){
						request.body.user = decoded;
						next();
					}
					else{
						logger.warn("Suspicious activity detected. User log in attempt with unknow login.");
						sendResponse(response, {status:0, msg:"Auth failed. Code:1488."});
					}
				});
			});
		}else{ // if there is no token provided in request
			sendResponse(response, {status:0, msg:"Auth failed. Code:1488."});
		}
	}

	return check;
}

/******************************** END Utils ******************************************************/

app.listen(port,host);
logger.info("Server started at host:"+host+":"+port);
