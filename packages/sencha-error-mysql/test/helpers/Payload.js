module.exports = {
    createPayload () {
        return {
            date     : new Date(),
            ua       : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.82 Safari/537.36',
            user     : null, // null or { id: 123 }
            app      : {
                key     : 'abcd',
                version : '2.1.0.1'
            },
            browser  : {
                name    : 'Chrome',
                version : '59.0.3071.82',
                meta    : {
                    'Browser-Width'  : 2000,
                    'Browser-Height' : 1000,
                    availWidth       : 2000,
                    availHeight      : 1000,
                    availLeft        : 0,
                    availTop         : 0,
                    width            : 2000,
                    height           : 1000,
                    colorDepth       : 24,
                    pixelDepth       : 24,
                    UtcOffset        : -4
                },
                orientation : {
                    angle : 0,
                    type  : 'landscape-primary'
                }
            },
            error    : {
                message : 'Script Error',
                stack   : 'Error: foo\n    at http://localhost:3001/app/Application.js?_dc=20170311065828:192:19', // String/String[]
                name    : 'Error',
                meta    : { // null or {}
                    file         : 'foo.js',
                    line         : 23,
                    column       : 14,
                    sourceClass  : 'App.Foo',
                    sourceMethod : 'doSomething'
                }
            },
            location : {
                referer  : '',
                hash     : '#login',
                host     : 'support.sencha.com',
                href     : 'https://support.sencha.com/#login',
                origin   : 'https://support.sencha.com',
                pathname : '/',
                port     : null,
                protocol : 'https:',
                search   : ''
            },
            platform : {
                os       : 'macOS Sierra',
                platform : 'Apple Mac'
            }
        };
    }
};
