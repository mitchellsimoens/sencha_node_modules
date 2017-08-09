const {
    error : { FatalError },
    util  : { Logger }
} = require('../../');

const Fs    = require('fs');
const JSON5 = require('json5');
const path  = require('path');

class GetPackage {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const { info }            = runner;
            const { args : { sdk } } = info;
            const pkgPath             = path.join(sdk, 'fiddle.json');

            Logger.info('Retreiving fiddle.json from SDK repo...');

            Fs.stat(pkgPath, error => {
                if (error) {
                    reject(new FatalError(error));
                } else {
                    Fs.readFile(pkgPath, 'utf8', (error, code) => {
                        if (error) {
                            reject(new FatalError(error));
                        } else {
                            Logger.info('Retrieved fiddle.json from SDK repo.');

                            info[ 'fiddle.json' ] = JSON5.parse(code);

                            resolve();
                        }
                    });
                }
            });
        });
    }
}

module.exports = GetPackage;
