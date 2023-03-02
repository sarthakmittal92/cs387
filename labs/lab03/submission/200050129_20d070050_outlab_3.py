import argparse
import psycopg2
import sys
import csv

def table_schema(cursor,table):
    cursor.execute(f'''
                    select column_name, data_type, character_maximum_length
                    from information_schema.columns
                    where table_name = '{table}'
                    order by ordinal_position;
    ''')
    cols = ',\n'.join(map(lambda x: x[0] + ' ' + x[1] + f' ({x[2]})' if x[2] is not None else x[0] + ' ' + x[1],cursor.fetchall()))
    cursor.execute(f'''
                    select c.column_name, c.data_type
                    from information_schema.table_constraints tc
                    join information_schema.constraint_column_usage as ccu
                    using (constraint_schema, constraint_name)
                    join information_schema.columns as c
                    on c.table_schema = tc.constraint_schema and tc.table_name = c.table_name and ccu.column_name = c.column_name
                    where constraint_type = 'PRIMARY KEY' and tc.table_name = '{table}';
    ''')
    pk = 'PRIMARY KEY (' + ','.join(map(lambda x: x[0],cursor.fetchall())) + ')'
    cursor.execute(f'''
                    select pg_get_constraintdef(pgc.oid)
                    from pg_constraint pgc
                    join pg_namespace nsp
                    on nsp.oid = pgc.connamespace
                    join pg_class cls
                    on pgc.conrelid = cls.oid
                    left join information_schema.constraint_column_usage ccu
                    on pgc.conname = ccu.constraint_name and nsp.nspname = ccu.constraint_schema
                    where contype = 'f' and relname = '{table}'; 
    ''')
    fk = ',\n'.join(map(lambda x: x[0],cursor.fetchall()))
    if fk != '':
        pk += ',\n'
    cursor.execute(f'''
                    select distinct pg_get_constraintdef(pgc.oid)
                    from pg_constraint pgc
                    join pg_namespace nsp
                    on nsp.oid = pgc.connamespace
                    join pg_class cls
                    on pgc.conrelid = cls.oid
                    left join information_schema.constraint_column_usage ccu
                    on pgc.conname = ccu.constraint_name and nsp.nspname = ccu.constraint_schema
                    where contype = 'u' and relname = '{table}';
    ''')
    unique = ',\n'.join(map(lambda x: x[0],cursor.fetchall()))
    if unique != '':
        fk += ',\n'
    out = f'''CREATE TABLE {table} (\n{cols},\n{pk}{fk}{unique});\n'''
    print(out)

def fk_pk_pairs(cursor):
    cursor.execute(f'''
                   select kcu.table_name as foreign_table, rel_tco.table_name as primary_table
                   from information_schema.table_constraints tco
                   join information_schema.key_column_usage kcu
                   on tco.constraint_schema = kcu.constraint_schema and tco.constraint_name = kcu.constraint_name
                   join information_schema.referential_constraints rco
                   on tco.constraint_schema = rco.constraint_schema and tco.constraint_name = rco.constraint_name
                   join information_schema.table_constraints rel_tco
                   on rco.unique_constraint_schema = rel_tco.constraint_schema and rco.unique_constraint_name = rel_tco.constraint_name
                   where tco.constraint_type = 'FOREIGN KEY'
                   group by kcu.table_schema, kcu.table_name, rel_tco.table_name, rel_tco.table_schema, kcu.constraint_name
                   order by kcu.table_schema, kcu.table_name; 
    ''')
    fk_to_pk = {}
    for fk, pk in cursor.fetchall():
        fk_to_pk.setdefault(fk,set())
        fk_to_pk[fk].add(pk)
    return fk_to_pk

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
        cursor.execute("select table_name from information_schema.tables where table_schema = 'public' order by table_name;")
        print('\n'.join(map(lambda x: x[0],cursor.fetchall())))

    if(args.show_table_schema):
        table_schema(cursor,args.table)

    if(args.import_sql):
        file = open(args.path,'r')
        cursor.execute(file.read())
        connection.commit()

    if(args.export_database_schema):
        cursor.execute("select table_name from information_schema.tables where table_schema = 'public' order by table_name;")
        tables = map(lambda x: x[0], cursor.fetchall())
        printed = set()
        not_printed = set(tables)
        my_pairs = fk_pk_pairs(cursor)
        while(len(not_printed)!=0):
            for i in not_printed:
                if i not in my_pairs or len(my_pairs[i].difference(printed))==0:
                    printed.add(i)
                    table_schema(cursor,i)
            not_printed = not_printed.difference(printed)
    
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