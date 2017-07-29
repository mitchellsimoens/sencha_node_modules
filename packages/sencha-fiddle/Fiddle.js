const { Batch } = require('@extjs/sencha-mysql');

const path = require('path');
const pug  = require('pug');

const Base           = require('./Base');
const FiddleCombiner = require('./combiner/Fiddle');
const Framework      = require('./Framework');
const Manager        = require('./Manager');

/**
 * @class Sencha.fiddle.Fiddle
 * @extends Sencha.fiddle.Base
 *
 * A class that can load the fiddle resources and output HTML to run the fiddle.
 */
class Fiddle extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddle
                 */
                isFiddle : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {Boolean} [cacheTemplate=false] Allow [pug](https://www.npmjs.com/package/pug)
                     * to cache the template the first time rendered.
                     */
                    cacheTemplate  : false,
                    /**
                     * @cfg {Boolean} [prettyTemplate=false] Allow [pug](https://www.npmjs.com/package/pug)
                     * to return the compiled HTML pretty printed with spaces.
                     */
                    prettyTemplate : false,
                    /**
                     * @cfg {Boolean} [temp=false] If `true`, the fiddle assets can be saved to the temporary
                     * table. This is most likely used for running a fiddle to allow the assets to be loaded
                     * singly.
                     */
                    temp           : false,
                    /**
                     * @cfg {Number} [version=2] The version number of the fiddle to determine
                     * what template to render.
                     */
                    version        : 2
                }
            }
        };
    }

    /**
     * Load a fiddle and all it's resources.
     * @static
     * @method
     * @param {Object} info
     * @param {Number/String} info.id The id of the fiddle. This can be
     * the encoded or real ID.
     * @param {Sencha.mysql.Batch} info.batch Optional. The batch to use to
     * add the separate database queries to. If one is not provided, one will
     * automatically be instantiated.
     * @param {Sencha.mysql.Connection} info.connection Optional. The database
     * connection to use to retrieve the data. If not provided, will not execute
     * the queries.
     * @return {Promise}
     */
    static load (info = {}) {
        return new Promise((resolve, reject) => {
            let { id } = info;

            if (id) {
                id = this.decodeId(id);

                const {
                    batch = new Batch(),
                    connection
                } = info;

                const fiddleCombiner   = new FiddleCombiner();
                const asset            = Manager.instantiateOperation('fiddle.asset.get');
                const fiddle           = Manager.instantiateOperation('fiddle.get');
                const mockdata         = Manager.instantiateOperation('fiddle.mockdata.get');
                const frameworkPackage = Manager.instantiateOperation('framework.package.get');
                const packageAsset     = Manager.instantiateOperation('framework.package.asset.get');

                fiddleCombiner.add('fiddle',                  fiddle          .getById               (id, batch)); // eslint-disable-line no-whitespace-before-property,func-call-spacing
                fiddleCombiner.add('fiddle.assets',           asset           .getAllForFiddle       (id, batch)); // eslint-disable-line no-whitespace-before-property,func-call-spacing
                fiddleCombiner.add('fiddle.mockdata',         mockdata        .getAllForFiddle       (id, batch)); // eslint-disable-line no-whitespace-before-property,func-call-spacing
                fiddleCombiner.add('fiddle.packages',         frameworkPackage.getForFiddle          (id, batch)); // eslint-disable-line func-call-spacing
                fiddleCombiner.add('fiddle.packages.$assets', packageAsset    .getForPackageForFiddle(id, batch)); // eslint-disable-line no-whitespace-before-property

                fiddleCombiner.add('fiddle.framework', Framework.loadForFiddle({
                    batch,
                    id,
                    nightly : info.nightly
                }));

                fiddleCombiner
                    .then((data) => new this({
                        data,
                        version : data.version || 2
                    }))
                    .then(resolve, reject);

                if (connection) {
                    connection.exec(batch);
                }
            } else {
                reject(new Error('No `id` to load.'));
            }
        });
    }

    /**
     * Checks if a `id` is set on this instance. If so, it will increment
     * the `runs`.
     * @param {Object} info
     * @param {Sencha.mysql.Batch} info.batch Optional. The batch to use to
     * add the separate database queries to. If one is not provided, one will
     * automatically be instantiated.
     * @param {Sencha.mysql.Connection} info.connection Optional. The database
     * connection to use to retrieve the data. If not provided, will not execute
     * the queries.
     * @return {Promise}
     */
    run (info = {}) {
        return new Promise((resolve, reject) => {
            const { data : { id } } = this;

            if (id) {
                const {
                    batch = new Batch(),
                    connection
                } = info;

                const run = this._run.bind(this);

                Manager.instantiateOperation('fiddle.update')
                    .incrementRun(id, batch)
                    .then(run, run)
                    .then(resolve, reject);

                if (connection) {
                    connection.exec(batch);
                }
            } else {
                resolve(this._run());
            }
        });
    }

    /**
     * Compiles the template in order to run the fiddle.
     * @return {String} The compiled HTML.
     */
    _run () {
        const me = this;

        me.maybeAddDirectApi();
        me.maybeWrap();
        me.parseAssets();

        return pug.renderFile(
            path.join(__dirname, `views/run/${me.version}/run.pug`),
            {
                cache      : me.cacheTemplate,
                data       : me.data,
                hasReactor : me._hasReactor(),
                inspector  : me.inspector,
                pretty     : me.prettyTemplate,
                session    : me.session
            }
        );
    }

    _hasReactor (packages = this.data.packages) {
        if (packages) {
            return packages.some(pkg => pkg && (pkg === 'reactor' || pkg.name === 'reactor'));
        }

        return false;
    }

    /**
     * Wraps `app.js` for version 1 fiddles if the code does not
     * contain `Ext.onReady`, `Ext.application` or `Ext.setup`.
     */
    maybeWrap () {
        if (this.version === 1) {
            this.data.assets.forEach(asset => {
                if (asset.url === 'app.js' || asset.name === 'app.js') {
                    const { code } = asset;

                    if (code && !/(Ext\.onReady\(|Ext\.application\(|Ext.setup\()/.test(code)) {
                        asset.code = `Ext.onReady(function() {\n\n${code}\n\n});`;
                    }
                }
            });
        }
    }

    /**
     * Parses the assets prior to running.
     */
    parseAssets () {
        const { data : { assets, framework } } = this;

        if (framework.frameworkPath) {
            assets.forEach(asset => {
                if (asset.remote) {
                    if (asset.code) {
                        asset.code = asset.code.replace('{frameworkPath}', framework.frameworkPath);
                    }

                    if (asset.name) {
                        asset.name = asset.name.replace('{frameworkPath}', framework.frameworkPath);
                    }
                }
            });
        }

        assets.forEach(asset => {
            if (asset.remote) {
                if (/^http/i.test(asset.code)) {
                    asset.name = asset.code;
                    asset.code = '__remote__';
                }
            }
        });
    }

    /**
     * Compiles the template in order to embed the fiddle.
     * @param {Object} cfg An optional object of data to pass to the
     * pug template when embedding.
     * @return {String} The compiled HTML.
     */
    embed (cfg) {
        return pug.renderFile(
            path.join(__dirname, 'views/embed/embed.pug'),
            Object.assign(cfg, {
                cache   : this.cacheTemplate,
                data    : this.data,
                id      : this.constructor.encodeId(this.data.id),
                pretty  : !this.prettyTemplate,
                session : this.session
            })
        );
    }

    /**
     * Saves the fiddle accounting if the fiddle is a temporary,
     * new or existing fiddle.
     * @param {Object} info
     * @param {Sencha.mysql.Batch} info.batch Optional. The batch to use to
     * add the separate database queries to. If one is not provided, one will
     * automatically be instantiated.
     * @param {Sencha.mysql.Connection} info.connection Optional. The database
     * connection to use to retrieve the data. If not provided, will not execute
     * @return {Promise}
     */
    save (info = {}) {
        return new Promise((resolve, reject) => {
            const { batch = new Batch() } = info;

            let { connection } = info,
                promise;

            this.prepareInfo(info);

            if (this.temp) {
                if (this.session) {
                    const creator = Manager.instantiateOperation('fiddle.create');

                    promise = creator.temp(this.data, this.session, batch);
                } else {
                    connection = null;

                    reject(new Error('No session provided to save the code with.'));
                }
            } else if (this.data.id) {
                promise = this._update(info, batch);
            } else {
                promise = this._create(info, batch);
            }

            if (promise) {
                promise
                    .then(() => resolve(this))
                    .catch(reject);
            }

            if (connection) {
                connection.doTransact(batch);
            }
        });
    }

    _create (info, batch) {
        const fiddleCreator    = Manager.instantiateOperation('fiddle.create');
        const assetCreator     = Manager.instantiateOperation('fiddle.asset.create');
        const mockdataCreator  = Manager.instantiateOperation('fiddle.mockdata.create');
        const packageCreator   = Manager.instantiateOperation('fiddle.package.create');
        const permissionGetter = Manager.instantiateOperation('permission.team.get');
        const data             = this.prepareData(this.data, {
            doDecode : true
        });

        const { assets, mockdata, packages } = data;

        const promises = [
            permissionGetter.getForCreate(data.teamid, info.userid, batch)
        ];

        promises.push(
            fiddleCreator
                .create(data, batch)
                .then(result => {
                    data.id = result.insertId;

                    return result;
                })
        );

        if (Array.isArray(assets) && assets.length) {
            assets.forEach(asset => {
                promises.push(
                    assetCreator
                        .create(asset, data.frameworkid, batch)
                        .then(result => {
                            asset.id = result.insertId;

                            return result;
                        })
                );
            });
        }

        if (Array.isArray(mockdata) && mockdata.length) {
            mockdata.forEach(data => {
                promises.push(
                    mockdataCreator
                        .create(data, batch)
                        .then(result => {
                            data.id = result.insertId;

                            return result;
                        })
                );
            });
        }

        if (Array.isArray(packages) && packages.length) {
            packages.forEach(pkg => {
                promises.push(
                    packageCreator
                        .create(pkg, batch)
                        .then(result => {
                            pkg.id = result.insertId;

                            return result;
                        })
                );
            });
        }

        return Promise
            .all(promises)
            .then(this.onUpdate.bind(this));
    }

    _update (info, batch) {
        const fiddleUpdater    = Manager.instantiateOperation('fiddle.update');
        const assetUpdater     = Manager.instantiateOperation('fiddle.asset.update');
        const assetDeleter     = Manager.instantiateOperation('fiddle.asset.delete');
        const mockdataUpdater  = Manager.instantiateOperation('fiddle.mockdata.update');
        const mockdataDeleter  = Manager.instantiateOperation('fiddle.mockdata.delete');
        const packageUpdater   = Manager.instantiateOperation('fiddle.package.update');
        const packageDeleter   = Manager.instantiateOperation('fiddle.package.delete');
        const permissionGetter = Manager.instantiateOperation('permission.fiddle.get');
        const data             = this.prepareData(this.data, {
            doDecode : true
        });

        const { assets, mockdata, packages } = data;

        const promises = [
            permissionGetter.getForUpdate(data.id, info.userid, batch)
        ];

        promises.push(
            fiddleUpdater.update(data, batch)
        );

        if (Array.isArray(assets) && assets.length) {
            assets.forEach(asset => {
                if (asset.id) {
                    if (asset.removed) {
                        promises.push(
                            assetDeleter.delete(asset, batch)
                        );
                    } else if (asset.fiddleid) {
                        promises.push(
                            assetUpdater.update(asset, data.frameworkid, batch)
                        );
                    }
                }
            });
        }

        if (Array.isArray(mockdata) && mockdata.length) {
            mockdata.forEach(data => {
                if (data.id) {
                    if (data.removed) {
                        promises.push(
                            mockdataDeleter.delete(data, batch)
                        );
                    } else if (data.fiddleid) {
                        promises.push(
                            mockdataUpdater.update(data, batch)
                        );
                    }
                }
            });
        }

        if (Array.isArray(packages) && packages.length) {
            packages.forEach(pkg => {
                if (pkg.id) {
                    if (pkg.removed) {
                        promises.push(
                            packageDeleter.delete(pkg, batch)
                        );
                    } else if (pkg.fiddleid) {
                        promises.push(
                            packageUpdater.update(pkg, batch)
                        );
                    }
                }
            });
        }

        return Promise
            .all(promises)
            .then(this.onUpdate.bind(this));
    }

    prepareInfo () {
        if (this._hasReactor(this.data.packages)) {
            const codes = {};

            let appJs;

            this.data.assets.forEach(asset => {
                if (asset.type === 'js' || asset.type === 'javascript') {
                    const name = asset.url || asset.name;

                    if (name === 'app.js') {
                        appJs = asset;
                    }

                    codes[ `/${name}` ] = asset.code;
                }
            });

            appJs.code = `Ext.onReady(function() {
    require('app.js');
});`;

            this.data.codes = JSON.stringify(codes);
        }

        return this;
    }

    /**
     * If there is mock data loaded, check to see if there is an Ext.Direct
     * data asset. If so, automatically add the direct/api remote asset.
     * @return {Sencha.fiddle.Fiddle}
     */
    maybeAddDirectApi () {
        const { data : { mockdata } } = this;

        if (Array.isArray(mockdata) && mockdata.length) {
            for (const data of mockdata) {
                if (data.type === 'direct') {
                    this.addAsset({
                        name   : 'direct/api',
                        remote : true,
                        type   : 'js'
                    });

                    break;
                }
            }
        }

        return this;
    }

    /**
     * Add an asset to the array of assets for this fiddle.
     * @param {Object} asset The asset to add.
     * @return {Sencha.fiddle.Fiddle}
     */
    addAsset (asset) {
        let { data : { assets } } = this;

        // TODO maybe add a check if name collision?

        if (!assets) {
            assets = [];

            this.data.assets = assets;
        }

        assets.push(asset);

        return this;
    }

    /**
     * Add a data to the array of mock datas for this fiddle.
     * @param {Object} data The mock data to add.
     * @return {Sencha.fiddle.Fiddle}
     */
    addMockData (data) {
        let { data : { mockdata } } = this;

        // TODO maybe add a check if name collision?

        if (!mockdata) {
            mockdata = [];

            this.data.mockdata = mockdata;
        }

        mockdata.push(data);

        return this;
    }

    prepareData (data = this.data, opts = {}) {
        const idFn = opts.doDecode ? 'decodeId' : 'encodeId';

        if (data.id && opts.isFiddle !== false) {
            data.id = this.constructor[ idFn ](data.id);
        }

        if (data.forkid) {
            data.forkid = this.constructor[ idFn ](data.forkid);
        }

        if (data.fiddleid) {
            data.fiddleid = this.constructor[ idFn ](data.fiddleid);
        }

        if (data.assets) {
            data.assets.forEach(asset => {
                asset.fiddleid = data.id;
            });
        }

        if (data.mockdata) {
            data.mockdata.forEach(mockdata => {
                mockdata.fiddleid = data.id;
            });
        }

        if (data.packages) {
            data.packages.forEach(pkg => {
                pkg.fiddleid = data.id;
            });
        }

        return data;
    }

    onUpdate (results) {
        // first result is the SET @permission so it won't have affectedRows > 0
        if (results.every((result, idx) => idx === 0 || result.affectedRows > 0)) {
            const data = this.prepareData(this.data, {
                doDecode : false
            });

            this.data = data;

            if (data.assets) {
                data.assets = data.assets.filter(asset => !asset.removed);
            }

            if (data.mockdata) {
                data.mockdata = data.mockdata.filter(mockdata => !mockdata.removed);
            }

            if (data.packages) {
                data.packages = data.packages.filter(pkg => !pkg.removed);
            }

            return this;
        } else {
            throw new Error('The fiddle could not be saved possibly due to permissions');
        }
    }
}

module.exports = Fiddle;
