const {
    error : { FatalError },
    step  : { fiddle : { Base } },
    util  : { Logger }
} = require('../../');

const fs    = require('fs');
const JSON5 = require('json5');
const path  = require('path');

const assetExtRe    = /^(js(?!on)|css|html)$/i;
const entryFilterRe = /^\.ds_store$/i;

class BuildGroups extends Base {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const { info }       = runner;
            const { args, user } = info;
            const dirPath        = path.join(args.path, 'examples');
            const group          = {
                creator          : user.userid,
                creator_username : user.username,
                name             : args.name,
                description      : args.description
            };

            this.runner = runner;

            Logger.info('Building groups from SDK repo...');

            this
                .cascade(dirPath, group)
                .then(() => {
                    Logger.info('Groups built from SDK repo.');

                    info.group = group;

                    delete this.runner;
                })
                .then(resolve, reject);
        });
    }

    cascade (dirPath, entry) {
        return new Promise((resolve, reject) => {
            this
                .readDir(dirPath, entry)
                .then(entries => this.handleDir(entries, entry))
                .then(resolve, reject);
        });
    }

    readDir (dirPath, entry) {
        return new Promise((resolve, reject) => {
            fs.stat(dirPath, (error, stat) => {
                if (stat.isDirectory()) {
                    fs.readdir(dirPath, (error, entries) => {
                        if (error) {
                            reject(new FatalError(error));
                        } else {
                            entries = entries
                                .filter(name => !entryFilterRe.test(name))
                                .map(name => {
                                    return {
                                        name,
                                        path : path.join(dirPath, name)
                                    };
                                });

                            if (entry) {
                                entry.children = entries;
                            }

                            resolve(entries);
                        }
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    handleDir (entries, entry) {
        return new Promise((resolve, reject) => {
            const pkg = entries.find(entry => entry.name === 'package.json');

            if (entry && pkg) {
                entries.splice(entries.indexOf(pkg), 1);

                this
                    .loadPackageJson(entry.path)
                    .then(pkg => {
                        const { fiddle } = pkg;

                        if (fiddle) {
                            entry.$pkg = pkg;

                            if (fiddle.example) {
                                return this.buildExample(entry);
                            } else if (fiddle.toolkit) {
                                return this
                                    .parseToolkit(entry)
                                    .then(this.handleDir.bind(this, entries));
                            }
                        }

                        return this.handleDir(entries, entry);
                    })
                    .then(resolve, reject);
            } else if (entries.length) {
                Promise
                    .all(
                        entries.map(dir => this.cascade(dir.path, dir))
                    )
                    .then(resolve, reject);
            } else {
                resolve(entries);
            }
        });
    }

    loadPackageJson (dirPath) {
        return new Promise((resolve, reject) => {
            const filePath = path.join(dirPath, 'package.json');

            fs.readFile(filePath, 'utf8', (error, code) => {
                if (error) {
                    reject(new FatalError(error));
                } else {
                    code = JSON5.parse(code);

                    resolve(code);
                }
            })
        });
    }

    parseToolkit (toolkit) {
        return new Promise((resolve, reject) => {
            const { runner } = this;

            const {
                info : {
                    'package.json' : {
                        fiddle : {
                            toolkits : {
                                [ toolkit.name ] : {
                                    themes
                                }
                            }
                        }
                    }
                }
            } = runner;

            for (const name in themes) {
                const theme = themes[name];

                if (theme.default) {
                    return this
                        .getFramework(toolkit, name, runner)
                        .then(() => toolkit)
                        .then(resolve, reject);
                }
            }

            resolve(toolkit);
        });
    }

    getFramework (toolkit, theme, runner) {
        return new Promise((resolve, reject) => {
            const databaseName = this.getDatabase();
            const {
                info : {
                    app  : {
                        database
                    },
                    args : {
                        version
                    }
                }
            } = runner;

            const sqls = [
                `SET @frameworkid = (
    SELECT
        id
    FROM ${databaseName}.fiddle_catalog
    WHERE
        ${databaseName}.fiddle_catalog.toolkit = ?
        AND
        ${databaseName}.fiddle_catalog.theme = ?
        AND
        LEFT(${databaseName}.fiddle_catalog.version, ${version.length}) = ?
    ORDER BY LENGTH(${databaseName}.fiddle_catalog.version) DESC, ${databaseName}.fiddle_catalog.version DESC
    LIMIT 1
);`,
                `SELECT @frameworkid AS id;`,
                `SELECT
    ${databaseName}.fiddle_catalog_packages.id,
    ${databaseName}.fiddle_catalog_packages.name
FROM ${databaseName}.fiddle_catalog_packages
WHERE ${databaseName}.fiddle_catalog_packages.catalogid = @frameworkid
ORDER BY ${databaseName}.fiddle_catalog_packages.name;`
            ];

            const inserts = [
                toolkit.name,
                theme,
                version
            ];

            database
                .query(sqls, inserts)
                .then(results => {
                    [ , [ toolkit.framework ], toolkit.packages ] = results;

                    return toolkit;
                })
                .then(resolve, reject);
        });
    }

    buildExample (example) {
        return new Promise((resolve, reject) => {
            this
                .handleExampleChildren(example.children, example)
                .then(() => example)
                .then(this.ensureExampleFiles.bind(this))
                .then(resolve, reject);

            delete example.children;
        });
    }

    ensureExampleFiles (example) {
        const { assets } = example;

        if (!assets.find(asset => asset.name === 'app.js')) {
            assets.push({
                code : '',
                name : 'app.js',
                type : 'js'
            });
        }

        if (!assets.find(asset => asset.name === 'index.html')) {
            assets.push({
                code : '',
                name : 'index.html',
                type : 'html'
            });
        }

        return example;
    }

    handleExampleChildren (entries, example) {
        const assets   = example.assets   || (example.assets   = []);
        const mockdata = example.mockdata || (example.mockdata = []);
        const dirs     = [];

        entries.forEach(entry => {
            const stat = fs.statSync(entry.path);

            if (stat.isDirectory()) {
                dirs.push(entry);
            } else {
                const code         = fs.readFileSync(entry.path, 'utf8');
                const type         = path.extname(entry.path).substr(1);
                const isAsset      = assetExtRe.test(type);
                const relativePath = path.relative(example.path, entry.path);

                if (isAsset) {
                    assets.push({
                        code, type,
                        name : relativePath
                    });
                } else {
                    mockdata.push({
                        type,
                        data : code,
                        url  : relativePath
                    });
                }
            }
        });

        return this.handleExampleChildrenDirectories(dirs, example)
    }

    handleExampleChildrenDirectories (dirs, example) {
        if (dirs && dirs.length) {
            return Promise
                .all(
                    dirs.map(dir => this.readDir(dir.path))
                )
                .then(entries => {
                    return Promise
                        .all(
                            entries.map(entry => this.handleExampleChildren(entry, example))
                        );
                });
            } else {
                return Promise.resolve();
            }
    }
}

module.exports = BuildGroups;
