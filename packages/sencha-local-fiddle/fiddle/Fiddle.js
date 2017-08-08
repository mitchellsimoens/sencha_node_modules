const { Base }   = require('./');
const { Config } = require('@extjs/sencha-core');
const https      = require('https');
const JSON5      = require('json5');

const apiUrl    = 'https://api.sencha.com';
const fiddleUrl = 'https://fiddle.sencha.com';

const applicationRe = /Ext\.application\(/;
const fiddlePathRe  = /^([A-Za-z0-9]+)(?:\/(.+))?/;

class Fiddle extends Base {
    constructor ({ fiddleid, req, res }) {
        super({
            req,
            res
        });

        this.fiddleid = fiddleid;
    }

    handle () {
        let { fiddleid } = this;

        if (fiddleid) {
            const matches = fiddleid.match(fiddlePathRe);

            if (matches[ 2 ]) {
                [ , fiddleid ] = matches;

                this.fiddleid = fiddleid;

                return this.loadFile(fiddleid, matches[ 2 ]);
            } else {
                return this
                    .loadFiddle(fiddleid)
                    .then(this.loadFramework.bind(this))
                    .then(this.prepareForIndex.bind(this));
            }
        } else {
            return Promise.reject(new Error('No fiddle id provided'));
        }
    }

    makeRequest (url, json) {
        return new Promise((resolve, reject) => {
            https
                .get(url, res => {
                    if (res.statusCode === 200) {
                        let full = '';

                        res.on('data', data => {
                            full += data;
                        });

                        res.on('end', () => {
                            if (json) {
                                const parsed = JSON5.parse(full);

                                resolve(parsed);
                            } else {
                                resolve(full);
                            }
                        });
                    } else {
                        reject(new Error('Fiddle not found'));
                    }
                })
                .on('error', reject);
        });
    }

    loadFiddle (id) {
        return this
            .makeRequest(`${apiUrl}/v1.0/fiddle/fiddle/get/${id}`, true)
            .then(ret => {
                if (ret.success) {
                    return ret.data;
                } else {
                    throw new Error('Fiddle not found');
                }
            })
            .then(fiddle => this.fiddle = fiddle);
    }

    loadFramework (fiddle) {
        if (fiddle.framework) {
            return fiddle;
        }

        return this
            .makeRequest(`${apiUrl}/v1.0/fiddle/catalog/get/${fiddle.frameworkid}`, true)
            .then(ret => {
                if (ret.id) {
                    fiddle.framework = ret;

                    return fiddle;
                } else {
                    throw new Error('Framework not found');
                }
            });
    }

    loadFile (fiddleid, path) {
        let promise = this.makeRequest(`${fiddleUrl}/fiddle/${fiddleid}/${path}`);

        if (path === 'app.js') {
            promise = promise.then(this.buildAppJs.bind(this));
        }

        return promise;
    }

    pathToBaseUrl (id) {
        if (typeof id === 'object') {
            id = id.id; // eslint-disable-line prefer-destructuring
        }

        return `/fiddle/${id}/`;
    }

    getToolkit () {
        const {
            fiddle : {
                framework
            }
        } = this;

        return framework.toolkit;
    }

    getDefaultTheme (toolkit) {
        const {
            fiddle : {
                framework : {
                    theme
                }
            }
        } = this;

        const {
            toolkits : {
                [ toolkit ] : {
                    themes
                }
            }
        } = Config.get('extjs');

        return themes[ theme.toLowerCase() ];
    }

    prepareForIndex (fiddle, entries, example = this.fiddle, body) {
        if (!entries) {
            entries = [].concat(fiddle.assets, fiddle.mockdata);
        }

        if (!body) {
            const index = entries.find(entry => entry.name === 'index.html');

            body = index.code;
        }

        return super.prepareForIndex(fiddle, entries, example, body);
    }

    buildAppJs (code, example) {
        code = super.buildAppJs(code, example);

        if (code.search(applicationRe) !== -1) {
            const { fiddleid } = this;

            code = `var oldExtApplication = Ext.application;

Ext.application = function (config) {
    config = config || {};

    config.appFolder = '/fiddle/${fiddleid}/app';

    return oldExtApplication.call(this, config);
};

${code}`;
        }

        return code;
    }
}

module.exports = Fiddle;
