const { Config }                      = require('@extjs/sencha-core');
const { Response, route : { Route } } = require('@extjs/sencha-expressjs');

const fs      = require('fs');
const path    = require('path');
const webpack = require('webpack');
const StringReplacePlugin = require('string-replace-webpack-plugin');

const reactorDist = path.join(__dirname, 'webpack/reactor-dist.js');

class ExampleRoute extends Route {
    handle () {
        return this
            .runWebpack()
            .then(this.loadFile.bind(this))
            .then(this.output.bind(this));
    }

    output (data) {
        return new Response({
            data,
            extra : {
                headers : {
                    ContentType : 'application/javascript'
                },
                isView : false
            }
        });
    }

    loadFile () {
        return new Promise((resolve, reject) => {
            fs.readFile(reactorDist, 'utf8', (error, source) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(source);
                }
            });
        });
    }

    runWebpack () {
        return new Promise((resolve, reject) => {
            const entry  = path.join(__dirname, 'webpack/reactor.js');
            const output = path.relative(__dirname, reactorDist);

            webpack({
                entry,
                module : {
                    rules : [
                        {
                            enforce : 'pre',
                            exclude : /node_modules/,
                            test    : /\.js$/,
                            use     : [
                                {
                                    loader : StringReplacePlugin.replace({
                                        replacements : [
                                            {
                                                pattern     : /\{(SDK|REACTOR)\}/g,
                                                replacement : (match, key) => Config.get(key.toLowerCase())
                                            }
                                        ]
                                    })
                                }
                            ]
                        },
                        {
                            exclude : /node_modules/,
                            test    : /\.js$/,
                            use     : [
                                'babel-loader'
                            ]
                        }
                    ]
                },
                output : {
                    // relative to the script node ran (the server.js file)
                    filename : `routes/${output}`
                },
                plugins : [
                    new StringReplacePlugin()
                ]
            }, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = ExampleRoute;
