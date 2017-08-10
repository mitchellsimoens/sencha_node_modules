const { Response, route : { Route } } = require('@extjs/sencha-expressjs');
const { fiddle : { Fiddle } }         = require('../');

const path = require('path');
const pug  = require('pug');

class ExampleRoute extends Route {
    handle (req, res) {
        const { params : { 0 : fiddleid } } = req;

        const instance = new Fiddle({
            fiddleid,
            req,
            res
        });

        return instance
            .handle()
            .then(data => {
                if (data && typeof data === 'object' && !data.isExpressResponse) {
                    if (data instanceof Error) {
                        data = pug.renderFile(path.join(__dirname, '../views/error.pug'), {
                            error  : data,
                            pretty : true,

                            prettyStack (stack) {
                                return stack
                                    .replace(/&/g, '&amp;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/\n/g, '<br>')
                                    .replace(/\s/g, '&nbsp;');
                            }
                        });
                    } else {
                        data.pretty = true;

                        const view = 'extjs'; // TODO check out package to determine product

                        data = pug.renderFile(path.join(__dirname, `../views/fiddle/${view}.html.pug`), data);
                    }
                }

                if (typeof data === 'string') {
                    data = new Response({
                        data,
                        extra : {
                            isView : false
                        }
                    });
                }

                return data;
            });
    }
}

module.exports = ExampleRoute;
