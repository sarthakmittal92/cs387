for file in ./lab3_resources/csvs/*
do
    table=$(basename -- ${file%.*})
    # python3 200050129_20d070050_inlab_3.py --name lab3db --user postgres --pswd 1234 --host 127.0.0.1 --port 5432 --import-table-data --table $table --path /home/sarthak/IITB/GitHub/courses/cs387/labs/lab03/lab3_resources/csvs/$table.csv
    # python3 200050129_20d070050_inlab_3.py --name lab3db --user postgres --pswd 1234 --host 127.0.0.1 --port 5432 --export-table-data --table $table --format sql
    # python3 200050129_20d070050_inlab_3.py --name lab3db --user postgres --pswd 1234 --host 127.0.0.1 --port 5432 --export-table-data --table $table --format csv
done