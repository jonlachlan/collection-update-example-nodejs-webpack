/*
 * Copyright (c) Jon Lachlan 2020
*/

import getMessageBuffers from './getMessageBuffers.js';
import parseWebsocketFrame from './parseWebsocketFrame.js';
import sendMessageFactory from './sendMessageFactory.js';

/* 
 * Because it handles Ping events by sending a Pong, getMessageFragmentsFactory should 
 * only be called once for an endpoint (unlike sendMessageFactory), and its 
 * returned async generator should be called only once.
*/
export function getMessageFragmentsFactory (
    socket /* <stream.Duplex> */
) {

    const sendMessage = sendMessageFactory(socket);

    return async function* () {
       for await (const buffer of getMessageBuffers(socket)) {
            const {
                payload,
                fin,
                rsv1,
                rsv2,
                rsv3,
                opcode
            } = 
                parseWebsocketFrame(buffer);
            
            if(opcode === 9) {
                // Ping, respond with Pong
                sendMessage(payload, { opcode: 0xA });
            } else {
                yield {
                    payload,
                    opcode,
                    fin,
                    rsv1,
                    rsv2,
                    rsv3
                };
            }
       }
    };
}