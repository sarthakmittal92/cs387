import argparse, psycopg2, csv
from psycopg2.extras import execute_values
from psycopg2 import Error
import sys

edges = None
toposort = None
visited = None

def dfs(u):
    visited[u] = True
    for v in edges[u]:
        if not visited[v]:
            dfs(v)
    toposort.append(u)

def dag(V, E):
    global edges
    global toposort
    global visited
    V.sort()
    E.sort()
    mapping = {V[i]:i for i in range(len(V))}
    visited = [False for i in range(len(V))]
    edges = [[] for _ in range(len(V))]
    for e in E:
        edges[mapping[e[0]]].append(mapping[e[1]])
    toposort = []
    for i in range(len(V)):
        if not visited[i]:
            dfs(i)
    
    toposort = [V[x] for x in toposort]
    return

def get_table_schema(table_name, cursor):
    query = f'''SELECT
    pg_attribute.attname AS column_name,
    pg_catalog.format_type(pg_attribute.atttypid, pg_attribute.atttypmod) AS data_type
FROM
    pg_catalog.pg_attribute
INNER JOIN
    pg_catalog.pg_class ON pg_class.oid = pg_attribute.attrelid
INNER JOIN
    pg_catalog.pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE
    pg_attribute.attnum > 0
    AND NOT pg_attribute.attisdropped
    AND pg_namespace.nspname = 'public'
    AND pg_class.relname = '{table_name}'
ORDER BY
    attnum ASC;'''
    cursor.execute(query)
    columns_dataypes = [x[0] + " " + x[1] for x in cursor.fetchall()]

    oids = f"select pg_constraint.oid from pg_constraint, pg_class as t1 where conrelid = t1.oid and relname = '{table_name}' and contype = 'p';"
    cursor.execute(oids)
    oids = [x[0] for x in cursor.fetchall()]
    primary_key = []
    for oid in oids:
        query = f"select * from pg_catalog.pg_get_constraintdef({oid}, true);"
        cursor.execute(query)
        primary_key = cursor.fetchone()[0]
        a = primary_key.split("(")[1].split(")")[0].split(",")
        for i in range(len(a)):
            a[i] = a[i].strip(" ")
        a.sort()
        primary_key = "PRIMARY KEY (" + ", ".join([x for x in a]) + ")"

    if len(primary_key) > 0:
        primary_key = ",\n" + primary_key
    else:
        primary_key = ""
    
    oids = f"select pg_constraint.oid from pg_constraint, pg_class as t1 where conrelid = t1.oid and relname = '{table_name}' and contype = 'f';"
    cursor.execute(oids)
    oids = [x[0] for x in cursor.fetchall()]
    foreign_keys = []
    for oid in oids:
        query = f"select * from pg_catalog.pg_get_constraintdef({oid}, true);"
        cursor.execute(query)
        foreign_key = cursor.fetchone()[0]
        a = foreign_key.split(") REFERENCES")[0].split("FOREIGN KEY (")[1].split(",")
        b = foreign_key.split(")")[1].split("(")[1].split(",")
        table_name_temp = foreign_key.split("REFERENCES ")[1].split("(")[0]
        other = foreign_key.split(")")[2]
        for i in range(len(a)):
            a[i] = a[i].strip(" ")
        for i in range(len(b)):
            b[i] = b[i].strip(" ")
        t = []
        for i in range(len(a)):
            t.append((a[i], b[i]))
        t.sort()
        foreign_key = "FOREIGN KEY (" + ", ".join([x[0] for x in t]) + ") REFERENCES " + table_name_temp + "(" + ", ".join([x[1] for x in t]) + ")" + other
        foreign_keys.append(foreign_key)
    foreign_keys.sort()
    if len(foreign_keys) > 0:
        foreign_keys[0] = ",\n" + foreign_keys[0]
    else:
        foreign_keys = []

    oids = f"select pg_constraint.oid from pg_constraint, pg_class as t1 where conrelid = t1.oid and relname = '{table_name}' and contype = 'u';"
    cursor.execute(oids)
    oids = [x[0] for x in cursor.fetchall()]
    unique_constraints = []
    for oid in oids:
        query = f"select * from pg_catalog.pg_get_constraintdef({oid}, true);"
        cursor.execute(query)
        unique_constraint = cursor.fetchone()[0]
        a = unique_constraint.split("(")[1].split(")")[0].split(",")
        for i in range(len(a)):
            a[i] = a[i].strip(" ")
        a.sort()
        unique_constraint = "UNIQUE (" + ", ".join([x for x in a]) + ")"
        unique_constraints.append(unique_constraint)
    unique_constraints.sort()
    if len(unique_constraints) > 0:
        unique_constraints[0] = ",\n" + unique_constraints[0]
    else:
        unique_constraints = []
    create_table = f"CREATE TABLE {table_name} (\n" +  ",\n".join(columns_dataypes) + primary_key + ",\n".join(foreign_keys) + ",\n".join(unique_constraints) + "\n);"
    return create_table

