#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int
main ()
{
    const char *query_string = "insert into r values ('1','1') ;\n";

    /* CS 387 begin */

    /* Assumptions:
        1. anything between value braces is a valid pair of a and b data
    */
    
    const char* c = "insert into r values";
    int d = strncmp(query_string,c,strlen(c));
    if (d == 0)
    {
        char t1[100], t2[100], new_query[300];
        sscanf(query_string,"%[^(](%[^)]", t1, t2);
        sprintf(new_query, "insert into r values (%s); insert into delta_r values ('I',%s)", t2, t2);
        query_string = new_query;
    }

    /* CS 387 end */

}