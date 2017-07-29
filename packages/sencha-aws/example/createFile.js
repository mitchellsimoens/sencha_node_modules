const { S3 } = require('../');

module.exports = (key, file) => {
    const s3 = new S3({
        bucket : 'sencha-support-kb'
    });

    s3
        .createFile(file, key)
        .then(console.log, console.log);
};
