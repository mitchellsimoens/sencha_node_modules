const argv = require('argv');
const pkg  = require('../../package.json');

const trueRe = /^true$/i;

class Args {
    constructor (modules) {
        this._arguments = null;
        this.mode       = null;
        this.modules    = modules;

        argv.version(pkg.version);

        argv.mod({
            mod     : 'release',
            options : [
                {
                    name        : 'path',
                    type        : 'path',
                    description : 'Path to file to upload'
                },
                {
                    name        : 'log',
                    type        : 'string',
                    description : 'Path to save the entire log to'
                },
                {
                    name        : 'failOnDup',
                    type        : 'boolean',
                    description : 'Stop the process if release exists in the database (based on sha1 and deleted fields)'
                },
                {
                    name        : 'forceStorageUpload',
                    type        : 'boolean',
                    description : 'If a release exists in the database, this will force upload to storage'
                },
                {
                    name        : 'version',
                    type        : 'string',
                    description : 'The Version string that is used for display'
                },
                {
                    name        : 'product',
                    type        : 'string',
                    description : 'Product code thit is used in product lookup'
                },
                {
                    name        : 'name',
                    type        : 'string',
                    description : 'Name to give to this release'
                },
                {
                    name        : 'platform',
                    type        : 'string',
                    description : 'Platform file was build for'
                },
                {
                    name        : 'license',
                    type        : 'string',
                    description : 'The License this release is using (gpl, commercial, beta)'
                },
                {
                    name        : 'jre',
                    type        : 'boolean',
                    description : 'Whether this release contains JRE in the installable'
                },
                {
                    name        : 'active',
                    type        : 'boolean',
                    description : 'Whether to set this release as active'
                },
                {
                    name        : 'dashboard',
                    type        : 'boolean',
                    description : 'Whether to show this release on the dashboard'
                },
                {
                    name        : 'database',
                    type        : 'string',
                    description : 'The database type to use'
                },
                {
                    name        : 'storage',
                    type        : 'string',
                    description : 'The storage type to use'
                },
                {
                    name        : 'cdn',
                    type        : 'string',
                    description : 'The path to final destination where the file or extracted contents will be on the CDN server'
                },
                {
                    name        : 'cdn-stage',
                    type        : 'string',
                    description : 'The path to the stage directory on the CDN server'
                },
                {
                    name        : 'cdn-extract',
                    type        : 'string',
                    description : 'If set, after the file has been uploaded to the CDN server, it will be extracted. If a string, will be the source of what to move'
                },
                {
                    name        : 'cdn-extract-destination',
                    type        : 'string',
                    description : 'If cdn-extract flag set to a string, this will be the destination to move the source to'
                },
                {
                    name        : 'cpath',
                    type        : 'path',
                    description : 'Path to config file'
                },
                {
                    name        : 'config',
                    type        : 'string',
                    description : 'Config JSON as string'
                }
            ]
        });

        argv.mod({
            mod     : 'nightly',
            options : [
                {
                    name        : 'path',
                    type        : 'path',
                    description : 'Path to file to upload'
                },
                {
                    name        : 'log',
                    type        : 'string',
                    description : 'Path to save the entire log to'
                },
                {
                    name        : 'failOnDup',
                    type        : 'boolean',
                    description : 'Stop the process if nightly exists in the database (based on sha1 and deleted fields)'
                },
                {
                    name        : 'forceStorageUpload',
                    type        : 'boolean',
                    description : 'If a release exists in the database, this will force upload to storage'
                },
                {
                    name        : 'version',
                    type        : 'string',
                    description : 'The Version string that is used for display'
                },
                {
                    name        : 'product',
                    type        : 'string',
                    description : 'Product code thit is used in product lookup'
                },
                {
                    name        : 'name',
                    type        : 'string',
                    description : 'Name to give to this nightly'
                },
                {
                    name        : 'platform',
                    type        : 'string',
                    description : 'Platform file was build for'
                },
                {
                    name        : 'license',
                    type        : 'string',
                    description : 'The License this nightly is using (gpl, commercial, beta)'
                },
                {
                    name        : 'jre',
                    type        : 'boolean',
                    description : 'Whether this release contains JRE in the installable'
                },
                {
                    name        : 'active',
                    type        : 'boolean',
                    description : 'Whether to set this nightly as active'
                },
                {
                    name        : 'dashboard',
                    type        : 'boolean',
                    description : 'Whether to show this nightly on the dashboard'
                },
                {
                    name        : 'database',
                    type        : 'string',
                    description : 'The database type to use'
                },
                {
                    name        : 'storage',
                    type        : 'string',
                    description : 'The storage type to use'
                },
                {
                    name        : 'qa',
                    type        : 'string',
                    description : 'The path to final destination where the file or extracted contents will be on the QA server'
                },
                {
                    name        : 'qa-stage',
                    type        : 'string',
                    description : 'The path to the stage directory on the QA server'
                },
                {
                    name        : 'qa-extract',
                    type        : 'string',
                    description : 'If set, after the file has been uploaded to the QA server, it will be extracted and the zip deleted'
                },
                {
                    name        : 'cdn',
                    type        : 'string',
                    description : 'The path to final destination where the file or extracted contents will be on the CDN server'
                },
                {
                    name        : 'cdn-stage',
                    type        : 'string',
                    description : 'The path to the stage directory on the CDN server'
                },
                {
                    name        : 'cdn-extract',
                    type        : 'string',
                    description : 'If set, after the file has been uploaded to the CDN server, it will be extracted and the zip deleted'
                },
                {
                    name        : 'cdn-extract-destination',
                    type        : 'string',
                    description : 'If cdn-extract flag set to a string, this will be the destination to move the source to'
                },
                {
                    name        : 'cpath',
                    type        : 'path',
                    description : 'Path to config file'
                },
                {
                    name        : 'config',
                    type        : 'string',
                    description : 'Config JSON as string'
                }
            ]
        });

        argv.mod({
            mod     : 'fiddle',
            options : [
                {
                    name        : 'description',
                    type        : 'string',
                    description : 'The description for the master group'
                },
                {
                    name        : 'log',
                    type        : 'string',
                    description : 'Path to save the entire log to'
                },
                {
                    name        : 'name',
                    type        : 'string',
                    description : 'Name to give the master group'
                },
                {
                    name        : 'product',
                    type        : 'string',
                    description : 'The product code for the examples (e.g. `ext`, `extreact`)'
                },
                {
                    name        : 'team',
                    type        : 'int',
                    description : 'The fiddle team to add the fiddles too'
                },
                {
                    name        : 'userid',
                    type        : 'string',
                    description : 'The forum userid to create the fiddles with'
                },
                {
                    name        : 'version',
                    type        : 'string',
                    description : 'The Version string that is used for display'
                }
            ]
        });

        this._a = argv.run();
    }

