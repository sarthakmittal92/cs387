#!/bin/bash

cd ..
git clone https://git.postgresql.org/git/postgresql.git # takes time
sudo apt install libreadline6-dev zlib1g-dev bison flex
cd postgresql
export POSTGRES_INSTALLDIR=$(pwd)/install
export POSTGRES_SRCDIR=$(pwd)
cd ${POSTGRES_SRCDIR}
sed -i 's/-O2"/-O0"/g' configure
make distclean
./configure --prefix=${POSTGRES_INSTALLDIR} --enable-debug
export enable_debug=yes
make | tee gmake.out # takes time
make install | tee gmake_install.out
export LD_LIBRARY_PATH=${POSTGRES_INSTALLDIR}/lib:${LD_LIBRARY_PATH}
export PATH=${POSTGRES_INSTALLDIR}/bin:${PATH}
export PGDATA=${POSTGRES_INSTALLDIR}/data
${POSTGRES_INSTALLDIR}/bin/initdb -D ${PGDATA}
sed -i 's/#port = 5432/port = 9432/g' ${POSTGRES_INSTALLDIR}/data/postgresql.conf
${POSTGRES_INSTALLDIR}/bin/pg_ctl -D $PGDATA -l logfile start # needed after stop
${POSTGRES_INSTALLDIR}/bin/createdb -p 9432 test
${POSTGRES_INSTALLDIR}/bin/psql -p 9432 test # \q to quit
${POSTGRES_INSTALLDIR}/bin/pg_ctl stop
postgres --single -D ${PGDATA} test # Ctrl-D to quit
cd ../scripts
