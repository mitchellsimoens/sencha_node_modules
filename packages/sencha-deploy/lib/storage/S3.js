const {
    error : { FatalError },
    util  : { Logger, Progress }
} = require('../');

const AWS = require('aws-sdk');
const fs  = require('fs');

class S3 {
    constructor (config = { partSize : 10, queueSize : 20 }) {
        this.bucket = process.env.S3_BUCKET;

        Object.assign(this, config);

        this.queueSize = config.queueSize;
        this.partSize  = config.partSize;

        AWS.config.update({
            accessKeyId     : this.key    = process.env.S3_KEY,
            secretAccessKey : this.secret = process.env.S3_SECRET
        });
    }

    get s3 () {
        if (this._s3) {
            return this._s3;
        } else {
            return this.s3 = new AWS.S3();
        }
    }

    set s3 (s3) {
        this._s3 = s3;
    }

    getBucketFromInfo (info = {}) {
        const { s3 } = info;
        const bucket = s3 && s3.bucket;

        return bucket || this.bucket;
    }

    ping () {
        return new Promise((resolve, reject) => {
            this.s3.headBucket(
                {
                    Bucket : this.bucket
                },
                error => {
                    if (error) {
                        switch (error.statusCode) {
                            case 403 :
                                error = 'Credentials are invalid or no permissions to access the specified Bucket';
                                break;
                            case 404 :
                                error = 'Bucket not found';
                                break;
                            default  :
                                error = 'Unable to connect to S3';
                        }

                        reject(new FatalError(`Error connecting to S3: ${error}`));
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    upload (info) {
        return new Promise((resolve, reject) => {
            const { moduleCfg : { s3 } } = info;
            const prefix   = s3 && s3.prefix ? s3.prefix : '';
            const progress = new Progress({
                showComplete : false
            });
            const body     = fs
                .createReadStream(info.args.path)
                .on('error', reject);

            this.s3
                .upload(
                    {
                        Body   : body,
                        Bucket : this.getBucketFromInfo(info),
                        Key    : prefix + info.file.sha1
                    },
                    {
                        partSize  : 1024 * 1024 * this.partSize,
                        queueSize : this.queueSize
                    }
                )
                .on('httpUploadProgress', event => {
                    if (event.total) {
                        progress.update(event.loaded / event.total);
                    } else {
                        Logger.info('Uploading progress:', event.loaded, 'bytes uploaded');
                    }
                })
                .send((error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
        });
    }

    remove (info) {
        return new Promise((resolve, reject) => {
            const key = info.Key ? info.Key : (() => {
                const {
                    file      : { sha1 },
                    moduleCfg : { s3 }
                } = info;
                const prefix = s3 && s3.prefix ? s3.prefix : '';

                return `${prefix}${sha1}`;
            })();

            this.s3.deleteObjects(
                {
                    Bucket : this.getBucketFromInfo(info),
                    Delete : {
                        Objects : [
                            {
                                Key : key
                            }
                        ]
                    }
                },
                (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                }
            );
        });
    }
}

module.exports = S3;
