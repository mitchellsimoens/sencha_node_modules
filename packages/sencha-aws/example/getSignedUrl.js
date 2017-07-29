const {
    S3
} = require('../');

module.exports = () => {
    const s3 = new S3({
        bucket : 'sencha-support-kb'
    });

    const key = 'portal-ticket-reply-34b682b702438989f25929c0ef011428';

    console.log(s3.getSignedUrl(key));
};
