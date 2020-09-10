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
      
    const headers = [
        `Sec-WebSocket-Protocol: ${request.headers['sec-websocket-protocol']}`
    ]; 
    
    sendHandshake(
        request,
        socket,
        headers
    );
    
    (async () => {
        for await (
            const { 
                payload,
                opcode, 
                fin, 
                rsv1, 
                rsv2, 
                rsv3,
                mask
            } of getMessages()
        ) {
            if(payload.length && !mask) {
                /*
                 * No masking from client, close the connection with a status 
                 * code
                */
                                
                // Status code is a two-byte unsigned integer
                const code = 1002; /* protocol error */
                const reason = "Websocket payload from client was not masked.";
                const encoder = new TextEncoder('utf-8');
                const reasonUint8Array = encoder.encode(reason);
                const closeMessagePayload = 
                    new Uint8Array(
                        2 + reasonUint8Array.length
                    );
                closeMessagePayload.fill(
                    // first byte of status code integer
                    code >>> 8, /* drop rightmost 8 bits */
                    0, /* start position */
                    1 /* end position */
                );
                closeMessagePayload.fill(
                    // second byte of status code integer
                    code % 256, /* keep rightmost 8 bits */
                    1, /* start position */
                    2 /* end position */
                );
                closeMessagePayload.set(
                    reasonUint8Array,
                    2 /* offset */
                );            
                
                sendMessage(
                    closeMessagePayload,
                    {
                        opcode: 0x8 /* Close */                
                    }
                );
            } else if(opcode === 0x9) {
                // Ping, respond with Pong
                sendMessage(
                    payload, 
                    { 
                        opcode: 0xA /* Pong */
                    }
                );
            } else if(opcode === 0xA) {
                // Pong
                console.log("Pong");
            } else if(opcode === 0x8) {
                // Close
                console.log("connection closed");
            } else {
                console.log(opcode);
                const decoder = new TextDecoder("utf-8");
                console.log(`received message ${decoder.decode(payload)}`);
            }            
        }
    })();
    
    console.log('after');
    
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
