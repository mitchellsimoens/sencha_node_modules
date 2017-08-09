const {
    error : { FatalError },
    util  : { Logger }
} = require('../../');

const Fs    = require('fs');
const JSON5 = require('json5');
const Path  = require('path');

class GetPackage {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const { info }            = runner;
            const { args : { path } } = info;
            const pkgPath             = Path.join(path, 'package.json');

            Logger.info('Retreiving package.json from SDK repo...');

            Fs.stat(pkgPath, error => {
                if (error) {
                    reject(new FatalError(error));
                } else {
                    Fs.readFile(pkgPath, 'utf8', (error, code) => {
                        if (error) {
                            reject(new FatalError(error));
                        } else {
                            Logger.info('Retrieved package.json from SDK repo.');

                            info['package.json'] = JSON5.parse(code);

                            resolve();
                        }
                    });
                }
            });
        });
    }
}

module.exports = GetPackage;
