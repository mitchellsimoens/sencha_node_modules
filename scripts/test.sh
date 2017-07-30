#!/bin/bash

PACKAGE="*"

help_menu() {
  echo "Usage:

  ${0##*/} [-h][-c][-b]

Options:

  -h, --help
    display this help and exit

  -c, --coverage
    run tests using istanbul

  -b, --break
    enable debug by breaking
  "
}

parse_options() {
  case $opt in
    h|help)
      help_menu
      exit
      ;;
    c|coverage)
      COVERAGE=true
      ;;
    b|break)
      BREAK=true
      ;;
    sencha-*)
      PACKAGE=$opt
      ;;
    *)
      echo "Unknown option: ${opt}"
      echo "Run ${0##*/} -h for help.">&2
      echo
      exit 1
  esac
}
options=$@

until [ "$options" = "" ]; do
  if [[ $options =~ (^ *(--([a-zA-Z0-9-]+)|-([a-zA-Z0-9-]+))(( |=)(([\_\.\?\/\\a-zA-Z0-9]?[ -]?[\_\.\?a-zA-Z0-9]+)+))?(.*)|(.+)) ]]; then
    if [[ ${BASH_REMATCH[3]} ]]; then # for --option[=][attribute] or --option[=][attribute]
      opt=${BASH_REMATCH[3]}
      attr=${BASH_REMATCH[7]}
      options=${BASH_REMATCH[9]}
    elif [[ ${BASH_REMATCH[4]} ]]; then # for block options -qwert[=][attribute] or single short option -a[=][attribute]
      pile=${BASH_REMATCH[4]}
      while (( ${#pile} > 1 )); do
        opt=${pile:0:1}
        attr=""
        pile=${pile/${pile:0:1}/}
        parse_options
      done
      opt=$pile
      attr=${BASH_REMATCH[7]}
      options=${BASH_REMATCH[9]}
    else # leftovers that don't match
      opt=${BASH_REMATCH[10]}
      options=""
    fi
    parse_options
  fi
done

if [ $COVERAGE ]; then
    if [ $BREAK ]; then
      nyc mocha --debug-brk --inspect "test/**/*.helper.js" "packages/${PACKAGE}/test/**/*.helper.js" "packages/${PACKAGE}/test/**/*.spec.js"
    else
      nyc mocha "test/**/*.helper.js" "packages/${PACKAGE}/test/**/*.helper.js" "packages/${PACKAGE}/test/**/*.spec.js"
    fi
else
    if [ $BREAK ]; then
      mocha --debug-brk --inspect "test/**/*.helper.js" "packages/${PACKAGE}/test/**/*.helper.js" "packages/${PACKAGE}/test/**/*.spec.js"
    else
      mocha "test/**/*.helper.js" "packages/${PACKAGE}/test/**/*.helper.js" "packages/${PACKAGE}/test/**/*.spec.js"
    fi
fi
