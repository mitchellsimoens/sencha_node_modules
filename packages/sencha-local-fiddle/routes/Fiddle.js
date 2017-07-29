const { Response, route : { Route } } = require('@extjs/sencha-expressjs');
const { fiddle : { Fiddle } }         = require('../');

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
                if (typeof data === 'string') {
                    data = new Response({
                        data,
                        extra : {
                            isView : false
                        }
                    });
                } else if (data && !data.isExpressResponse) {
                    data = new Response({
                        data  : 'index.html.pug',
                        extra : data
                    });
                }

                return data;
            });
    }
}

module.exports = ExampleRoute;
