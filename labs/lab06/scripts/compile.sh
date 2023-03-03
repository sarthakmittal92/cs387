#!/bin/bash

cd ..
cd postgresql
rm -rf $(pwd)/install/data
export POSTGRES_INSTALLDIR=$(pwd)/install
export POSTGRES_SRCDIR=$(pwd)
cd ${POSTGRES_SRCDIR}
export enable_debug=yes
make | tee gmake.out # takes time
make install | tee gmake_install.out
export LD_LIBRARY_PATH=${POSTGRES_INSTALLDIR}/lib:${LD_LIBRARY_PATH}
export PATH=${POSTGRES_INSTALLDIR}/bin:${PATH}
export PGDATA=${POSTGRES_INSTALLDIR}/data
${POSTGRES_INSTALLDIR}/bin/initdb -D ${PGDATA}
sed -i 's/#port = 5432/port = 9432/g' ${POSTGRES_INSTALLDIR}/data/postgresql.conf
cd ../scripts
