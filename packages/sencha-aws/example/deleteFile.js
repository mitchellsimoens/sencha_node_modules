const { S3 } = require('../');

module.exports = (key) => {
    const s3 = new S3({
        bucket : 'sencha-support-kb'
    });

    s3
        .deleteFilePromise(key)
        .then(console.log, console.log);
};
