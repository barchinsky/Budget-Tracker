/*
* http://dev.mysql.com/doc/refman/5.7/en/charset-mysql.html
*/

create table User(
	name char(25) not null,
	login char (100) not null,
	pass char(20) not null,
	reg_date DATE, 
	PRIMARY KEY(login)
);

CREATE TABLE Category(
	id int NOT NULL AUTO_INCREMENT,
	name char(30) NOT NULL,
	style char(200),
	type int, /* 1 - expense, 0 - income*/
	user char(100) NOT NULL,
	CONSTRAINT FK_CATEGORY_USER FOREIGN KEY (user) REFERENCES User (login),
	PRIMARY KEY (id)
);

create table Transaction(
	id int AUTO_INCREMENT,
	name char(30),
	t_date DATETIME,
	comment char(100),
	cost int,
	category int,
	style char(200),
	user char(100) not null,
	CONSTRAINT FK_TRANSACTION_CATEGORY FOREIGN KEY (category) REFERENCES Category (id),
	CONSTRAINT FK_TRANSACTION_USER FOREIGN KEY (user) REFERENCES User (login),
	PRIMARY KEY (id)
);

create table Budget(
	name char(100) not null,
	start_date datetime,
	end_date datetime,
	total_costs decimal(7,2),
	user char(100) not null,
	CONSTRAINT FK_BUDGET_USER FOREIGN KEY (user) REFERENCES User (login),
	PRIMARY KEY (name)
);

create table BudgetCategories(
	budgetName char(100),
	category int,
	catAmount int,
	user char(100),
	CONSTRAINT FK_BCAT_CAT_NAME FOREIGN KEY (category) REFERENCES Category (id),
	CONSTRAINT FK_BCAT_BUD_NAME FOREIGN KEY (budgetName) REFERENCES Budget (name),
	CONSTRAINT FK_BK_USER FOREIGN KEY (user) REFERENCES User (login)
);
