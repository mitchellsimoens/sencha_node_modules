const { Base, Config } = require('@extjs/sencha-core');

/**
 * @class Sencha.direct.route.Mixin
 * @protected
 *
 * A mixin to add to the different server routes in
 * the Sencha.direct.route.* namespace.
 */
class Mixin extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @property {Boolean} isDirectRoute
                 */
                isDirectRoute : true
            }
        };
    }

    /**
     * @param {Object} params The parameters that describe
     * the Ext.Direct router call. This is due to Ext JS
     * sending different parameter names for a form submission
     * and an xhr request.
     * @return {Object} The normalized params.
     */
    getInfo (params) {
        let isUpload = params.extUpload;

        if (isUpload) {
            isUpload = isUpload !== 'false';
        }

        if (isUpload || params.extAction) {
            return {
                action : params.extAction,
                data   : params,
                isForm : true,
                isUpload,
                method : params.extMethod,
                tid    : parseInt(params.extTID),
                type   : params.extType
            };
        } else {
            let { data } = params;

            if (typeof data === 'string') {
                const temp = JSON.parse(data);

                data = temp;
            }

            return {
                action : params.action,
                data,
                method : params.method,
                tid    : parseInt(params.tid),
                type   : params.type
            };
        }
    }

    /**
     * @param {Object} info The info object from the {@link #getInfo}
     * call.
     * @param {Function} fn The promise's `resolve` or `reject` method
     * that will get executed when the Manager has resolved or rejected
     * the router handler.
     */
    createResolver (info, fn) {
        return data => {
            const ret = Object.assign({}, info);

            if (data instanceof Error) {
                const error = data;

                data = {
                    msg     : data.message,
                    success : false
                };

                if (!Config.isProduction) {
                    data.stack = error.stack.split(/\n/);
                }
            }

            ret.data = data;

            fn(ret);
        };
    }
}

module.exports = Mixin;
