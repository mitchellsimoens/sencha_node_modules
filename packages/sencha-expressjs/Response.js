const { Base } = require('@extjs/sencha-core');

/**
 * @class Sencha.express.Response
 * @extends Sencha.core.Base
 *
 * A class to manage responses back to the client. This will automatically
 * handle errors and other things like headers.
 */
class Response extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isExpressResponse
                 */
                isExpressResponse : true,

                /**
                 * @property {RegExp} [stackReSplitter=/\n\r?/] The RegExp to split an
                 * error stack into an array.
                 * @private
                 */
                stackReSplitter : /\n\r?/,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {Mixed} data The data to send to the client on a successful
                     * response.
                     *
                     * If this is a string, will be assumed is a view using the view engine
                     * on the express server.
                     *
                     * If an Array or Object, the response will be sent back as JSON.
                     *
                     * If a Buffer, the Buffer will be piped back to the response.
                     */
                    data : null,

                    /**
                     * @cfg {String/Error} error Preferably an Error class but can be a string.
                     * This will create an object with `success` set to `false` and the error
                     * message on the {@link #msgProperty}.
                     */
                    error : null,

                    /**
                     * @cfg {Object} extra An extra object to control what headers to send back
                     * among other things.
                     */
                    extra : null,

                    /**
                     * @cfg {String} [msgProperty=msg] The key on the error reponse to set the
                     * {@link #error} onto.
                     */
                    msgProperty : 'msg',

                    /**
                     * @cfg {String} [stackProperty=stack] The key on the error response to return
                     * the error stack.
                     */
                    stackProperty : 'stack'
                }
            }
        };
    }

    /**
     * @param {Object} res The raw response object from the express server.
     *
     * If {@link #error} is set, this will call the {@link #outputError} method. Else
     * it will call the {@link #outputSuccess} method.
     */
    output (res) {
        if (this.error) {
            this.outputError(res);
        } else {
            this.outputSuccess(res);
        }
    }

    /**
     * @param {Object} res The raw response object form the express server.
     *
     * This will send back a JSON object.
     *
     * Example response:
     *
     *     {
     *         "msg": "Something went wrong!",
     *         "success": false
     *     }
     */
    outputError (res) {
        let   { error }       = this;
        const { msgProperty } = this;
        const ret             = {
            success : false
        };

        if (typeof error === 'string') {
            error = new Error(error);
        }

        if (error instanceof Error) {
            ret[ msgProperty ] = error.message;

            if (error.stack) {
                ret[ this.stackProperty ] = error.stack.split(this.stackReSplitter);
            }
        } else if (error[ msgProperty ]) {
            ret[ msgProperty ] = error[ msgProperty ];
        } else {
            Object.assign(ret, error);
        }

        res.json(ret);
    }

    /**
     * @param {Object} res The raw response object form the express server.
     */
    outputSuccess (res) {
        const { data, extra } = this;
        const isBuffer        = Buffer.isBuffer(data);
        let   isPlain;

        if (extra) {
            const { cookies, headers } = extra;
            let   { status }           = extra;

            if (cookies) {
                for (const name in cookies) {
                    const cookie = cookies[ name ];

                    if (cookie) {
                        let expires, value;

                        if (typeof cookie === 'string') {
                            value = cookie;
                        } else {
                            value   = cookie.value;   // eslint-disable-line prefer-destructuring
                            expires = cookie.expires; // eslint-disable-line prefer-destructuring
                        }

                        if (value) {
                            if (!expires || typeof expires === 'string') {
                                expires = new Date(expires);
                            }

                            res.cookie(
                                name,
                                value,
                                {
                                    domain : '.sencha.com',
                                    expires
                                }
                            );
                        }
                    }
                }
            }

            if (headers) {
                if (headers.ContentLength) {
                    res.set('Content-Length', headers.ContentLength);

                    delete headers.ContentLength;
                }

                if (headers.ContentType) {
                    res.set('Content-Type', headers.ContentType);

                    delete headers.ContentType;
                }

                if (headers.ContentDisposition) {
                    res.set('Content-Disposition', headers.ContentDisposition);

                    delete headers.ContentDisposition;
                }

                if (headers.ContentTransferEncoding) {
                    res.set('Content-Transfer-Encoding', headers.ContentTransferEncoding);

                    delete headers.ContentTransferEncoding;
                }

                if (headers.CacheControl) {
                    res.set('Cache-Control', headers.CacheControl);

                    delete headers.CacheControl;
                }

                for (const name in headers) {
                    res.set(name, headers[ name ]);
                }
            }

            if (extra.callback) {
                res.on('finish', extra.callback);
            }

            if (isBuffer && !extra.preventStream) {
                // TODO
                // data = Sencha.Util.bufferToStream(data);
            }

            if (extra.isView === false) {
                isPlain = true;
            }

            if (status) {
                if (typeof status === 'object') {
                    status = status.code;
                }

                status = parseInt(status);

                if (status) {
                    res.status(status);
                }
            }
        }

        if (data) {
            if (data.$redirect) {
                res.redirect(data.$redirect);
            } else if (!isPlain && typeof data === 'string') {
                res.render(data, extra);
            } else if (typeof data.pipe == 'function') {
                res.send('todo');
                // TODO
                // data.pipe(oppressor(req)).pipe(res);
            } else if (isBuffer || isPlain) {
                res.send(data);
            } else {
                res.json(data);
            }
        } else {
            res.end();
        }
    }
}

module.exports = Response;
