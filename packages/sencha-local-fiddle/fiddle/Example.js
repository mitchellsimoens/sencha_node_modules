const {
    fiddle : { Base },
    util   : { Squash }
} = require('../');

const fs    = require('fs');
const JSON5 = require('json5');
const path  = require('path');
const pug   = require('pug');

const { Config } = require('@extjs/sencha-core');
const { File }   = require('@extjs/sencha-fiddle');

const extAssetRe   = /\.(js(?!on)|css|html)$/i;
const numericRe    = /^\d+$/;
const simpleJsonRe = /\{|\[/;
const toolkitRe    = /^[0-9.]+\/([a-z]+)/i;
const versionRe    = /[0-9.]+\/(.+)/;

class Example extends Base {
    /**
     * Turns a file path to a relative URL. Will also
     * always append a `/` to the end of the url.
     *
     * @return {String} The generated URL.
     */
    pathToBaseUrl (url) {
        const base     = Config.get('examples');
        const relative = path.relative(base, url);

        return relative.replace(versionRe, '$1');
    }

    /**
     * The method that gets called to kick off an incoming request.
     * This determines if a directory or a file is being requested.
     * If a directory is being requested, {@link #handleDirectory}
     * will be called to determine if the directory is an example
     * and therefore the example should be run or if a directory
     * listing should be shown.
     */
    handle () {
        return new Promise((resolve, reject) => {
            const { req } = this;
            const base    = Config.get('examples');

            const {
                params : { 0 : loc }
            } = req;

            Squash
                .getPath(base, null, loc)
                .then(lookup => {
                    if (lookup) {
                        const basename = path.basename(lookup);

                        if (basename.toLowerCase() === 'index.html') {
                            lookup = path.dirname(lookup);
                        }

                        fs.stat(lookup, (error, stat) => {
                            const promise = error ? // eslint-disable-line operator-linebreak
                                Promise.reject(error) : // eslint-disable-line operator-linebreak,indent
                                this[ stat.isDirectory() ? 'handleDirectory' : 'handleFile' ](lookup);

                            promise.then(resolve, reject);
                        });
                    } else {
                        reject(new Error('File not found'));
                    }
                });
        });
    }

    /**
     * Handles when a directory is being requested and determines if
     * a directory listing should be shown or if the directory is an
     * example and therefore the example should be run.
     *
     * @param {String} lookup The directory being looked up.
     * @return {Promise}
     */
    handleDirectory (lookup) {
        return new Promise((resolve, reject) => {
            fs.readdir(lookup, (error, entries) => {
                if (error) {
                    reject(error);
                } else if (entries.length) {
                    // an example must have an app.js at least
                    if (entries.includes('app.js')) {
                        this.handleExample(lookup, entries).then(resolve, reject);
                    } else {
                        this.handleDirectoryListing(lookup).then(resolve, reject);
                    }
                } else {
                    resolve('empty directory');
                }
            });
        });
    }

    /**
     * Parses the directory entries and shows a link to each
     * directory. Any file in the directory will be ignored.
     *
     * If the directory has no child directories, the returned
     * promise will resolve with `empty directory`.
     *
     * @param {String} lookup The directory being looked up.
     * @param {String[]} entries The directory entries.
     * @return {Promise}
     */
    handleDirectoryListing (lookup) {
        const base     = Config.get('examples');
        const relative = path.relative(base, lookup).split('/');
        const version  = relative.shift();

        return Squash
            .squash(base, version, relative.join('/'))
            .then((map) => {
                const dirs = [];

                for (const name in map) {
                    const fullPath = map[ name ];
                    const link     = this.endSlashify(path.join('/example', this.pathToBaseUrl(fullPath)));

                    dirs.push({
                        link,
                        name
                    });
                }

                return pug.renderFile(
                    path.join(__dirname, '..', 'views/listing.pug'),
                    {
                        cache    : false,
                        examples : dirs,
                        pretty   : true
                    }
                );
            });
    }

    /**
     * Kicks off running the example by first loading the `package.json`
     * and then building the `index.html` source.
     *
     * @param {String} lookup The directory being looked up.
     * @param {String[]} entries The directory entries.
     * @return {Promise}
     */
    handleExample (lookup, entries) {
        return this
            .loadPackageJson(lookup)
            .then(this.prepareForIndex.bind(this, lookup, entries));
    }

    /**
     * Handles when a single file is being requested. If the file is
     * `app.js`, this will load the `package.json` so it can determine
     * what classes are needed to be required so it can add to the
     * `Ext.require` call.
     *
     * @param {String} filePath The path to the file being requested.
     * @return {Promise}
     */
    handleFile (filePath) {
        return this
            .loadFile(filePath)
            .then(code => {
                const basename = path.basename(filePath).toLowerCase();
                const dirname  = path.dirname(filePath);

                if (basename === 'app.js') {
                    return this
                        .loadPackageJson(dirname)
                        .then(this.buildAppJs.bind(this, code));
                } else if (basename.search(extAssetRe) === -1) {
                    return this
                        .loadPackageJson(dirname)
                        .then(this.handleDataFile.bind(this, code, basename));
                } else {
                    return code;
                }
            });
    }

    handleDataFile (code, basename, example) {
        const { req }                = this;
        const { fiddle : { files } } = example;
        const cfg                    = files && files[ basename ];
        const data                   = Object.assign({
            code
        }, cfg);
        const file                   = new File({
            data,
            params : this.prepareParams(req.method === 'GET' ? req.query : req.body),
            req    : this.prepareReq(req)
        });

        return file
            .maybeDelay()
            .then(file => file.maybeWrap())
            .then(file => file._handleDynamic())
            .then(file => file.template())
            .then(file => {
                let { data : { code } } = file;

                if (typeof code !== 'string') {
                    code = JSON5.stringify(code, null, 4);
                }

                return code;
            });
    }

    isEmpty (obj = {}) {
        return Object.getOwnPropertyNames(obj).length === 0;
    }

    prepareParams (params = {}) {
        for (const key in params) {
            let value = params[ key ];

            if (value && typeof value === 'string') {
                if (simpleJsonRe.test(value)) {
                    value = JSON.parse(value);

                    if (value) {
                        params[ key ] = value;
                    }
                } else if (numericRe.test(value)) {
                    value = parseInt(value);

                    if (!isNaN(value)) {
                        params[ key ] = value;
                    }
                }
            }
        }

        return params;
    }

    prepareReq (req) {
        return {
            body    : this.isEmpty(req.body)  ? null : Object.assign({}, req.body),
            cookies : Object.assign({}, req.cookies),
            headers : Object.assign({}, req.headers),
            isReq   : true,
            method  : req.method,
            query   : this.isEmpty(req.query) ? null : Object.assign({}, req.query)
        };
    }

    /**
     * Loads the `package.json` if one exists. If it does not
     * exist, the promise will be resolved with an empty array.
     * If it does exist, the source will be parsed with the
     * JSON5 module (so it can support comments) and the
     * promise will be resolved with an Object.
     *
     * @param {String} dir The base directory where the `package.json`
     * resides in.
     * @return {Promise}
     */
    loadPackageJson (dir) {
        const filePath = path.join(dir, 'package.json');

        return new Promise(resolve => {
            fs.stat(filePath, (error) => {
                if (error) {
                    resolve({});
                } else {
                    return this
                        .loadFile(filePath)
                        .then(code => JSON5.parse(code))
                        .then(example => {
                            example.fiddle.path = dir;

                            return example;
                        })
                        .then(resolve)
                        .catch(() => {
                            resolve({});
                        });
                }
            });
        });
    }

    /**
     * Attempts to determine what toolkit a path is under.
     *
     * @param {String} lookup The path to use to determine.
     * @return {String} The toolkit lower-cased.
     */
    getToolkit (lookup) {
        const dir      = Config.get('examples');
        const relative = path.relative(dir, lookup);

        return relative
            .match(toolkitRe)[ 1 ]
            .toLowerCase();
    }

    prepareForIndex (lookup, entries, example, body) {
        if (entries.includes('index.html') && body == null) {
            return this
                .loadFile(path.join(lookup, 'index.html'))
                .then(this.prepareForIndex.bind(this, lookup, entries, example));
        }

        if (!example.reactorCodes && this.hasReactor(example)) {
            return this
                .buildExampleFileMap(example)
                .then(this.prepareForIndex.bind(this, lookup, entries, example))
                .then(data => {
                    data.codes = JSON.stringify(example.reactorCodes);

                    return data;
                });
        }

        return super.prepareForIndex(lookup, entries, example, body);
    }

    buildExampleFileMap (example) {
        return new Promise((resolve, reject) => {
            const map = {};

            example.reactorCodes = map;

            this
                .buildFileMap(map, example.fiddle.path, example)
                .then(resolve, reject);
        });
    }

    buildFileMap (map, dirPath, example) {
        return new Promise((resolve, reject) => {
            fs.readdir(dirPath, (error, entries) => {
                if (error) {
                    reject(error);
                } else {
                    const promises = [];

                    entries.forEach((name) => {
                        if (name !== 'package.json') {
                            const filePath = path.join(dirPath, name);
                            const stat     = fs.statSync(filePath);

                            if (stat.isDirectory()) {
                                const promise = this.buildFileMap(map, filePath, example);

                                promises.push(promise);
                            } else {
                                const promise = this
                                    .loadFileSource(filePath)
                                    .then(source => {
                                        const relativePath = path.relative(example.fiddle.path, filePath);

                                        map[ `/${relativePath}` ] = source;
                                    });

                                promises.push(promise);
                            }
                        }
                    });

                    Promise
                        .all(promises)
                        .then(() => resolve(), reject);
                }
            });
        });
    }

    loadFileSource (filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (error, source) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(source);
                }
            });
        });
    }
}

module.exports = Example;
