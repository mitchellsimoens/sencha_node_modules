# sencha-aws

A module to work with different AWS services.

## Configuration

Before you can work with any AWS service, you must configure using a key and secret provided by AWS:

    const { AWS } = require('@extjs/sencha-aws');

    AWS.config = {
        key    : '...',
        secret : '...'
    };

All classes in this module will be able to use this configuration automatically.

## S3

S3 provides a simple solution to store files in buckets. A bucket is basically a drive that can house files and folders.
Each file should be given a key to identify the file when you need to retrieve it. First, you will need to create an instance
of the `S3` class:

    const { S3 } = require('@extjs/sencha-aws');

    let s3 = new S3({
        bucket : '...'
    });

### Upload a File

In order to upload files, you can either pass a String or a Buffer to the `createFile` method:

    s3.createFile('/path/to/file', 'my-file');

or a buffer:

    const fs = require('fs');

    s3.createFile(fs.readFile('/path/to/file'), 'my-file');

The `createFile` will return a Promise which will resolve with some meta data returned from AWS or reject with an error.

### Deleting a File

The `deleteFile` and `deleteFilePromise` methods will be used to delete a file. The difference here is the `deleteFile` will
return the [`AWS.Request`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Request.html) object whereas the
`deleteFilePromise` will return a Promise. Either method accepts the key of the file you want to delete:

    s3.deleteFilePromise('my-file')
        .then(fn, fn);

### Getting a File

Getting a file has multiple methods like deleting a file except there is another to return a
[read stream](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_class_stream_readable):

    s3.getFilePromise('my-file')
        .then(fn, fn);

or the read stream:

    const fs = require('fs');

    let writeStream = fs.createWriteStream('/path/to/save/file');

    s3.getFileStream('my-file')
        .pipe(writeStream);

### Get a Signed URL

Signed URLs can be handy to provide someone and automatically expire. In order to get a signed URL, just pass the file key
to the `getSignedUrl` method:

    let url = s3.getSignedUrl('my-file');

By default, the url will live for 15 minutes before it expires. To control the number of minutes the URL lives for,
pass the number of minutes as the second argument:

    let url = s3.getSignedUrl('my-file', 45);
