const { util : { Logger } } = require('../');

class Base {
    constructor (config) {
        if (config) {
            this.config = config;
        }
    }

    logInfo (info) {
        const {
            product,
            args : {
                license,
                name,
                path,
                platform,
                version
            }
        } = info;

        Logger.info('Deploying file:', path);

        Logger.info(
            'Deploying product:',
            name || product.name,
            name ? undefined : version,
            platform,
            license
        );

        return info;
    }

    mergeModuleConfig (mod, info) {
        const { config } = this;

        info.moduleCfg = Object.assign(
            {},
            config.modules[mod]
        );
    }
}

module.exports = Base;
