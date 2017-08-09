const HashFiles = require('hash-files');

class HashFile {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const { info } = runner;
            const file     = info.file || (info.file = {});

            Promise
                .all([
                    this.hash(info.args.path, 'md5'),
                    this.hash(info.args.path)
                ])
                .then(hashes => {
                    [ file.md5, file.sha1 ] = hashes;
                })
                .then(resolve)
                .catch(reject);
        });
    }

    hash (path, algorithm = 'sha1') {
        return new Promise((resolve, reject) => {
            HashFiles(
                {
                    algorithm : algorithm,
                    files     : [ path ],
                    noGlob    : true
                },
                (error, hash) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(hash);
                    }
                }
            );
        });
    }
}

module.exports = HashFile;
