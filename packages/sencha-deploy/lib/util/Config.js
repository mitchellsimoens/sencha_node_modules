const { Logger } = require('./');
const deepmerge  = require('deepmerge');
const fs         = require('fs');
const JSON5      = require('json5');
const path       = require('path');

class Config {
    load (config) {
        try {
            let _config;

            if (config) {
                if (typeof config === 'object') {
                    if (config.config) {
                        _config = config = JSON5.parse(config.config);
                    } else if (config.path) {
                        _config = config = JSON5.parse(
                            fs.readFileSync(config.path, 'utf8')
                        );
                    } else {
                        _config = config;
                    }
                } else {
                    _config = JSON5.parse(
                        fs.readFileSync(config, 'utf8')
                    );
                }
            }

            if (!_config) {
                _config = JSON5.parse(
                    fs.readFileSync(
                        path.resolve(__dirname, '../../config.json'),
                        'utf8'
                    )
                );
            }

            return this.config = deepmerge.all([
                {},
                _config.defaults,
                _config[process.env.NODE_ENV || 'development']
            ]);
        } catch (error) {
            // Try to output a error with not fully initialized logger
            Logger.error('Unable to read config:', error);

            process.exit(1);
        }
    }

    get (key) {
        const { config } = this;

        if (key) {
            //TODO recursify
            return config[key];
        } else {
            return config;
        }
    }
}

module.exports = new Config();
