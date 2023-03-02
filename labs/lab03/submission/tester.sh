# Outlab 3 Q1
python3 200050129_20d070050_outlab_3.py --name lab3db --user postgres --pswd mjw2708 --host 127.0.0.1 --port 5432 --import-sql --path ./lab3_resources/command.txt

# Outlab 3 Q2
python3 200050129_20d070050_outlab_3.py --name lab3db --user postgres --pswd mjw2708 --host 127.0.0.1 --port 5432 --show-tables > iamout2.txt

# Outlab 3 Q3
rm iamout3.txt
for file in ./lab3_resources/csvs/*
do
    table=$(basename -- ${file%.*})
    python3 200050129_20d070050_outlab_3.py --name lab3db --user postgres --pswd mjw2708 --host 127.0.0.1 --port 5432 --show-table-schema --table $table >> iamout3.txt
done

# Outlab 3 Q4
python3 200050129_20d070050_outlab_3.py --name lab3db --user postgres --pswd mjw2708 --host 127.0.0.1 --port 5432 --export-database-schema > iamout4.txt