const { Base } = require('@extjs/sencha-core');

/**
 * @class Sencha.rest.Endpoint
 * @extends Sencha.core.Base
 */
class Endpoint extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isRestEndpoint
                 */
                isRestEndpoint : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {String/Base} cls The class (path or definition) that
                     * will handle this endpoint.
                     */

                    /**
                     * @cfg {String/RegExp} matcher The string or RegExp that will
                     * determine if this endpoint recognizes the url being hit.
                     */

                    /**
                     * @cfg {String} [method=handle] The method to execute on the {@link #cls}
                     * when this endpoint recognizes the URL.
                     */
                    method : 'handle'
                }
            }
        };
    }

    get cls () {
        return this._cls;
    }

    set cls (cls) {
        if (typeof cls === 'string') {
            cls = require(cls); // eslint-disable-line global-require
        }

        this._cls = cls;
    }

    get matcher () {
        return this._matcher;
    }

    set matcher (matcher) {
        if (typeof matcher === 'string') {
            matcher = new RegExp(`^${matcher}$`, 'i');
        }

        this._matcher = matcher;
    }

    recognize (url) {
        return this.matcher.test(url);
    }

    dispatch (req, res) {
        return new Promise((resolve, reject) => {
            const { cls : Cls } = this;

            if (Cls) {
                const { method } = this;

                if (Cls.prototype[ method ]) {
                    const instance = new Cls({
                        req,
                        res
                    });

                    instance[ method ]()
                        .then(resolve, reject);
                } else {
                    reject(new Error(`The method '${method}' is not a member of the cls`));
                }
            } else {
                reject(new Error('The cls config is not set!'));
            }
        });
    }
}

module.exports = Endpoint;
