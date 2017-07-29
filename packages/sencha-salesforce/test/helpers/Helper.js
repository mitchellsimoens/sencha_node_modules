module.exports = (scope, modules) => {
    if (!Array.isArray(modules)) {
        modules = [ modules ];
    }

    modules = modules.map(mod => typeof mod === 'string' ? require(mod) : mod);

    modules.forEach(mod => {
        if (mod) {
            for (const key in mod) {
                if (scope[ key ]) {
                    console.log(`${key} already in scope`);
                } else {
                    scope[ key ] = mod[ key ];
                }
            }
        }
    });
};
