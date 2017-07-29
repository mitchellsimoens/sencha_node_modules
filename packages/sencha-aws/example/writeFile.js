const fs = require('fs');

const { S3 } = require('../');

module.exports = (key, file) => {
    const s3 = new S3({
        bucket : 'sencha-support-kb'
    });

    s3
        .getFilePromise(key)
        .then(file => file.Body)
        .then(body => {
            fs.writeFile(file, body);
        })
        .catch(console.log);
};
