const { S3 } = require('../');

module.exports = (key, stream) => {
    const s3 = new S3({
        bucket : 'sencha-support-kb'
    });

    s3
        .getFileStream(key)
        .pipe(stream);
};
