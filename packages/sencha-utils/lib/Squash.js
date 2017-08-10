const fs   = require('fs');
const path = require('path');

module.exports = {
    alphabetizeObject (obj) {
        const parsed = {};

        const keys = Object.keys(obj).sort();

        keys.forEach(key => parsed[ key ] = obj[ key ]);

        return parsed;
    },

    /**
     * @private
     * Create an object mapping of uniquely named directories.
     *
     * @param {Array[]} dirs
     * The directories per version to create a map. This is an array
     * of arrays since this will look through an array of child directories
     * for an array of versions.
     *
     * @return {Object} The key will be the directory base name with it's
     * value being the full path to the directory.
     */
    createDirMap (base, dirs) {
        const map  = {};

        dirs.forEach(dirs => {
            dirs.forEach(dir => {
                const { basename, loc } = dir;

                if (!map[ basename ]) {
                    const relative = path.relative(base, loc);

                    map[ basename ] = {
                        loc,
                        name : basename,
                        relative
                    };
                }
            });
        });

        return this.alphabetizeObject(map);
    },

    /**
     * @private
     * Filters out directories that have a newer version than the one
     * passed in. If a version is not provided, the directories will not
     * be filtered and all directories will be returned.
     *
     * **Note** This will create a new array of directories than the one
     * that is passed in.
     *
     * @param {String} [version]
     * The optional version to filter newer versions out.
     *
     * @param {String[]} dirs
     * The directories to filter with.
     *
     * @return {String[]}
     */
    filterVersion (version, dirs) {
        if (version && dirs.length > 1) {
            version = version
                .split('.')
                // turn each number into a real number
                .map(num => parseInt(num, 10));

            return dirs
                .map(dir => dir
                    .split('.')
                    // turn each dir's number into a real number
                    .map(num => parseInt(num, 10))
                )
                // filter out all versions over the version
                .filter(dir => dir.every((dir, idx) => dir <= version[ idx ]))
                .map(dir => dir.join('.'));
        } else {
            return dirs;
        }
    },

    /**
     * @private
     * Get the child directories of a path. **Note** This will only
     * return DIRECTORIES, this will ignore files.
     *
     * The promise will reject if the directory cannot be read and will
     * resolve with an array of objects with each directory's base name
     * and full path.
     *
     * @param {String} dir The path to get child directories from.
     * @param {Boolean} [safe=false]
     * `true` to ignore errors (for child directory searching).
     * @param {Promise}
     */
    getDirs (dir, safe = false) {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (error, entries) => {
                if (error) {
                    if (safe) {
                        resolve([]);
                    } else {
                        reject(error);
                    }
                } else if (entries.length) {
                    Promise
                        .all(
                            entries.map(entry => this.stat(path.join(dir, entry)))
                        )
                        .then(stats => {
                            const dirs = [];

                            stats.forEach(obj => {
                                if (obj.stat.isDirectory()) {
                                    const { loc } = obj;

                                    dirs.push({
                                        basename : path.basename(loc),
                                        loc
                                    });
                                }
                            });

                            return dirs;
                        })
                        .then(resolve)
                        .catch(reject);
                } else {
                    resolve([]);
                }
            });
        });
    },

    getPath (base, version, loc) {
        const relative = path.relative(base, path.join(base, loc));

        return this
            // get versions first
            .getDirs(base)
            // sort versions in DESC
            .then(this.sortVersions.bind(this))
            // filter out any newer versions is version is passed
            .then(this.filterVersion.bind(this, version))
            .then(versions => Promise
                .all(versions
                    .map(version => relative ? this.stat(path.join(base, version, relative), true) : this.stat(path.join(base, version), true))
                )
            )
            .then(stats => stats.find(obj => !!obj))
            .then(obj => obj && obj.loc);
    },

    /**
     * @private
     * Sorts an array of versions.
     *
     * @param {String[]} versions
     * The array of versions to sort. An example would be:
     *
     *     [ '5.2.1', '5.1.0', '5.2.0' ]
     *
     * @return {String[]} The versions sorted descending:
     *
     *     [ '5.2.1', '5.2.0', '5.1.0' ]
     */
    sortVersions (versions) {
        if (versions.length === 1) {
            return versions.map(dir => dir.basename);
        } else if (versions.length > 1) {
            return versions
                .map(dir => dir.basename
                    .split('.')
                    .map(n => +n + 100000)
                    .join('.')
                )
                .sort()
                .reverse()
                .map(dir => dir
                    .split('.')
                    .map(n => +n - 100000)
                    .join('.')
                );
        } else {
            return versions;
        }
    },

    /**
     * Squash the directory to get unique child directories
     * where newer versions may override the older versions
     * if conflicts occur.
     *
     * @param {String} base
     * The base directory location where the version directories reside.
     *
     * @param {String} [version]
     * Optionally limit the search to a version and older. Matches `<=`.
     *
     * @param {String} [loc]
     * Optional child path of the filtered versions to retrieve the unique
     * directories. The search would then be `<base>/<version>/<loc>`.
     *
     * @return {Promise} An object with the directories names as the key
     * equal to the full path of the directory. E.g.:
     *
     *     {
     *         foo : '/path/to/foo'
     *     }
     */
    squash ({ base, deep, loc, version }) {
        let promise = this
            // get versions first
            .getDirs(base)
            // sort versions in DESC
            .then(this.sortVersions.bind(this))
            // filter out any newer versions is version is passed
            .then(this.filterVersion.bind(this, version))
            // get child directories of the filtered versions
            .then(versions => Promise
                .all(versions
                    .map(version => loc ? this.getDirs(path.join(base, version, loc), true) : this.getDirs(path.join(base, version), true))
                ))
            // create a map of directory name : directory path
            .then(this.createDirMap.bind(this, base));

        if (deep) {
            promise = promise
                .then((map) => {
                    const promises = [];
                    const objs     = [];

                    for (const dirname in map) {
                        const obj          = map[ dirname ];
                        const { relative } = obj;

                        let loc = relative.split('/');

                        loc.shift();

                        loc = loc.join('/');

                        objs.push(obj);

                        promises.push(
                            this.squash({
                                base,
                                deep,
                                loc,
                                version
                            })
                        );
                    }

                    return Promise
                        .all(promises)
                        .then(results => {
                            results.forEach((childMap, index) => {
                                const obj = objs[ index ];

                                if (Object.values(childMap).length) {
                                    if (obj.children) {
                                        Object.assign(obj.children, childMap);
                                    } else {
                                        obj.children = childMap;
                                    }
                                }
                            });

                            return map;
                        });
                });
        }

        return promise;
    },

    /**
     * @private
     * Get the stats for the location. The promise will reject
     * if any error is throw or resolve with an Object with
     * `loc` (the `loc` param) and `stat` object.
     *
     * @param {String} loc The location to get the stats for.
     * @param {Boolean} [safe=false]
     * Whether to swallow an error say when it's ok if the file
     * does not exist.
     *
     * @return {Promise}
     */
    stat (loc, safe = false) {
        return new Promise((resolve, reject) => {
            fs.stat(loc, (error, stat) => {
                if (error) {
                    if (safe) {
                        resolve();
                    } else {
                        reject(error);
                    }
                } else {
                    resolve({
                        loc,
                        stat
                    });
                }
            });
        });
    }
};
