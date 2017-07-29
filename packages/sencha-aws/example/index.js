const fs      = require('fs');
const path    = require('path');
const { AWS } = require('../');

const tests = {
    createFile   : require('./createFile'),
    deleteFile   : require('./deleteFile'),
    downloadFile : require('./downloadFile'),
    getSignedUrl : require('./getSignedUrl'),
    writeFile    : require('./writeFile')
};

AWS.config = {
    key    : 'AKIAJHSHV23BXPNBRPSA',
    secret : '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'
};

//tests.getSignedUrl();

//tests.deleteFile('mitch-test-2016-17-15');

/*tests.createFile(
    'mitch-test-2016-17-15',
    fs.readFileSync(
        path.join(__dirname, 'upload.png')
    )
);*/

/*tests.createFile(
    'mitch-test-2016-17-15',
    path.join(__dirname, '/upload.png')
);*/

/*tests.downloadFile(
    'mitch-test-2016-17-15',
    fs.createWriteStream(
        path.join(__dirname, 'download.png')
    )
);*/

/*tests.writeFile(
    'mitch-test-2016-17-15',
    path.join(__dirname, '/upload.png')
);*/
