/*
 * Copyright (c) Jon Lachlan 2020
*/

import getMessageBuffers from './getMessageBuffers.js';
import parseWebsocketFrame from './parseWebsocketFrame.js';
import sendMessageFactory from './sendMessageFactory.js';

/* 
 * Because it handles Ping events by sending a Pong, getMessagesFactory should 
 * only be called once for an endpoint (unlike sendMessageFactory), and its 
 * returned async generator should be called only once.
*/
export default function getMessagesFactory (
    socket /* <stream.Duplex> */
) {
    
    const sendMessage = sendMessageFactory(socket);
    
    let fragmentedPayload = new Uint8Array();
    let isFragmented = undefined;
    let fragmentedMessageOpcode = undefined;
    let fragmentedMessageRsv1 = undefined;
    let fragmentedMessageRsv2 = undefined;
    let fragmentedMessageRsv3 = undefined;
    
    function addToFragmentedPayload(payload) {
        const appendedPayload = 
            new Uint8Array(
                fragmentedPayload.length + payload.length
            );
        appendedPayload.set(
            fragmentedPayload
        );
        appendedPayload.set(payloadFragment, fragmentedPayload.length);
        fragmentedPayload = appendedPayload;
    }
        
    return async function* () {
        
        for await (const buffer of getMessageBuffers(socket)) {
            const {
                payload,
                fin: isFinalFrame,
                rsv1,
                rsv2,
                rsv3,
                opcode
            } = 
                parseWebsocketFrame(buffer);
                
            if(opcode === 9) {
                // Ping, respond with Pong
                sendMessage(payload, { opcode: 0xA });
            } else if(
                !isFinalFrame && opcode !== 0
            ) {
                // First frame for fragmented message
                isFragmented = true;
                addToFragmentedPayload(payload);
                fragmentedMessageOpcode = opcode;
                fragmentedMessageRsv1 = rsv1;
                fragmentedMessageRsv2 = rsv2;
                fragmentedMessageRsv3 = rsv3;
            } else if(
                isFragmented && opcode === 0 && !isFinalFrame
            ) {
                // Continuation frame for fragmented message
                addToFragmentedPayload(payload);
            } else if(
                isFragmented && opcode !== 0 && isFinalFrame
            ) {
                // Final frame for fragmented message
                addToFragmentedPayload(payload);
                yield {
                    payload: fragmentedPayload,
                    opcode: fragmentedMessageOpcode,
                    rsv1: fragmentedMessageRsv1,
                    rsv2: fragmentedMessageRsv2,
                    rsv3: fragmentedMessageRsv3                    
                };
                fragmentedPayload = new Uint8Array();
                isFragmented = undefined;
                fragmentedMessageOpcode = undefined;
                fragmentedMessageRsv1 = undefined;
                fragmentedMessageRvs2 = undefined;
                fragmentedMessageRsv3 = undefined;
            } else {
                // Unfragmented message
                yield {
                    payload,
                    opcode,
                    rsv1,
                    rsv2,
                    rsv3
                };
            }
        }
    };
}