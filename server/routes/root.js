/*
 * Copyright (c) Jon Lachlan 2020
*/

import connect from 'connect';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';

const servePublic = serveStatic(
    'browser/public' /* root */, 
    { /* options */
        'index': ['index.html', 'index.htm'] 
    }
);

const route = connect();
route.use('/', function (
    request /* <http.IncomingMessage> */, 
    response /* <http.ServerResponse> */
) {
    // Do not accept other http verbs such as POST
    if(request.method !== 'GET') {
        response.end();
        return;
    }

    /*
    * Serve index.html and javascript bundle and other assets in 
    * /browser/public
    */
    // Todo: replace serve-static to serve on routes other than '/'
    servePublic(
        request, 
        response, 
        finalhandler(request, response)
    );
});

export default route;