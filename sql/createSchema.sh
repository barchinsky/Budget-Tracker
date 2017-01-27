#!/bin/bash

echo "Dropping tables..."
./db.sh < "dropTables.sql"

echo "Creating schema..."

#echo "Creating User..."
./db.sh < "Schema.sql"

#echo "Creating Category..."
#./db.sh < "Category.sql"

#echo "Creating Transaction..."
#./db.sh < "Transaction.sql"

#echo "Creating Budget..."
#./db.sh < "Budget.sql"

#echo "Creating BudgetCategories..."
#./db.sh < "BudgetCategories.sql"


echo "Done."
