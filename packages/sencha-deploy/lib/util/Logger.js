const fs     = require('fs');
const mkdirp = require('mkdirp');
const path   = require('path');

const _levels = {
    ALL   : 0,
    DEBUG : 1,
    INFO  : 2,
    WARN  : 3,
    ERROR : 4, // eslint-disable-line sort-keys
    FATAL : 5,
    OFF   : 6
};

class Logger {
    static init (level = 'INFO') {
        this.$log = [];

        return new Promise((resolve) => {
            this.level = _levels[ level.toUpperCase() ] || 0;

            resolve();
        });
    }

    static get level () {
        return this._level || 0;
    }

    static set level (level) {
        if (!level) {
            level = 0;
        }

        this._level = level;
    }

    static indent (num) {
        let level = (this.indentLevel || 0) + num;

        if (level < 0) {
            level = 0;
        }

        this.indentLevel = level;
    }

    static buildConvenient () {
        for (const level in _levels) {
            this[ level.toLowerCase() ] = (...args) => {
                args.unshift(level);

                this.log(...args);
            };
        }
    }

    static log (level, ...args) {
        const indention = new Array(this.indentLevel || 0)
            .fill(' ')
            .join('');

        const parsed = args
            .map(arg => {
                if (arg instanceof Error) {
                    return arg.message;
                } else if (arg && arg.toString) {
                    return arg.toString();
                } else {
                    return arg;
                }
            })
            .join(' ');

        const message = {
            level     : _levels[ level ],
            levelStr  : level,
            message   : `${indention}${parsed}`,
            timestamp : new Date()
        };

        this.$log.push(message);

        if (_levels[ level ] >= this.level) {
            this.doOutput(
                this.formatMessage(false, message)
            );
        }
    }

    static formatMessage (showTime, message) {
        let timestamp = showTime ? message.timestamp : '';

        if (showTime) {
            if (timestamp instanceof Date) {
                timestamp = `[${timestamp.toISOString()}] `;
            } else {
                timestamp = `[${timestamp}] `;
            }
        }

        // give a constant starting column for the message for different levelStr lengths
        const padding = new Array(6 - message.levelStr.length)
            .fill(' ')
            .join('');

        return `${timestamp}${message.levelStr}:${padding}${message.message}`;
    }

    static doOutput (message) {
        if (typeof message === 'object') {
            message = this.formatMessage(false, message);
        }

        this.output(message);
    }

    static get output () {
        return this._output;
    }

    static set output (output) {
        this._output = output;
    }

    static toFile (file, level = 0) {
        const dir = path.dirname(file);

        mkdirp.sync(dir);

        this.debug('Writing log file to', file);

        const log = this.$log
            .filter(message => message.level >= level)
            .map(this.formatMessage.bind(this, true))
            .join('\n');

        fs.writeFileSync(file, log);
    }
}

Logger.buildConvenient();

Logger.output = console.log;

module.exports = Logger;