    get config () {
        const { _a : { options } } = this;
        const config               = {};

        if (options.cpath) {
            config.path = options.cpath;
        } else {
            config.path = null;
        }

        if (options.config) {
            config.config = options.config;
        } else {
            config.config = null;
        }

        return config.path || config.config ? config : null;
    }

    get arguments () {
        return this._arguments;
    }

    get module () {
        return this.mode;
    }

    getArguments () {
        return new Promise((resolve) => {
            if (this._arguments) {
                resolve(this._arguments);
            } else {
                this._arguments = Object.assign({}, this._a.options);

                if (this._a.targets.length > 0) {
                    this._arguments.path = argv.types.path(this._a.targets[0]);
                } else {
                    this._arguments.path = null;
                }

                this.mode = this._a.mod;

                // Basic validation
                this._validate();

                resolve(this._arguments);
            }
        });
    }

    getArgument (arg) {
        return this.arguments[arg];
    }

    _validate () {
        const args = this._arguments;

        if (!this.mode) {
            throw Error('Can not call script without specifying a module.');
        }

        if (!this.modules[this.mode]) {
            throw Error(`Module "${this.mode}" is not supported.`);
        }

        if (args) {
            for (const key in args) {
                const value = args[key];

                if (value) {
                    if (trueRe.test(value)) {
                        args[key] = true;
                    }
                } else {
                    args[key] = false;
                }
            }
        } else {
            throw Error('Can not call script without any arguments.');
        }

        if (!this._arguments.path) {
            throw Error('Path to file is not defined.');
        }
    }
}

module.exports = Args;
