#!/bin/bash

IGNORE_PKGS=("sencha-license" "sencha-license-mysql"
"sencha-portal" "sencha-portal-mysql"
"sencha-vbulletin")

CURR_DIR=${PWD##*/}

if [ "$CURR_DIR" == "scripts" ]; then
    source ./inc/array.sh
    source ./inc/trycatch.sh
else
    source ./scripts/inc/array.sh
    source ./scripts/inc/trycatch.sh
fi

BRANCH=$1
PROD_URL="https://npm.sencha.com/"
TEST_URL="https://test.npm.sencha.com/"
URL=$TEST_URL

if [ -z "${BRANCH}" -a "${BRANCH}" != " " ]; then
    BRANCH=test
fi

if [ $BRANCH != "test" ]; then
    URL=$PROD_URL
fi

function publish {
    if [ "$CURR_DIR" == "scripts" ]; then
        cd ../packages
    else
        cd packages
    fi

    for file in *; do
    if [[ -d "$file" && ! -L "$file" ]]; then
        if !(in_array IGNORE_PKGS $file); then
            cd $file

            echo "Publishing $file"
            echo

            try
            (
                ignoreErrors

                npm publish
            )
            catch || {
                echo
                echo "Unable to publish $file"
            }

            echo

            cd ..
        fi
    fi;
    done

    echo
}

echo "Attempting to logout of Sencha's NPM server."

npm logout --scope=@extjs --silent

echo
echo "Log into Sencha's NPM server (${URL}):"
echo

try
(
    throwErrors

    npm login --registry="${URL}" --scope=@extjs

    echo

    publish
)
catch || {
    throw $ex_code
}

echo "All done!"
echo
