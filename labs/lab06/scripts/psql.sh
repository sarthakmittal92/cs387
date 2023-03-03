#!/bin/bash

cd ../postgresql
export POSTGRES_INSTALLDIR=$(pwd)/install
export POSTGRES_SRCDIR=$(pwd)
export enable_debug=yes
export LD_LIBRARY_PATH=${POSTGRES_INSTALLDIR}/lib:${LD_LIBRARY_PATH}
export PATH=${POSTGRES_INSTALLDIR}/bin:${PATH}
export PGDATA=${POSTGRES_INSTALLDIR}/data
${POSTGRES_INSTALLDIR}/bin/pg_ctl -D $PGDATA -l logfile start # needed after stop
${POSTGRES_INSTALLDIR}/bin/createdb -p 9432 $1
${POSTGRES_INSTALLDIR}/bin/psql -p 9432 $1 # \q to quit
${POSTGRES_INSTALLDIR}/bin/pg_ctl stop
cd ../scripts
