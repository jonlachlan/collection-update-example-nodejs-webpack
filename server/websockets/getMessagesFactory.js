/*
 * Copyright (c) Jon Lachlan 2020
*/

import getParsedWebsocketFramesFactory from './getParsedWebsocketFramesFactory.js';
import sendMessageFactory from './sendMessageFactory.js';

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
    
    let fragmentedPayload = 
        new Uint8Array();
    let isFragmented = 
        undefined;
    let fragmentedMessageOpcode = 
        undefined;
    let fragmentedMessageRsv1 = 
        undefined;
    let fragmentedMessageRsv2 = 
        undefined;
    let fragmentedMessageRsv3 = 
        undefined;
    
    function addToFragmentedPayload(
        payload /* <Uint8Array> */
    ) {
        const appendedPayload = 
            new Uint8Array(
                fragmentedPayload.length 
                + 
                payload.length
            );
        appendedPayload.set(
            fragmentedPayload
        );
        appendedPayload.set(
            payloadFragment, 
            fragmentedPayload.length /* offset */
        );
        fragmentedPayload = 
            appendedPayload;
    }
        
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
                isFragmented = 
                    true;
                addToFragmentedPayload(
                    payload
                );
                fragmentedMessageOpcode = 
                    opcode;
                fragmentedMessageRsv1 = 
                    rsv1;
                fragmentedMessageRsv2 = 
                    rsv2;
                fragmentedMessageRsv3 = 
                    rsv3;
            } else if(
                isFragmented 
                && 
                opcode === 0x0 
                && 
                fin === 0
            ) {
                // Continuation frame for fragmented message
                addToFragmentedPayload(
                    payload
                );
            } else if(
                isFragmented 
                && 
                opcode !== 0x0 
                &&
                opcode < 0x8 /* non-control opcode */
                && 
                fin === 1
            ) {
                // Final frame for fragmented message
                addToFragmentedPayload(
                    payload
                );
                yield {
                    payload: fragmentedPayload
                        /* <Uint8Array> */,
                    opcode: fragmentedMessageOpcode 
                        /* Integer <Number> from 0 to 15 */,
                    rsv1: fragmentedMessageRsv1 
                        /* Integer <Number> from 0 to 1 */,
                    rsv2: fragmentedMessageRsv2 
                        /* Integer <Number> from 0 to 1 */,
                    rsv3: fragmentedMessageRsv3 
                        /* Integer <Number> from 0 to 1 */
                };
                fragmentedPayload = 
                    new Uint8Array();
                isFragmented = 
                    undefined;
                fragmentedMessageOpcode = 
                    undefined;
                fragmentedMessageRsv1 = 
                    undefined;
                fragmentedMessageRvs2 = 
                    undefined;
                fragmentedMessageRsv3 = 
                    undefined;
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