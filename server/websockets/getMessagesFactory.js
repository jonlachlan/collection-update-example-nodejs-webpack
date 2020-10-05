/*
 * Copyright (c) Jon Lachlan 2020
*/

import getParsedWebsocketFramesFactory from './getParsedWebsocketFramesFactory.js';
import sendMessageFactory from './sendMessageFactory.js';
import FragmentedMessageStore from './FragmentedMessageStore.js'

/* 
 * Handles Ping messages by sending a compliant Pong.
 *
 * Handles fragmented messages in-memory.
*/
export default function getMessagesFactory (
    socket /* <stream.Duplex> */
) {
    
    const getParsedWebsocketFrames = 
        getParsedWebsocketFramesFactory(
            socket
        );
    const sendMessage = 
        sendMessageFactory(
            socket
        );
    
    const fragmentedMessage = 
        new FragmentedMessageStore();
        
    return async function* () {
        
        for await (
            const 
                {
                    payload,
                    fin,
                    rsv1,
                    rsv2,
                    rsv3,
                    opcode,
                    mask
                } 
            of getParsedWebsocketFrames()
        ) {
        
            if(
                payload.length 
                && 
                mask === 0
            ) {
                /*
                 * No masking from client, close the connection with a status 
                 * code
                */
                                
                // Status code is a two-byte unsigned integer
                const code = 
                    1002; /* close due to protocol error */
                const reason = 
                    "Websocket payload from client was not masked.";
                const encoder = 
                    new TextEncoder('utf-8');
                const reasonUint8Array = 
                    encoder.encode(reason);
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
                    code % (Math.pow(2, 8)), /* keep rightmost 8 bits */
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
            } 
                
            if(
                fin === 1 
                && 
                (
                    opcode === 0x1 
                    || 
                    opcode === 0x2
                )
            ) {
                // Text frame or binary frame
                yield {
                    payload /* <Uint8Array> */,
                    opcode /* Integer <Number> from 0 to 15 */,
                    rsv1 /* Integer <Number> from 0 to 1 */,
                    rsv2 /* Integer <Number> from 0 to 1 */,
                    rsv3 /* Integer <Number> from 0 to 1 */
                };
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
            } else if(
                fin === 0 
                && 
                opcode !== 0x0
            ) {
                // First frame for fragmented message
                fragmentedMessage.start({
                    rsv1,
                    rsv2,
                    rsv3,
                    opcode,
                    payload
                });
            } else if(
                fragmentedMessage.isStarted() 
                && 
                opcode === 0x0 
                && 
                fin === 0
            ) {
                // Continuation frame for fragmented message
                fragmentedMessage.addPayload(
                    payload
                );
            } else if(
                fragmentedMessage.isStarted()  
                && 
                opcode === 0x0 
                && 
                fin === 1
            ) {
                // Final frame for fragmented message
                fragmentedMessage.addPayload(
                    payload
                );
                yield fragmentedMessage.finish();
            } else {
                /* 
                 * Unfragmented message with an opcode that is not text, 
                 * binary or ping
                */
                yield {
                    payload /* <Uint8Array> */,
                    opcode /* Integer <Number> from 0 to 15 */,
                    rsv1 /* Integer <Number> from 0 to 1 */,
                    rsv2 /* Integer <Number> from 0 to 1 */,
                    rsv3 /* Integer <Number> from 0 to 1 */
                };
            }
        }
    };
}