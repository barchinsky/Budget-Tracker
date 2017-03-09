(function(){

	"use strict";

	var LoggerFactory = require("./public/js/modules/logger.js").LoggerFactory;
	var logger = LoggerFactory.getLogger({label:"Database"});

	logger.info("Module database.js loaded.");

	var mysql = require("mysql");
	var version = "1.1";

	var connection = function(){

		var isDev = true;

		if( isDev ){
			var conn = mysql.createConnection({
				host:process.env.MYSQL_HOST,
				user:process.env.MYSQL_USERNAME,
				password:process.env.MYSQL_PASS,
				database:"BudgetTrackerDev"
			});
		}else{
			var conn = mysql.createConnection({
				host     : process.env.OPENSHIFT_MYSQL_DB_HOST,
				user     : process.env.OPENSHIFT_MYSQL_DB_USERNAME,
				password : process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
				port     : process.env.OPENSHIFT_MYSQL_DB_PORT,
				database : process.env.OPENSHIFT_APP_NAME + version
			});
		}

		return conn;
	}

	var deleteRequest = function(sql, params, callback){
		logger.info("delete()");

		var conn = connection();

		conn.query(sql, params, function(err, result){
			if(!err){
				conn.commit();
				callback({status:1, msg:"Delete successfull!"});
			}
			else{
				logger.error(err.errno);
				var msg = parseError(err.errno);
				callback({status:0, msg:msg})
			}
			conn.end();
		});

		logger.info("~delete()");
	}

	var querySql = function(sql, params, callback){
		// Perform sql queries without send respose to the client
		logger.info("querySql()");

		var conn = connection();

		conn.query(sql, params, function(err, rows, fields){	
			if(!err){
				conn.commit();
				//logger.info("Query result:", rows[0]);
				callback({status:1, data:rows});
			}
			else{
				logger.error("Error occured. Msg:"+err.toString());
				var msg = parseError(err.errno);
				return callback({status:0, msg:msg});
			}
			conn.end();
		});

		logger.info("~querySql()");
	}

	var executeSql = function(sql, params, response, callback){
		// Perform sql query and send result to the client
		logger.info("executeSql()");
		//logger.info("sql:%s", sql);

		var conn = connection();
		//logger.info(params);

		conn.query(sql, params, function(err, rows, fields){
			if(!err){
				conn.commit();
				// send response
				callback(response, {data:rows, status:1});
			}
			else{
				//logger.info("database:executeSql():: Error occured. Message:"+err.toString()+" Sql:"+sql);
				logger.error(err.toString());
				var msg = parseError(err.errno);
				callback(response, {data:[], status:0, msg:msg});
			}
			conn.end();
		});

		logger.info("~executeSql()");
	}

	var parseError = function(errno){
		console.log(errno);
		switch (errno){
			case 1062:
				return "Record already exists";
			case 1451:
				return "Can not perform deletion. This item is referenced to another one. Please, delete parent first and try again."
			default:
				return "Ooops:( Give the number to your admin:"+errno;
		}
	}

	var loadTransactions = function(u, bId, response, callback){
		logger.info("loadTransactions()");

		logger.info("u:%s, bId:%d",u,bId);

		// Query data from dataabase
		var sql = 
			"select \
				t.id id, \
				t.name name, \
				DATE_FORMAT(t.t_date, '%Y-%m-%d %H:%i') date, \
				t.comment, \
				t.cost, \
				t.category, \
				c.name categoryName, \
				c.style categoryStyle\
			from Transaction t, Category c, Budget b \
			where \
				t.user=? and \
				(t.t_date between b.start_date and b.end_date) and\
				b.id=? and \
				c.id=t.category \
			order by t_date desc;";

		//logger.info(u,b);
		//logger.info("database::loadTransactions::sql "+sql);
		executeSql(sql, [u,bId], response, callback);

		logger.info("~loadTransactions()");
	}

	var addTransaction = function(u, t, response, callback){
		logger.info("addTransaction()");
		logger.info("transaction:",t);

		var sql = "insert into Transaction (name, t_date, comment, cost, style, user, category) values(?,?,?,?,?,?,?);";
		executeSql(sql, [t.name, t.d, t.comment, t.cost, t.category.style, u, t.category.id],response, callback);

		logger.info("~addTransaction()");
	}

	var deleteTransaction = function(u, tId, response, callback){
		logger.info("deleteTransaction()");

		var sql = "delete from Transaction where user=? and id=?;";
		executeSql(sql, [u, tId], response, callback);

		logger.info("~deleteTransaction()");
	}

	var updateTransaction = function(u, t, response, callback){
		logger.info("updateTransaction()");

		var sql = "update Transaction set name=?, t_date=?, comment=?, cost=?, style=?, category=? where id=? and user=?;";
		executeSql(sql, [t.name, t.date, t.comment, t.cost, t.category.style, t.category.name, t.id, u], response, callback);

		logger.info("~updateTransaction()");
	}

	var loadTransactionsByCat = function(cId, bId, u, response, callback){
		logger.info("loadTransactionsByCat()");

		logger.info("-------------------",u, bId, cId);

		var sql = 
		"select \
			t.id, \
			t.name, \
			DATE_FORMAT(t.t_date, '%Y-%m-%d %H:%i') date, \
			t.comment, \
			t.cost, \
			c.name categoryName, \
			c.id categoryId, \
			c.style catStyle\
		from Transaction t, Category c, Budget b \
		where \
			t.user=? and \
			b.user=t.user and \
			c.user=t.user and \
			t.category=? and\
			b.id=? and \
			c.id = t.category and \
			(t.t_date between b.start_date and b.end_date) \
		order by date desc;";

		executeSql(sql, [u, cId, bId], response, callback);

		logger.info("~loadTransactionsByCat()");
	}


	//////////////////////// Categories //////////////////////////////

	var loadCategories = function(u, response, callback){
		logger.info("loadCategories()");

		var sql = "select id, name, style, type from Category where user=?;";
		executeSql(sql, [u], response, callback);

		logger.info("~loadCategories()");
	}

	var addCategory = function(u, c, response, callback){
		logger.info("addCategory()");

		var sql = "insert into Category (name, style, type, user) values(?,?,?,?);";
		executeSql(sql, [c.name, c.style, c.type, u], response, callback);

		logger.info("~addCategory()");
	}

	var deleteCategory = function(u, c, response, callback){
		logger.info("deleteCategory()");
		logger.info("u,c",u,c);

		var sql = "delete from Category where id=? and user=?;";
		deleteRequest(sql, [c.id, u], function(r){
			callback(response, r);
		});

		logger.info("~deleteCategory()");
	}

	var categoryExists = function(u,c, response, callback){
		logger.info("categoryExists()");

		var sql = "select count(*) categories from Category where user=? and name=?;";
		executeSql(sql, [u,c], response, callback);

		logger.info("~categoryExists()");
	}


	var loadBudgets = function(u, response, callback){
		/*
			Load all budgets
		*/
		logger.info("loadBudgets()");

		var sql = 
		"select \
			b.id id, \
			b.name name,\
			DATE_FORMAT(b.start_date, '%Y-%m-%d') startDate, \
			DATE_FORMAT(b.end_date, '%Y-%m-%d') endDate, \
			total_costs totalCosts,\
			(select sum(t.cost) from Transaction t where (t.t_date between b.start_date and b.end_date) and t.category in (select c.id from Category c where c.type=0) ) incomeCosts,\
			(select sum(t.cost) from Transaction t where (t.t_date between b.start_date and b.end_date) and t.category in (select c.id from Category c where c.type=1) ) spentCosts, \
			( floor( (select spentCosts)/(select totalCosts) * 100 ) ) spentPerc\
		from \
			Budget b\
			where user=?\
			order by end_date desc;";

		executeSql(sql, [u], response, callback);

		logger.info("~loadBudgets()");
	}

	var loadBudget = function(u, bId, response, callback){
		// load budget by user and budget id

		logger.info("loadBudget()::bId:%s",bId);

		logger.info("loadBudgets()");

		var sql = 
		"select \
			b.id id, \
			b.name name,\
			DATE_FORMAT(b.start_date, '%Y-%m-%d') startDate, \
			DATE_FORMAT(b.end_date, '%Y-%m-%d') endDate, \
			total_costs totalCosts,\
			(select sum(t.cost) from Transaction t where (t.t_date between b.start_date and b.end_date) and t.category in (select c.id from Category c where c.type=0) ) incomeCosts,\
			(select sum(t.cost) from Transaction t where (t.t_date between b.start_date and b.end_date) and t.category in (select c.id from Category c where c.type=1) ) spentCosts \
		from \
			Budget b\
			where user=? and b.id = ?;";

		executeSql(sql, [u, bId], response, callback);

		logger.info("~loadBudgets()");
	}

	var loadBudgetCategories = function(u, b, response, callback){
		/*
			Load all budget categories by budget name.
		*/
		logger.info("loadBudgetCategories()");

		var sql = 
			"select \
				bc.budgetId,\
				bc.budgetName, \
				c.name, \
				c.id, \
				bc.catAmount booked, \
				(select \
					sum(t.cost) \
				from Transaction t \
				where \
					( t.t_date between ? and ?) and t.category = bc.category) spent, \
				(select c.style from Category c where id=category) style,	\
				(select c.type from Category c where id=category) type, \
				( (select spent)/(select booked)*100 ) spentPerc\
			from \
				BudgetCategories bc, \
				Category c \
			where \
				bc.budgetId=? and \
				bc.user=? and\
				c.id = bc.category;";

		executeSql(sql, [b.startDate, b.endDate, b.id, u], response, callback);

		logger.info("~loadBudgetCategories()");
	}

	var addBudget = function(u, b, response, callback){
		/*
			Inserts new budget.
			Inserts all categories data related to the budget.
		*/
		logger.info("addBudget()");
		//logger.info(b);

		var sql = "insert into Budget(name, start_date, end_date, user, total_costs) values(?,?,?,?,?);";

		//logger.info("sql budget:"+sql)

		querySql(sql, [b.name, b.startDate, b.endDate, u, b.totalCosts], function(r){
			logger.info("Add budget response status:%d",r.status);
			// if budget insertion failed
			//logger.info(r);
			if( !r.status )	callback(response, r);
			// if budget insertion was successfull
			else addBudgetCategories(u, r.data.insertId, b, response, callback);
		});

		logger.info("~addBudget()")
	}

	var addBudgetCategories = function(u, bId, b, response, callback){
		logger.info("addBudgetCategories()");

		logger.info(b.categories);

		var res = null;

		for( var c in b.categories ){
			var sql = "insert into BudgetCategories(budgetId, budgetName, category, catAmount, user) values(?,?,?,?,?);";

			var cat = b.categories[c];
			//console.log("----------",cat.id, cat.amount);
			querySql(sql, [bId, b.name, cat.id, cat.amount, u], function(r){
				logger.info("Add budgetCat response status:%d",r.status);
					if( !r.status ){
						res=r; // if insertion failed
					}
				});
		}

		callback(response, {status:1});

		logger.info("~addBudgetCategories()");
	}

	var getBudgetSpentCosts = function(u, b, response, callback){
		logger.info("getBudgetSpentCosts()");
		//console.log(u,b);

		var sql="select sum(t.cost) spentCosts, \
					(select name from Category where id=t.category) category \
				from Transaction t \
				inner join \
					Budget b \
				on \
					b.id=? and b.user=?\
				where \
					t.category in (select c.id from Category c where c.type=1) and \
					t.t_date between b.start_date and b.end_date \
				group by t.category;";
		executeSql(sql, [b, u], response, callback);

		logger.info("~getBudgetSpentCosts()");
	}

	var budgetExists = function(u, b, response, callback){
		logger.info("budgetExists()");

		var sql = "select count(*) budgets from Budget where name=? and user=?;";

		executeSql(sql, [b, u], response, callback);

		logger.info("~budgetExists()");
	}

	var deleteBudget = function(u, b, response, callback){
		logger.info("deleteBudget()");
		logger.warn("Need to review logic.");

		var deleteBudgetCategoriesSQL = "delete from BudgetCategories where budgetName=? and user=?;";
		var deleteBudgetSQL = "delete from Budget where name=? and user=?;";

		deleteRequest(deleteBudgetCategoriesSQL, [b, u], function(r){
			if( r.status ){
				deleteRequest(deleteBudgetSQL, [b, u], function(r){
					callback(response, r)
				});
			}
			else{
				callback(response, r);
			}
		});

		logger.info("~deleteBudget()");
	}

	// ************** Analitics **************//

	var getExpencesByCategoriesForBudget = function(u, bId, response, callback){

		var sql = " select \
						sum(t.cost) sum, \
						b.name budget, \
						c.name category, \
						c.style catStyle \
					from \
						Transaction t,\
						Budget b,\
						Category c \
					where \
						t.t_date between b.start_date and b.end_date \
						and b.id = ? \
						and t.category = c.id \
						and c.type = 1 \
						and t.user = ? \
						and c.user = t.user \
						and b.user = t.user \
					group by category \
					order by sum desc;";
	}

	// get expences for all the time
	var getExpencesByCategories = function(u, response, callback){

		var sql = " select \
						sum(t.cost) sum, \
						b.name budget, \
						c.name category,\
						c.id id \
						c.style catStyle \
					from \
						Transaction t,\
						Budget b,\
						Category c \
					where \
						t.category = c.id \
						and c.type = 1 \
						and t.user = ?\
						and c.user = t.user\
						and b.user = t.user\
					group by category\
					order by sum desc;";

		executeSql(sql, [u], response, callback);
	}

	var getTotalExpences = function(user, response, callback){
		var sql = " select sum(t.cost) costs \
					from Transaction t, Category c \
					where \
						t.category = c.id \
						and c.type = 1 \
						and t.user = ?;"

		executeSql(sql, [u], response, callback);
	}

	var getTotalIncomes = function(user, response, callback){
		var sql = " select sum(t.cost) costs \
					from Transaction t, Category c \
					where \
						t.category = c.id \
						and c.type = 0 \
						and t.user = ?;"

		executeSql(sql, [u], response, callback);
	}



	// ************* Auth ******************//

	var register = function(name, surname, l, p, email, token, response, callback){
		logger.info("register()");

		// generate registration date
		var d = new Date();
		d = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();

		var sql = "insert into User(name, surname, login, pass, email, reg_date) values(?, ?, ?, ?, ?, ?);";
		executeSql(sql, [name, surname, l, p, email, d], {}, function(res, data){
			logger.info("User added:%s",l);
			if( data.status ) // insertion success
				callback(response, {status:1, data:{}, token:token, msg:"Registration successfull!"});
			else // insertion failed
				callback(response, data);
		});

		logger.info("!register()");
	}

	var authorize = function(u,p, callback){
		logger.info("authorize()");

		var sql = "select name from User where login=? and pass=?;";
		querySql(sql, [u,p], function(r){
			if(r.data.length){
				callback({status:1});
				//callback({status:1, user:r.data[0].name, msg:"Welcome "+r.data[0].name+"!"});
				//logger.info("r.data.userFound:"+r.data[0].user);
			}
			else{
				callback({status:0, msg:"User or pass is wrong"});
			}
		});

		logger.info("~authorize()");
	}

	var userExist = function(login, callback){
		logger.info("userExist()");

		logger.info("login:"+login);

		var sql = "select count(*) userCount from User where login=?;";
		querySql(sql, [login], function(r){
			if( r.data[0].userCount ){
				return callback(true);
			}
			else
				return callback(false);
		});

		logger.info("~userExist()");
	}

	var getUserInfo = function(login, callback){
		var sql = "select name, surname from User where login=?";

		querySql(sql, [login], function(r){
			callback(r.data[0]);
		});
	} 

	exports.loadTransactions = loadTransactions;
	exports.loadTransactionsByCat = loadTransactionsByCat;
	exports.addTransaction = addTransaction;
	exports.updateTransaction = updateTransaction;
	exports.loadCategories = loadCategories;
	exports.addCategory = addCategory;
	exports.loadBudgets = loadBudgets;
	exports.addBudget = addBudget;
	exports.getBudgetSpentCosts = getBudgetSpentCosts;
	exports.loadBudgetCategories = loadBudgetCategories;
	exports.authorize = authorize;
	exports.register = register;
	exports.deleteCategory = deleteCategory;
	exports.deleteBudget = deleteBudget;
	exports.loadBudget = loadBudget;
	exports.deleteTransaction = deleteTransaction;
	exports.budgetExists = budgetExists;
	exports.categoryExists = categoryExists;
	exports.userExist = userExist;
	exports.getUserInfo = getUserInfo;

	exports.getTotalIncomes = getTotalIncomes;
	exports.getTotalExpences = getTotalExpences;
	exports.getExpencesByCategoriesForBudget = getExpencesByCategoriesForBudget;
	exports.getExpencesByCategories = getExpencesByCategories;
})();