def main(args):
    connection = psycopg2.connect(host = args.host, port = args.port, database = args.name, user = args.user, password = args.pswd)
    cursor = connection.cursor()
    if(args.import_table_data):
        with open(args.path, "r") as csvfile:
            reader = csv.reader(csvfile)
            header = next(reader)
            values_list = []
            num_rows = 0
            for row in reader:
                if(num_rows % 10000 == 0):
                    query = 'INSERT INTO ' + args.table + ' (' + ', '.join(str(x) for x in header) + ') values %s' 
                    execute_values(cursor, query, values_list)
                    connection.commit()
                    values_list = []
                    num_rows = 0
                values_list.append(tuple(row))
                num_rows+=1
            if(num_rows != 0):
                query = 'INSERT INTO ' + args.table + ' (' + ', '.join(str(x) for x in header) + ') values %s' 
                execute_values(cursor, query, values_list)
                connection.commit()
    if(args.export_table_data):
        if(args.format == "csv"):
            cursor.execute(f"select * from {args.table};")
            rows = [x for x in cursor.fetchall()]
            colnames = [desc[0] for desc in cursor.description]
            if(args.path):
                with open(args.path, 'w') as f:
                    writer = csv.writer(f, delimiter=',')
                    writer.writerow(colnames)
                    for row in rows:
                        writer.writerow(row)
            else:
                writer = csv.writer(sys.stdout, delimiter=',')
                writer.writerow(colnames)
                for row in rows:
                    writer.writerow(row)

        if(args.format == "sql"):
            cursor.execute(f"select * from {args.table}");
            colnames = [desc[0] for desc in cursor.description]
            rows = [x for x in cursor.fetchall()]
            if(args.path):
                with open(args.path, 'w') as f:
                    for row in rows:
                        f.write('INSERT INTO ' + args.table + ' (' + ', '.join(str(x) for x in colnames) + ') values (' + ', '.join("'" + str(x) +"'" for x in row) +');\n')

            else:
                for row in rows:
                    print('INSERT INTO ' + args.table + ' (' + ', '.join(str(x) for x in colnames) + ') values (' + ', '.join("'" + str(x) +"'" for x in row) +');')
            

    if(args.import_sql):
        with open(args.path, "r") as f:
            cursor.execute(f.read())
            connection.commit()

    if(args.show_tables):
        cursor.execute("select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE';")
        tables = [x[0] for x in cursor.fetchall()]
        tables.sort()
        for item in tables:
            print(item)

    if(args.show_table_schema):
        create_table = get_table_schema(args.table, cursor)
        print(create_table)
    if(args.export_database_schema):
        cursor.execute("select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE';")
        tables = [x[0] for x in cursor.fetchall()]
        edges = []

        cursor.execute("select t1.relname as ref_table, t2.attname as ref_column, t3.relname as referred_table, t4.attname as referred_column from pg_constraint, pg_class as t1, pg_attribute as t2, pg_class as t3, pg_attribute as t4 where conrelid = t1.oid and conrelid = t2.attrelid and t2.attnum = any(conkey) and confrelid = t3.oid and confrelid = t4.attrelid and t4.attnum = any(confkey) and contype = 'f' and t1.relname in (select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE');")
        foreign_keys = cursor.fetchall()
        edges = [(x[0], x[2]) for x in foreign_keys]
        dag(tables, edges)

        schema = ""
        for table in toposort:
            create_table = get_table_schema(table, cursor)
            schema += create_table + "\n"
        schema = schema.strip()
        print(schema)
    if (connection):
        cursor.close()
        connection.close()

        

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--name")
    parser.add_argument("--user")
    parser.add_argument("--pswd")
    parser.add_argument("--host")
    parser.add_argument("--port")
    parser.add_argument("--show-tables", action='store_true')
    parser.add_argument("--show-table-schema", action='store_true')
    parser.add_argument("--table")
    parser.add_argument("--export-table-data", action='store_true')
    parser.add_argument("--format")
    parser.add_argument("--import-table-data", action='store_true')
    parser.add_argument("--import-sql", action='store_true')
    parser.add_argument("--path")
    parser.add_argument("--export-database-schema", action='store_true')

    args = parser.parse_args()
    main(args)