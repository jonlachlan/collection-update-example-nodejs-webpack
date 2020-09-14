/*
 * Copyright (c) Jon Lachlan 2020
*/

import url from 'url';
import sendHandshake from './sendHandshake.js';
import sendMessageFactory from './sendMessageFactory.js';
import getMessagesFactory from './getMessagesFactory.js';
import shortid from 'shortid';
import quillUpdates from '../store/quillDeltaUpdates.js';

export default async function (
    request /* <http.IncomingMessage> */, 
    socket /* <stream.Duplex> */ , 
    head /* <Buffer> websocket header */
) {

    const pathname = url.parse(request.url).pathname;
 
    if (pathname !== '/updates') {
        return false;
    }
    
    const sendMessage = sendMessageFactory(socket);
    const getMessages = getMessagesFactory(socket);
      
    const protocolHeader = 
        request.headers['sec-websocket-protocol'] === 'collection-update'
        ? (
            'Sec-WebSocket-Protocol: collection-update'
        ) : (
            ''
        );
        
    const headers = [
        protocolHeader
    ]; 
    
    sendHandshake(
        request,
        socket,
        headers
    );
    
    (async () => {
        for await (
            const { 
                payload /* <Uint8Array> */,
                opcode /* Integer <Number> from 0 to 15 */, 
                rsv1 /* Integer <Number> from 0 to 1 */, 
                rsv2 /* Integer <Number> from 0 to 1 */, 
                rsv3 /* Integer <Number> from 0 to 1 */
            } of getMessages()
        ) {
            
            if(opcode === 1) {
                // Text 
                const decoder = new TextDecoder("utf-8");
                console.log(`received message ${decoder.decode(payload)}`);
            } else if(opcode === 0xA) {
                // Pong
                console.log("Pong");
            } else if(opcode === 0x8) {
                // Close
                console.log("connection closed");
            } else {
                console.log(opcode);
            }            
        }
    })();
    
    // Send Ping
    sendMessage(
        new Uint8Array(0), 
        { 
            opcode: 0x9 /* Ping */
        }
    );
    
    const encoder = new TextEncoder('utf-8');
    sendMessage(encoder.encode("hello"), { isUtf8: true });


//     for await (
//         const quillUpdate of quillUpdates({ latestUpdateId: '0' })
//     ) {
//         const payload =
//             JSON.stringify([
//                 {
//                     collection_name: "quillUpdates",
//                     id_field: null,
//                     updates: [{
//                         document: quillUpdate
//                     }]
//                 }
//             ]);
//             
//         console.log(payload);
//         sendMessage(payload, { is_utf8: true });
//     }
    
    return true;
}
