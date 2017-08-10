const { Client } = require('ssh2');

const {
    transfer : { Base },
    util     : { Logger }
} = require('../');

class SSH extends Base {
    createConnection () {
        return new Promise((resolve, reject) => {
            const conn       = new Client();
            const { config } = this;

            conn
                .on('ready', () => {
                    resolve(conn);
                })
                .on('error', error => {
                    reject(error);
                })
                .connect({
                    host       : config.server,
                    port       : 22,
                    privateKey : config.key,
                    username   : config.user
                });
        });
    }

    execCommand (cmd) {
        return this
            .createConnection()
            .then(conn => new Promise((resolve, reject) => {
                Logger.debug('Executing SSH Commands:', cmd);

                conn.exec(cmd, (error, stream) => {
                    if (error) {
                        reject(error);
                    } else {
                        stream
                            .on('close', () => {
                                resolve();

                                conn.end();
                            })
                            .on('data', data => {
                                if (Buffer.isBuffer(data)) {
                                    data = data.toString('utf8');
                                }

                                Logger.debug(data);
                            })
                            .stderr
                            .on('data', data => {
                                if (Buffer.isBuffer(data)) {
                                    data = data.toString('utf8');
                                }

                                Logger.debug(data);

                                reject();
                            });
                    }
                });
            }));
    }
}

module.exports = SSH;
