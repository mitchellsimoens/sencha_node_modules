const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.error.mysql.operation.Env.get
 * @extends Sencha.core.Base
 *
 * A class to manage all SAVE operations for an error's environment.
 */
class EnvSave extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isEnvSaver
                 */
                isEnvSaver : true
            }
        };
    }

    save (Error, batch) {
        return new Promise((resolve, reject) => {
            const query   = new Query({
                inserts : [ this.$parse(Error) ],
                sqls    : `INSERT INTO app_error_env SET errorid = @error_id, ?;`
            });

            batch.add(query);

            query.then(resolve).catch(reject);
        });
    }

    $parse (Error) {
        const {
            browser,
            platform,
            ua,
            browser : {
                orientation,
                meta : BrowserMeta
            }
        } = Error;

        return {
            Browser                : browser.name,
            'Browser-Height'       : BrowserMeta[ 'Browser-Height' ],
            'Browser-MajorVersion' : browser.version.split('.').shift(),
            'Browser-Name'         : `${browser.name} ${browser.version}`,
            'Browser-Version'      : browser.version,
            'Browser-Width'        : BrowserMeta[ 'Browser-Width' ],
            Platform               : platform.platform,
            UtcOffset              : BrowserMeta.UtcOffset,
            availHeight            : BrowserMeta.availHeight,
            availLeft              : BrowserMeta.availLeft,
            availTop               : BrowserMeta.availTop,
            availWidth             : BrowserMeta.availWidth,
            colorDepth             : BrowserMeta.colorDepth,
            height                 : BrowserMeta.height,
            orientation_angle      : orientation.angle, // eslint-disable-line camelcase
            orientation_type       : orientation.type, // eslint-disable-line camelcase
            os                     : platform.os,
            pixelDepth             : BrowserMeta.pixelDepth,
            ua,
            width                  : BrowserMeta.width
        };
    }
}

module.exports = EnvSave;
