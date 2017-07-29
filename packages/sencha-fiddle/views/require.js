/* eslint-disable */
(function () {
    var path = {
        // Resolves . and .. elements in a path with directory names
        normalizeStringPosix: function (path, allowAboveRoot) {
            var res       = '',
                lastSlash = -1,
                dots      = 0,
                i         = 0,
                code, start, j;

            for (; i <= path.length; ++i) {
                if (i < path.length) {
                    code = path.charCodeAt(i);
                } else if (code === 47) {
                    break;
                } else {
                    code = 47;
                }

                if (code === 47) {
                    if (lastSlash === i - 1 || dots === 1) {
                        // NOOP
                    } else if (lastSlash !== i - 1 && dots === 2) {
                        if (
                            res.length < 2 ||
                            res.charCodeAt(res.length - 1) !== 46 ||
                            res.charCodeAt(res.length - 2) !== 46
                        ) {
                            if (res.length > 2) {
                                start = res.length - 1;
                                j     = start;

                                for (; j >= 0; --j) {
                                    if (res.charCodeAt(j) === 47) {
                                        break;
                                    }
                                }

                                if (j !== start) {
                                    if (j === -1) {
                                        res = '';
                                    } else {
                                        res = res.slice(0, j);
                                    }

                                    lastSlash = i;
                                    dots      = 0;

                                    continue;
                                }
                            } else if (res.length === 2 || res.length === 1) {
                                res       = '';
                                lastSlash = i;
                                dots      = 0;

                                continue;
                            }
                        }

                        if (allowAboveRoot) {
                            if (res.length > 0) {
                                res += '/..';
                            } else {
                                res = '..';
                            }
                        }
                    } else {
                        if (res.length > 0) {
                            res += '/' + path.slice(lastSlash + 1, i);
                        } else {
                            res = path.slice(lastSlash + 1, i);
                        }
                    }

                    lastSlash = i;
                    dots      = 0;
                } else if (code === 46 && dots !== -1) {
                    ++dots;
                } else {
                    dots = -1;
                }
            }

            return res;
        },

        dirname: function (path) {
            if (path.length === 0) {
                return '.';
            }

            var code         = path.charCodeAt(0),
                hasRoot      = (code === 47),
                end          = -1,
                matchedSlash = true,
                i            = path.length - 1;

            for (; i >= 1; --i) {
                code = path.charCodeAt(i);

                if (code === 47) {
                    if (!matchedSlash) {
                        end = i;

                        break;
                    }
                } else {
                    // We saw the first non-path separator
                    matchedSlash = false;
                }
            }

            if (end === -1) {
                return hasRoot ? '/' : '.';
            }

            if (hasRoot && end === 1) {
                return '//';
            }

            return path.slice(0, end);
        },

        resolve: function () {
            var resolvedPath     = '',
                resolvedAbsolute = false,
                i                = arguments.length - 1,
                path;

            for (; i >= -1 && !resolvedAbsolute; i--) {
                if (i >= 0) {
                    path = arguments[i];
                }

                // Skip empty entries
                if (path.length === 0) {
                    continue;
                }

                resolvedPath     = path + '/' + resolvedPath;
                resolvedAbsolute = path.charCodeAt(0) === 47;
            }

            // Normalize the path
            resolvedPath = this.normalizeStringPosix(resolvedPath, !resolvedAbsolute);

            if (resolvedAbsolute) {
                if (resolvedPath.length > 0) {
                    return '/' + resolvedPath;
                } else {
                    return '/';
                }
            } else if (resolvedPath.length > 0) {
                return resolvedPath;
            } else {
                return '.';
            }
        }
    };

    /**
    * This method does what it says, passes the raw source code
    * to Babel. It currently only uses the es2015, stage2 and react
    * presets.
    *
    * @param {String} code The raw source code of the file.
    * @return {String} The transformed source, this should be ES5 compliant code.
    */
    function babelTransform (code) {
        if (window.Babel) {
            var plugins = [],
                plugin  = require('@extjs/reactor-babel-plugin');

            if (plugin) {
                plugins.push(plugin);
            }

            code = Babel.transform(code, {
                plugins : plugins,
                presets: [
                    'es2015',
                    'stage-0',
                    'react'
                ]
            }).code;
        }

        return code;
    }

    /**
    * This function fakes the define() function that node surrounds all files
    * automatically for you. This will also trigger the babel transformation
    * and will then return the exports property.
    *
    * @param {String} code The raw source code of the file.
    * @param {String} filename The path of this file.
    * @return {*} Whatever was set as the \`module.exports\` in the file's source.
    */
    function doDefine (code, filename) {
        var mod     = {
                exports: {}
            },
            fn      = new Function('exports, require, module, __filename, __dirname', babelTransform(code)),
            dirname = path.dirname(filename);

        fn(mod.exports, makeRequire(filename, dirname), mod, filename, dirname);

        return mod.exports;
    }

    /**
     * Creates a require function that can track what file the
     * require function will be called in so paths being required
     * can resolve as a relative path from the file the function
     * is being called from.
     *
     * @param {String} filename The path to the file.
     * @param {String} dirname The parent directory of the file.
     * If this is missing, it will be resolved from the filename.
     * @return {Function}
     */
    function makeRequire (filename, dirname) {
        function require (mod) {
            var codes      = window.require.codes,
                reactorLib = window.Sencha && window.Sencha.reactor,
                code, resolved;

            if (reactorLib && reactorLib[mod]) {
                return reactorLib[mod];
            } else if (mod === '@extjs/reactor') {
                return reactorLib && reactorLib.reactor;
            } else {
                resolved = path.resolve(dirname, mod);
                code     = checkCodes(resolved);

                if (code == null) {
                    console.error('Could not find', '"' + mod + '"');
                } else {
                    if (typeof code === 'string') {
                        code = doDefine(code, resolved);

                        codes[mod] = {
                            code: code,
                            resolved: resolved
                        };
                    } else {
                        code = code.code;
                    }

                    return code;
                }
            }
        }

        if (!dirname) {
            dirname = path.dirname(filename);
        }

        require.path    = filename;
        require.dirname = dirname;

        return require;
    }

    /**
    * This function attempts to resolve what is being required
    * to a file on the codes object. We may also need to add
    * the file extension too along with properly traversing
    * the fake filesystem (handling '..' and '.').
    *
    * @param {String} path The dependency that is being required. This
    * will be what was in the require() call (or the import statement).
    * @return {String} The raw source code.
    */
    function checkCodes (path) {
        var codes = window.require.codes,
            code  = codes[path];

        if (code == null && path.substr(-3) !== '.js') {
            code = codes[path + '.js'];
        }

        return code;
    }

    window.require = makeRequire('/');
})();
