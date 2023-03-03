#!/bin/bash

cd ../postgresql
export POSTGRES_INSTALLDIR=$(pwd)/install
export POSTGRES_SRCDIR=$(pwd)
export enable_debug=yes
export LD_LIBRARY_PATH=${POSTGRES_INSTALLDIR}/lib:${LD_LIBRARY_PATH}
export PATH=${POSTGRES_INSTALLDIR}/bin:${PATH}
export PGDATA=${POSTGRES_INSTALLDIR}/data
postgres --single -D ${PGDATA} $1 # Ctrl-D to quit
cd ../scripts
