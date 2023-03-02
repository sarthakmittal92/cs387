import argparse
import psycopg2
import sys
import csv
from psycopg2.extras import execute_values

edges = None
toposort = None
visited = None

def main(args):
    connection = psycopg2.connect(host = args.host, port = args.port, database = args.name,
                                  user = args.user, password = args.pswd)
    cursor = connection.cursor()
    
    if(args.import_table_data):
        file = csv.reader(open(args.path,'r'))
        for i, line in enumerate(file):
            if i == 0:
                attr = ','.join(line)
            else:
                sql = f'''
                    insert into {args.table} 
                    ({attr}) values 
                    ({",".join([x if type(x) != str else f"'{x}'" for x in line])});
                '''
                cursor.execute(sql)
        connection.commit()
    
    if(args.export_table_data):
        if (args.path):
            ofile = open(args.path)
        else:
            ofile = sys.stdout
        fmt = args.format
        cursor.execute("SELECT * FROM " + args.table + " LIMIT 0;")
        column_names = [desc[0] for desc in cursor.description]
        if (fmt=="csv"):
            ofile.write(",".join(column_names)+"\n")
            cursor.execute("SELECT * FROM " + args.table + ";")
            records = cursor.fetchall()
            for entries in records:
                entries = list(map(str,entries))
                ofile.write(",".join(entries)+"\n")
        elif (fmt=="sql"):
            cursor.execute("SELECT * FROM " + args.table + ";")
            cursor.execute("SELECT * FROM " + args.table + ";")
            records = cursor.fetchall()
            for entries in records:
                swag_lst = []
                for e in entries:
                    if type(e)==str:
                        swag_lst.append(f"\'{e}\'")
                    else:
                        swag_lst.append(f"{e}")
                sql = "INSERT INTO " + args.table + "(" + ",".join(column_names) + ") VALUES(" + ",".join(swag_lst) + ");\n"
                ofile.write(sql)

    if(args.show_tables):
        pass

    if(args.show_table_schema):
        pass

    if(args.import_sql):
        pass

    if(args.export_database_schema):
        pass
    
    if(args.testing):
        cursor.execute("DROP TABLE IF EXISTS test;")
        cursor.execute("CREATE TABLE test (id serial PRIMARY KEY, num integer, data varchar);")
        cursor.execute("INSERT INTO test (num, data) VALUES (%s, %s)", (100, "abc'def"))
        cursor.execute("INSERT INTO test (num, data) VALUES (%s, %s)", (200, "abc'def"))
        cursor.execute("INSERT INTO test (num, data) VALUES (%s, %s)", (100, "abc'def"))
        
        cursor.execute("SELECT * FROM test;")
        row = cursor.fetchone()
        while row != None:
            print(row)
            row = cursor.fetchone()
        
        cursor.execute("SELECT * FROM test where num = 100;")
        print(cursor.fetchall())

        cursor.execute("SELECT * FROM test;")
        print(cursor.fetchmany(3))

    if connection:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--name")
    parser.add_argument("--user")
    parser.add_argument("--pswd")
    parser.add_argument("--host")
    parser.add_argument("--port")
    parser.add_argument("--import-table-data", action='store_true')
    parser.add_argument("--export-table-data", action='store_true')
    parser.add_argument("--show-tables", action='store_true')
    parser.add_argument("--show-table-schema", action='store_true')
    parser.add_argument("--table")
    parser.add_argument("--format")
    parser.add_argument("--import-sql", action='store_true')
    parser.add_argument("--path")
    parser.add_argument("--export-database-schema", action='store_true')
    parser.add_argument("--testing", action = 'store_true')

    args = parser.parse_args()
    main(args)