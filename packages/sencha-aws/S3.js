const aws  = require('aws-sdk');
const fs   = require('fs');
const mime = require('mime-types');

const {
    AWS
} = require('./');

/**
 * @class Sencha.aws.S3
 */
class S3 extends AWS {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isS3
                 */
                isS3 : true

                /**
                 * @cfg {String} bucket The bucket to work within.
                 */

                /**
                 * @cfg {String} [key] The access key to work with.
                 * If not provided, defaults to the `config` passed to
                 * {@link Sencha.aws.AWS}.
                 */

                /**
                 * @cfg {String} [secret] The secret key to work with.
                 * If not provided, defaults to the `config` passed to
                 * {@link Sencha.aws.AWS}.
                 */
            }
        };
    }

    ctor () {
        const config = {};

        const { bucket, key, secret } = this;

        if (key) {
            config.accessKeyId = key;
        }

        if (secret) {
            config.secretAccessKey = secret;
        }

        if (bucket) {
            Object.assign(config, {
                params : {
                    Bucket : bucket
                }
            });
        }

        this.s3 = new aws.S3(config);
    }

    static get defaultType () {
        return this._defaultType || 'application/octet-stream';
    }

    static set defaultType (type) {
        this._defaultType = type;
    }

    static getMimeType (file) {
        if (file) {
            const hasGet = file.get;
            let   type;

            if (typeof file === 'string') {
                type = mime.lookup(file);
            } else {
                type = hasGet ? file.get('mime_type') : file.mime_type;

                if (!type) {
                    type = hasGet ? file.get('type') : file.type;
                }

                if (!type) {
                    const name = hasGet ? file.get('name') : file.name;

                    type = mime.lookup(name);
                }
            }

            if (type) {
                return type;
            }
        }

        return this.defaultType;
    }

    /**
     * @param {String} Key The key of the file to retrieve.
     * @return {AWS.Request}
     */
    getFile (Key) {
        return this.s3.getObject(
            {
                Key
            }
        );
    }

    /**
     * @param {String} Key The key of the file to retrieve.
     * @return {Promise}
     */
    getFilePromise (Key) {
        return this
            .getFile(Key)
            .promise();
    }

    /**
     * @param {String} Key The key of the file to retrieve.
     * @return {Stream}
     */
    getFileStream (Key) {
        return this
            .getFile(Key)
            .createReadStream();
    }

    /**
     * @param {String/Buffer} Body The file as a string (the path to be read off disk)
     * or the actual file buffer.
     * @param {String} Key The key of the file to identify it.
     * @return {Promise}
     */
    createFile (Body, Key) {
        return new Promise((resolve, reject) => {
            if (Body) {
                if (typeof Body === 'string') {
                    Body = fs.createReadStream(Body);
                }

                this.s3
                    .upload({
                        Body,
                        Key
                    })
                    .send((error, data) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(data);
                        }
                    });
            } else {
                reject(new Error('Invalid file input'));
            }
        });
    }

    /**
     * @param {String} Key The key of the file to delete.
     * @return {AWS.Request}
     */
    deleteFile (Key) {
        return this.s3.deleteObject(
            {
                Key
            }
        );
    }

    /**
     * @param {String} Key The key of the file to delete.
     * @return {Promise}
     */
    deleteFilePromise (Key) {
        return this
            .deleteFile(Key)
            .promise();
    }

    /**
     * @param {String} Key The key of the file to get the signed URL for.
     * @param {Object} params An object of parameters to pass to the `getSignedUrl` method
     * for the `aws-sdk` module.
     * @param {Number} [params.Expires=30] The number of minutes the url will stay alive.
     * @param {String} [operation=getObject] The operation to create the signed URL for.
     * @return {String}
     */
    getSignedUrl (Key, params = { Expires : 30 }, operation = 'getObject') {
        params = Object.assign({}, params, {
            Bucket : this.bucket,
            Key
        });

        return this.s3.getSignedUrl(operation, params);
    }
}

module.exports = S3;
