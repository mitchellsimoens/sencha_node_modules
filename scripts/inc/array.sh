#!/bin/bash

function in_array {
    # odd syntax here for passing array parameters: http://stackoverflow.com/questions/8082947/how-to-pass-an-array-to-a-bash-function
    local list=$1[@]
    local elem=$2

    # echo "list" ${!list}
    # echo "elem" $elem

    for i in "${!list}"
    do
        # echo "Checking to see if" "$i" "is the same as" "${elem}"
        if [ "$i" == "${elem}" ] ; then
            # echo "$i" "was the same as" "${elem}"
            return 0
        fi
    done

    # echo "Could not find element"
    return 1
}
