#!/bin/sh

echo "@mi: Running prepare.sh script"

if [ -d './node_modules/husky' ]; then
    echo "@mi: running npx husky install"
    npx husky install
else
    echo "@mi: skip husky install"
fi
