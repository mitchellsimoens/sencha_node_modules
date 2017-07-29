function setConfig ({ Config }) {
    Config.set('operation.api.token', {
        forumDatabase   : 'ext_forum_test',   //NEW
        senchaDatabase  : 'ext_support_test', //NEW
        tokensDatabase  : 'engops_api_test',  //NEW

        forumUserTable  : 'ext_forum_test.user',
        senchaUserTable : 'ext_support_test.user',
        tokensTable     : 'engops_api_test.tokens',
        keysTable       : 'engops_api_test.keys'
    });
}

setConfig(require('../node_modules/@extjs/sencha-core')); // for top-level
setConfig(require('@extjs/sencha-core')); // for example
