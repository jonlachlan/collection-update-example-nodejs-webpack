/*
 * Copyright (c) Jon Lachlan 2020
*/

import http from 'http';
import routes from './routes/index.js';
import websockets from './websockets/index.js';

const httpServer = http.createServer(
    function (
        request /* <http.IncomingMessage> */, 
        response /* <http.ServerResponse> */
    ) {
        return routes(
            request,
            response
        )
    }
);

httpServer.on('upgrade', function (
    request /* <http.IncomingMessage> */, 
    socket /* <stream.Duplex> */ , 
    head /* <Buffer> websocket header */
) {
    console.log('upgrade');
    websockets(
        request,
        socket,
        head
    );
});

httpServer.listen(3000);

export { httpServer };