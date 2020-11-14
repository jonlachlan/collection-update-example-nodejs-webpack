/*
 * Copyright (c) Jon Lachlan 2020
*/

import url from 'url';
import sendHandshake from './sendHandshake.js';
import sendMessageFactory from './sendMessageFactory.js';
import getMessagesFactory from './getMessagesFactory.js';
import prepareCloseFramePayload from './prepareCloseFramePayload.js';

export default async function (
    request /* <http.IncomingMessage> */, 
    socket /* <stream.Duplex> */ , 
    head /* <Buffer> websocket header */
) {

    const pathname = url.parse(request.url).pathname;
 
    if (pathname !== '/updates') {
        return false;
    }
    
    const sendMessage = 
        sendMessageFactory(socket);
    const getMessages =
        getMessagesFactory(socket);
    
    (async () => {
        for await (
            const { 
                payload /* <Promise> <Uint8Array> */,
                opcode /* Integer <Number> from 0 to 15 */, 
                rsv1 /* Integer <Number> from 0 to 1 */, 
                rsv2 /* Integer <Number> from 0 to 1 */, 
                rsv3 /* Integer <Number> from 0 to 1 */,
                mask /* Integer <Number> from 0 to 1 */
            } of getMessages()
        ) {
        
            if(
                payload.length 
                && 
                mask === 0
            ) {
                // No masking from client, close the connection with a status code 
                sendMessage(
                    prepareCloseFramePayload({
                        code: 1002,
                        reason: 'Websocket payload from client was not masked.'
                    }),
                    {
                        opcode: 0x8 /* Close */                
                    }
                );
            } 
            
            if(opcode === 0x1) {
                // Text 
                const decoder = new TextDecoder("utf-8");
                console.log(
                    `received message ${decoder.decode(payload)}`
                );
            } else if(
                opcode === 0x2
            ) {
                // Binary
                console.log(
                    `received message with payload length ${payload.length}`
                );
            } else if(
                opcode === 0x9
            ) {
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
                console.log(
                    `received message with opcode ${opcode} payload length ${payload.length}`
                );
            }
        }
    })();
    
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
    
    // Send Ping
    sendMessage(
        new Uint8Array(0), 
        { 
            opcode: 0x9 /* Ping */
        }
    );
    
    const encoder = 
        new TextEncoder('utf-8');
    sendMessage(
        encoder.encode("hello"), 
        { 
            isUtf8: true 
        }
    );
    
    const verySmallPayload = new Uint8Array(1);
    const smallPayload = new Uint8Array(128);
    const anotherSmallPayload = new Uint8Array(600);
    const largePayload = new Uint8Array(65536);
    const anotherLargePayload = new Uint8Array(10000000);
    
    sendMessage(
        verySmallPayload
    );
    
    sendMessage(
        smallPayload
    );
    
    sendMessage(
        anotherSmallPayload
    );
//     
//     sendMessage(
//         largePayload
//     );
    
    sendMessage(
        anotherLargePayload
    );
    
    return true;
}