module.exports = function (scope) {
    return (prefix, modules) => {
        const location = prefix ? scope[ prefix ] || (scope[ prefix ] = {}) : scope;

        if (!Array.isArray(modules)) {
            modules = [ modules ];
        }

        modules = modules.map(mod => typeof mod === 'string' ? require(mod) : mod); // eslint-disable-line global-require

        modules.forEach(mod => {
            if (mod) {
                for (const key in mod) {
                    if (location[ key ]) {
                        console.log(`${key} already present using prefix "${prefix}"`);
                    } else {
                        location[ key ] = mod[ key ];
                    }
                }
            }
        });
    };
};
