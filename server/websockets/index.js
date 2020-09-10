/*
 * Copyright (c) Jon Lachlan 2020
*/

import updates from './updates.js';

export default function (
    request /* <http.IncomingMessage> */, 
    socket /* <stream.Duplex> */, 
    head /* <Buffer> websocket header */
) {
       
    updates(
        request,
        socket,
        head
    );

    // Our functions return true only if the function handled the connection
    // const connection = [
    //     updatesWs(
    //         request,
    //         socket,
    //         head,
    //         httpServer
    //     )
    // ].some(
    //     element => element
    // ) /* returns true if any of the websocket endpoints were handled */;
        
    // if(!connection) {
    //     socket.destroy();
    // }
}