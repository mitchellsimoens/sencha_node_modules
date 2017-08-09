const {
    step : { fiddle : { Base } },
    util : { Logger }
} = require('../../');

const { Squash } = require('@extjs/sencha-utils');

const fs    = require('fs');
const JSON5 = require('json5');
const path  = require('path');

const assetExtRe    = /^(js(?!on)|css|html)$/i;
const entryFilterRe = /^\.ds_store|package\.json$/i;

class BuildGroups extends Base {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const { info }       = runner;
            const { args, user } = info;

            this.runner = runner;

            Logger.info('Building groups from SDK repo...');

            this
                .getDirectoryMap()
                .then(this.cascade.bind(this))
                .then(children => {
                    Logger.info('Groups built from SDK repo.');

                    info.group = {
                        children,
                        creator          : user.userid,
                        creator_username : user.username, // eslint-disable-line camelcase
                        description      : args.description,
                        name             : args.name
                    };
                })
                .then(resolve, reject);
        });
    }

    finish () {
        delete this.runner;
    }

    getDirectoryMap () {
        const { runner : { info : { args : { path : base } } } } = this;

        return Squash.squash({
            base : path.join(base, 'examples'),
            deep : true
        });
    }

    cascade (map) {
        const promises = [];

        for (const dirname in map) {
            const { [ dirname ] : obj } = map;

            promises.push(
                this.handleDirectory(dirname, obj)
            );
        }

        return Promise
            .all(promises)
            .then(() => map);
    }

    handleDirectory (dirname, obj) {
        return new Promise((resolve, reject) => {
            this
                .loadPackageJson(obj.loc)
                .then(pkg => {
                    if (pkg) {
                        obj.$pkg = pkg;

                        const { fiddle } = pkg;

                        if (fiddle) {
                            if (fiddle.toolkit) {
                                return this.handleToolkit(dirname, obj);
                            } else if (fiddle.example) {
                                return this.handleExample(dirname, obj);
                            }
                        }
                    }

                    return obj;
                })
                .then(obj => {
                    if (obj.children) {
                        return this.cascade(obj.children);
                    }

                    return obj;
                })
                .then(resolve, reject);
        });
    }

    loadPackageJson (base) {
        return new Promise((resolve, reject) => {
            const loc = path.join(base, 'package.json');

            fs.stat(loc, (error) => {
                if (error) {
                    resolve();
                } else {
                    fs.readFile(loc, 'utf8', (error, source) => {
                        if (error) {
                            reject(error);
                        } else {
                            source = JSON5.parse(source);

                            resolve(source);
                        }
                    });
                }
            });
        });
    }

    handleToolkit (dirname, obj) {
        return new Promise((resolve, reject) => {
            const { runner } = this;

            const {
                info : {
                    'fiddle.json' : {
                        extjs : {
                            toolkits : {
                                [ dirname ] : {
                                    themes
                                }
                            }
                        }
                    }
                }
            } = runner;

            for (const name in themes) {
                const { [ name ] : theme } = themes;

                if (theme.default) {
                    return this
                        .getFramework(dirname, name, obj)
                        .then(() => obj)
                        .then(resolve, reject);
                }
            }

            resolve(obj);
        });
    }

    handleExample (dirname, obj, example) {
        return this
            .readDir(obj.loc)
            .then((entries) => {
                const promises = entries
                    .filter(name => !entryFilterRe.test(name))
                    .map(this.handleExampleEntry.bind(this, example || obj, obj));

                return Promise.all(promises);
            })
            .then(() => obj);
    }

    handleExampleEntry (example, obj, name) {
        return new Promise((resolve, reject) => {
            const loc = path.join(obj.loc, name);

            fs.stat(loc, (error, stat) => {
                if (error) {
                    reject(error);
                } else if (stat.isDirectory()) {
                    const children = obj.children || (obj.children = {});
                    const entry    = children[ name ];

                    this
                        .handleExample(name, entry, example)
                        .then(resolve, reject);
                } else if (stat.isFile()) {
                    this
                        .readFile(loc, name)
                        .then(info => {
                            const children = obj.children || (obj.children = {});
                            const relative = path.relative(example.loc, loc);

                            children[ name ] = {
                                isAsset : info.isAsset,
                                loc,
                                relative,
                                source  : info.source,
                                type    : info.type
                            };
                        })
                        .then(resolve, reject);
                } else {
                    resolve();
                }
            });
        });
    }

    readDir (loc) {
        return new Promise((resolve, reject) => {
            fs.readdir(loc, (error, entries) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(entries);
                }
            });
        });
    }

    readFile (loc, name) {
        return new Promise((resolve, reject) => {
            fs.readFile(loc, 'utf8', (error, source) => {
                if (error) {
                    reject(error);
                } else {
                    const type    = path.extname(name).substr(1);
                    const isAsset = assetExtRe.test(type);

                    resolve({
                        isAsset,
                        loc,
                        name,
                        source,
                        type
                    });
                }
            });
        });
    }

    getFramework (toolkit, theme, obj) {
        const databaseName = this.getDatabase();

        const {
            runner : {
                info : {
                    app  : {
                        database
                    },
                    args : {
                        version
                    }
                }
            }
        } = this;

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
            toolkit,
            theme,
            version
        ];

        return database
            .query(sqls, inserts)
            .then(results => {
                [
                    ,
                    [ obj.framework ],
                    obj.packages
                ] = results;

                return obj;
            });
    }
}

module.exports = BuildGroups;
