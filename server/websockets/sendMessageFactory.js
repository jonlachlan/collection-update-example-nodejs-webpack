/*
 * Copyright (c) Jon Lachlan 2020
*/

import prepareWebsocketFrame from './prepareWebsocketFrame.js';

/* 
 * May be called more than once for an endpoint
*/
export default function sendMessageFactory (
    socket /* <stream.Duplex> */
) {

    return function (
        payload /* <Uint8Array> */, 
        
        /* Optional options object */
        {
            isUtf8 /* <Boolean> */,
            
            /* For advanced usage */
            opcode /* <Number> between 0 and 15 */,
            fin /* <Boolean> */,
            rsv1 /* <Boolean> */,
            rsv2 /* <Boolean> */,
            rsv3 /* <Boolean> */
        } = { isUtf8: false }
    ) {
    
        if(
            !payload instanceof Uint8Array
        ) {
            throw new Error('Message payload must be a Uint8Array');
        }

        const message = 
            prepareWebsocketFrame(
                payload, 
                { 
                    isUtf8,
                    opcode,
                    fin,
                    rsv1,
                    rsv2,
                    rsv3
                }
            );
            
        socket.write(
            message            
        );
    };
};