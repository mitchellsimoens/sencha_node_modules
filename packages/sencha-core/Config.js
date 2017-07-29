const fs   = require('fs');
const path = require('path');

const { Base } = require('./');

/**
 * @class Sencha.core.Config
 *
 * A class to read in JSON and store as configs. Configs
 * can be retrieved using dot notation.
 */
class Config extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isConfig
                 */
                isConfig : true,

                $envs : [ // eslint-disable-line sort-keys
                    'development',
                    'production',
                    'testing'
                ],

                /**
                 * @cfg {String} [appRoot=process.cwd()] The root of
                 * the application.
                 */
                appRoot : process.cwd(),

                /**
                 * @private
                 * @property {Object} configs The object holding all
                 * the set configs.
                 */
                configs : {},

                /**
                 * @cfg {String} [env=development] The environment the
                 * process is under. Can be `development`, `production`
                 * or `testing`. Usually set to `process.env.ENV`.
                 */
                env : process.env.ENV || 'development'
            }
        };
    }

    get isDev () {
        return /^dev/i.test(this.env);
    }

    get isProduction () {
        return /^prod/i.test(this.env);
    }

    get isTest () {
        return /^test/i.test(this.env);
    }

    /**
     * @param {String} [dir=this.appRoot] The path of the directory
     * that will hold the config json scripts.
     */
    read (dir = this.appRoot) {
        return new Promise((resolve, reject) => {
            if (dir) {
                if (typeof dir === 'string') {
                    const cfg = {};

                    this.readDir(path.join(dir, 'config'), cfg)
                        .then(() => {
                            this.configs = cfg;

                            resolve(this);
                        }, reject);
                } else if (typeof dir === 'object') {
                    this.readObj(dir)
                        .then((cfg) => {
                            // TODO
                            this.configs = cfg;

                            resolve(this);
                        }, reject);
                } else {
                    reject(new Error('Nothing to read from.'));
                }
            } else {
                reject(new Error('Nothing to read from.'));
            }
        });
    }

    /**
     * @param {Object} obj The object of configs to read in. Must follow the
     * defaults/development/production/testing keys.
     */
    readObj (obj, config = {}, key) {
        return new Promise((resolve) => {
            const { default : def, [ this.env ] : env } = obj;
            let   cfg;

            if (def || env) {
                cfg = Config.merge(def, env);
            }

            if (cfg) {
                if (key) {
                    config[ key ] = cfg;
                } else {
                    Config.merge(config, cfg);
                }
            }

            resolve(config);
        });
    }

    /**
     * @param {String} dir The directory to read.
     * @param {Object} [config={}] The config object to apply the configs onto.
     * @param {String} key An optional key to apply the configs on the config object.
     * @protected
     */
    readDir (dir, config = {}, key) {
        return new Promise((resolve, reject) => {
            const { env, $envs : envs } = this;

            fs.readdir(
                dir,
                (error, files) => {
                    if (error) {
                        reject(error);
                    } else {
                        const obj = {
                            default : files.find(name => name === 'default.json'),
                            env     : files.find(name => name === `${env}.json`)
                        };

                        Promise
                            .all([
                                this.readFile(obj.default, dir),
                                this.readFile(obj.env,     dir),
                                !obj.default && !obj.env && files.filter(file => !envs.find(env => `${env}.json` === file)).length ? {} : undefined
                            ])
                            .then((sources) => this.readObj(
                                {
                                    default : sources[ 0 ] || sources[ 2 ],
                                    [ env ] : sources[ 1 ]
                                },
                                config,
                                key
                            ))
                            .then((config) => {
                                // TODO maybe check stats instead
                                const dirs = files.filter(file => !/^\.|\.json$/i.test(file));

                                if (dirs.length) {
                                    const parent = key;

                                    return Promise
                                        .all(
                                            dirs.map(child => this.readDir(
                                                path.join(dir, child),
                                                parent ? config[ parent ] : config,
                                                child,
                                                parent
                                            ))
                                        );
                                } else {
                                    return config;
                                }
                            })
                            .then(resolve)
                            .catch(reject);
                    }
                }
            );
        });
    }

    /**
     * @param {String} file The file to read.
     * @param {String} [root] A root path to prepend onto the file.
     * @protected
     *
     * This will `JSON.parse` the source.
     */
    readFile (file, root) {
        return new Promise((resolve, reject) => {
            if (file) {
                if (root) {
                    file = path.join(root, file);
                }

                fs.readFile(
                    file,
                    {
                        encoding : 'utf8'
                    },
                    (error, source) => {
                        if (error) {
                            reject(error);
                        } else {
                            try {
                                source = JSON.parse(source);

                                resolve(source);
                            } catch (e) {
                                resolve();
                            }
                        }
                    }
                );
            } else {
                resolve();
            }
        });
    }

    /**
     * Allows to lookup a key based on an object. The key can be a simple
     * string or an object string that will be resolved.
     *
     *     config.get('simple');
     *     config.get('foo.bar.baz');
     *
     * @param {String} key The key to lookup. Can be a simple string or an
     * object string (foo.bar.baz) and the value will be resolved recursively.
     * If no key is provided, will return the entire config.
     * @param {Object} [obj=this.configs] The object to use to lookup.
     *
     * @returns {*} Will return the value looked up by the key.
     */
    get (key, obj = this.configs) {
        if (key) {
            const arr = key.split('.');

            key = arr.shift();

            const value = obj[ key ];

            if (typeof value === 'object' && !Array.isArray(value)) {
                if (arr.length) {
                    return this.get(arr.join('.'), value);
                } else {
                    return value;
                }
            } else if (!arr.length) {
                return obj[ key ];
            }
        }

        return obj;
    }

    /**
     * Set a config key. The key can be a simple string or an object string
     * that will be resolved.
     *
     *     config.set('foo', 'bar');
     *     config.set('foo.bar', 'baz');
     *
     * @param {String} key The key to set the value to. Can be a simple
     * string or an object string (foo.bar.baz) and the value will be resolved
     * recursively.
     * @param {*} value The value to set to the key.
     * @param {Object} [obj=this.configs] The object to use to set the value on.
     */
    set (key, value, obj = this.configs) {
        const arr = key.split('.');

        key = arr.shift();

        const valueObj = obj[ key ];

        if (typeof valueObj == 'object' && !Array.isArray(valueObj) && arr.length) {
            this.set(arr.join('.'), value, valueObj);
        } else if (arr.length) {
            this.set(arr.join('.'), value, obj[ key ] = {});
        } else {
            obj[ key ] = value;
        }
    }
}

module.exports = new Config();
