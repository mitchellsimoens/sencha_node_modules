# `sencha-expressjs` Examples

## Installation

You must have lerna bootstrapped.

You need to create `node_modules` with two symlinks. Here are some
verbose steps:

    cd packages/sencha-expressjs/example
    mkdir node_modules
    cd node_modules
    mkdir @extjs
    cd @extjs
    ln -s ../../../../sencha-application sencha-application
    ln -s ../../../../sencha-expressjs sencha-expressjs

You can then run the script for the example you want as defined in
the `package.json`. Example `npm run cors`.
