(function(){

"use strict";

var LoggerFactory = require("./public/js/modules/logger.js").LoggerFactory;
var logger = LoggerFactory.getLogger({label:"Database"});

logger.info("Module database.js loaded.");

var mysql = require("mysql");

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
			database : process.env.OPENSHIFT_APP_NAME
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
			callback({status:1, msg:"Delete successfull"});
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
			logger.info("Query result:", rows[0]);
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
	logger.info("sql:%s", sql);

	var conn = connection();
	logger.info(params);

	conn.query(sql, params, function(err, rows, fields){
		if(!err){
			conn.commit();
			// send response
			callback(response,{data:rows, status:1});
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
			return "Can not perform deletion. This item is referenced to another one. Please, delete parent and try to delete again"
		default:
			return "Ooops:( Give the number to your admin:"+errno;
	}
}

var loadTransactions = function(u, b, response, callback){
	logger.info("loadTransactions()");

	// Query data from dataabase
	var sql = 
		"select \
			t.id id, \
			t.name name, \
			DATE_FORMAT(t.t_date, '%Y-%m-%d %H:%i') date, \
			t.comment, \
			t.cost, \
			t.category, \
			c.name catName, \
			c.style catStyle\
		from Transaction t, Category c, Budget b \
		where \
			t.user=? and \
			b.name=? and \
			t.category=c.id and \
			(t.t_date between b.start_date and b.end_date) \
		order by t_date desc;";

	//logger.info(u,b);
	//logger.info("database::loadTransactions::sql "+sql);
	executeSql(sql, [u,b], response, callback);

	logger.info("~loadTransactions()");
}

var addTransaction = function(u, t, response, callback){
	logger.info("addTransaction()");
	logger.info("transaction:",t);

	var sql = "insert into Transaction (name, t_date, comment, cost, style, user, category) values(?,?,?,?,?,?,?);";
	executeSql(sql, [t.name, t.date, t.comment, t.cost, t.category.style, u, t.category.id],response, callback);

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

var loadTransactionsByCat = function(c, b, u, response, callback){
	logger.info("loadTransactionsByCat()");

	logger.info(u, b, c);

	var sql = 
	"select \
		t.id id, \
		t.name name, \
		DATE_FORMAT(t.t_date, '%Y-%m-%d %H:%i') date, \
		t.comment, \
		t.cost, \
		t.category, \
		c.style catStyle\
	from Transaction t, Category c, Budget b \
	where \
		t.user=? and \
		b.user=? and \
		c.user=? and \
		t.category=? and\
		b.name=? and \
		c.name=? and \
		(t.t_date between b.start_date and b.end_date) \
	order by t_date desc;";

	executeSql(sql, [u, u, u, c, b, c], response, callback);

	logger.info("~loadTransactionsByCat()");
}


//////////////////////// Categories //////////////////////////////

var loadCategories = function(u, response, callback){
	logger.info("loadCategories()");

	var sql = "select id,name,style,type from Category where user=?;";
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

	var sql = "delete from Category where name=? and user=?;";
	deleteRequest(sql, [c,u], function(r){
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
		b.name name,\
		DATE_FORMAT(b.start_date, '%Y-%m-%d') startDate, \
		DATE_FORMAT(b.end_date, '%Y-%m-%d') endDate, \
		total_costs totalCosts,\
		(select sum(t.cost) from Transaction t where (t.t_date between b.start_date and b.end_date) and t.category in (select c.name from Category c where c.type=0) ) incomeCosts,\
		(select sum(t.cost) from Transaction t where (t.t_date between b.start_date and b.end_date) and t.category in (select c.name from Category c where c.type=1) ) spentCosts, \
		( floor( (select spentCosts)/(select totalCosts) * 100 ) ) spentPerc\
	from \
		Budget b\
		where user=?;";

	executeSql(sql, [u], response, callback);

	logger.info("~loadBudgets()");
}

var loadBudget = function(u, n, response, callback){
	// load budget by user and budget name

	logger.info("loadBudgets()");

	var sql = 
	"select \
		b.name name,\
		DATE_FORMAT(b.start_date, '%Y-%m-%d') startDate, \
		DATE_FORMAT(b.end_date, '%Y-%m-%d') endDate, \
		total_costs totalCosts,\
		(select sum(t.cost) from Transaction t where (t.t_date between b.start_date and b.end_date) and t.category in (select c.name from Category c where c.type=0) ) incomeCosts,\
		(select sum(t.cost) from Transaction t where (t.t_date between b.start_date and b.end_date) and t.category in (select c.name from Category c where c.type=1) ) spentCosts \
	from \
		Budget b\
		where user=? and b.name = ?;";

	executeSql(sql, [u, n], response, callback);

	logger.info("~loadBudgets()");
}

var loadBudgetCategories = function(u, b, response, callback){
	/*
		Load all budget categories by budget name.
	*/
	logger.info("loadBudgetCategories()");

	var sql = 
		"select \
			bc.budgetName, \
			c.name, \
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
			bc.budgetName=? and \
			bc.user=? and\
			c.id = bc.category;";

	executeSql(sql, [b.startDate, b.endDate, b.name, u], response, callback);

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
		if( !r.status )	callback(response, r);
		// if budget insertion was successfull
		else addBudgetCategories(u, b, response, callback);
	});

	logger.info("~addBudget()")
}

var addBudgetCategories = function(u, b, response, callback){
	logger.info("addBudgetCategories()");

	var res = null;

	for( var c in b.categories ){
		var sql = "insert into BudgetCategories( budgetName, category, catAmount, user ) values(?,?,?,?);";

		var cat = b.categories[c];
		console.log("----------",cat.id, cat.amount);
		querySql(sql, [b.name, cat.id, cat.amount, u], function(r){
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

	var sql="select sum(t.cost) spentCosts, \
				t.category \
			from Transaction t \
			inner join \
				Budget b \
			on \
				b.name=? and b.user=?\
			where \
				t.category in (select c.name from Category c where c.type=1) and \
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

var register = function(n, l , p , response, callback){
	var d = new Date();
	d = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();

	logger.info("toIso:"+d);
	logger.info("User does not exist...")

	var sql = "insert into User(name, login, pass, reg_date) values(?,?,?,?);";
	executeSql(sql, [n,l,p,d],response, callback);
}

var authorize = function(u,p, response, callback){
	logger.info("authorize()");

	//var sql = "select name from User where login='"+u+"' and pass='"+p+"';";
	var sql = "select name from User where login=? and pass=?;";
	querySql(sql, [u,p], function(r){
		if(r.data.length){
			callback({status:1, user:r.data[0].name, msg:"Welcome "+r.data[0].name+"!"});
			//logger.info("r.data.userFound:"+r.data[0].user);
		}
		else{
			callback({status:0, msg:"User or pass is wrong"});
		}
	});

	logger.info("~authorize()");
}

var userExist = function(login){
	logger.info("userExist()");

	var sql = "select count(*) userCount from User where login=?;";
	querySql(sql, [login], function(r){
		if( r.data[0].userCount ){
			return true;
		}
		else
			return false;
	});

	logger.info("~userExist()");

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

})();
