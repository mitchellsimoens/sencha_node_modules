const { Config } = require('@extjs/sencha-core');
const fs         = require('fs');
const path       = require('path');

const appWrapperRe = /(Ext\.onReady\(|Ext\.application\(|Ext.setup\()/;

class Base {
    /**
     * @param {Request} req The expressjs request object.
     * @param {Response} res The expressjs response object.
     */
    constructor ({ req, res }) {
        this.req = req;
        this.res = res;
    }

    /**
     * Load a file. Returns a promise that will resolve
     * with the **raw** source or reject if any error occurred.
     *
     * @param {String} filePath The path to the file.
     * @return {Promise}
     */
    loadFile (filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (error, code) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(code);
                }
            });
        });
    }

    getBase () {
        return '';
    }

    getToolkit () {
        const { req : { query } } = this;

        return query.toolkit || 'modern';
    }

    /**
     * Gets the toolkit's framework JavaScript file.
     *
     * @param {String} toolkit The toolkit this example is running with.
     * @return {String} The JavaScript file associated with the toolkit.
     */
    getToolkitFramework (toolkit) {
        const {
            toolkits : {
                [ toolkit ] : framework
            }
        } = Config.get('extjs');

        return framework.ext;
    }

    getThemeName (toolkit) {
        const { req : { query } } = this;

        if (query.theme) {
            return query.theme;
        }

        const {
            toolkits : {
                [ toolkit ] : {
                    themes
                }
            }
        } = Config.get('extjs');

        for (const name in themes) {
            const obj = themes[ name ];

            if (obj.default) {
                return name;
            }
        }
    }

    /**
     * Determines what theme to use based upon either the default
     * theme defined in `package.json` or if a theme name is found
     * in the query string.
     *
     * @param {String} toolkit The toolkit this example is running with.
     * @return {Object} The theme object descriptor from `package.json`.
     */
    getToolkitTheme (toolkit, theme) {
        const {
            toolkits : {
                [ toolkit ] : {
                    themes
                }
            }
        } = Config.get('extjs');

        return themes[ theme ];
    }

    /**
     * Retrieves the default defined theme from `package.json`.
     *
     * @param {String} toolkit The toolkit this exampel is running with.
     * @return {Object} The theme object descriptor from `package.json`.
     */
    getDefaultTheme (toolkit) {
        const {
            toolkits : {
                [ toolkit ] : {
                    themes
                }
            }
        } = Config.get('extjs');

        for (const name in themes) {
            const obj = themes[ name ];

            if (obj.default) {
                return obj;
            }
        }
    }

    getPackageAssets (examplePackages, toolkit, theme) {
        if (Array.isArray(examplePackages)) {
            const { packages } = Config.get('extjs');

            return examplePackages.map(examplePkg => {
                const pkg = packages[ examplePkg ];

                if (pkg) {
                    const { css, build } = pkg;

                    if (css) {
                        const themes = css[ toolkit ];

                        return {
                            css : path.join(build, toolkit, themes[ theme ])
                        };
                    }
                }

                return examplePkg;
            });
        }
    }

    hasReactor (example) {
        const { fiddle : { packages } } = example;

        return packages && packages.includes('reactor');
    }

    /**
     * Builds the `app.js` by detecting if it needs to be wrapped with `Ext.onReady`
     * based on searching the source for `Ext.onReady` or `Ext.application`.
     *
     * This will also call {@link #buildRequires} to add in the `Ext.require` call
     * before the code from `app.js`.
     *
     * @param {String} code The raw source from `app.js`.
     * @param {Object} example The parsed source from `package.json`.
     * @return {String}
     */
    buildAppJs (code, example) {
        if (example && this.hasReactor(example)) {
            code = `Ext.onReady(function () {
                Sencha.reactor();

                require('app.js');
            });`;
        } else if (code && !appWrapperRe.test(code)) {
            code = `Ext.onReady(function () {

${code}

});`;
        }

        return this.buildRequires(code, example);
    }

    /**
     * Parses the required classes from the `package.json` if any. Will
     * automatically require `Ext.app.Util` which will provide the `setupPaths`
     * method that `Ext.application` executes.
     *
     * @param {String} code The raw source from `app.js` that is already
     * auto-wrapped if needed.
     * @param {Object} example The parsed source from `package.json`.
     * @return {String}
     */
    buildRequires (code, example) {
        let requires;

        if (example) {
            const {
                fiddle : {
                    'local-dev' : localDev
                }
            } = example;

            requires = localDev && localDev.requires;
        }

        const defaultRequires = Config.get('extjs.defaultRequires');

        if (example) {
            example = example.fiddle;
        }

        if (defaultRequires) {
            if (example) {
                example.requires = defaultRequires.slice();
            } else {
                example = {
                    requires : defaultRequires.slice()
                };
            }
        }

        if (requires) {
            if (example.requires) {
                example.requires.push(...requires);
            } else {
                example.requires = requires;
            }
        }

        if (Array.isArray(example.requires) && example.requires.length) {
            const requires = example.requires.map((required, index, arr) => `    '${required}'${arr.length - 1 === index ? '' : ','}`);

            return `Ext.require([
${requires.join('\n')}
], function () {
${code}
});`;
        } else {
            return code;
        }
    }

    prepareForIndex (lookup, entries, example, body) {
        if (entries.includes('index.html') && body == null) {
            return this
                .loadFile(path.join(lookup, 'index.html'))
                .then(this.prepareForIndex.bind(this, lookup, entries, example));
        }

        if (!entries) {
            entries = [].concat(example.assets, example.mockdata);
        }

        const {
            fiddle : {
                'local-dev' : localDev,
                packages    : pkgs,
                title
            }
        } = example;

        const files     = localDev && localDev.files;
        const base      = this.getBase();
        const toolkit   = this.getToolkit(lookup);
        const framework = this.getToolkitFramework(toolkit);
        const themeName = this.getThemeName(toolkit);
        const theme     = this.getToolkitTheme(toolkit, themeName);
        const packages  = this.getPackageAssets(pkgs, toolkit, themeName);

        return {
            base,
            body,
            files,
            framework,
            packages,
            theme,
            title,
            toolkit
        };
    }

    endSlashify (path) {
        return path.substr(-1) === '/' ? path : `${path}/`;
    }
}

module.exports = Base;
