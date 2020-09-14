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
            opcode /* Integer <Number> from 0 to 15 */,
            fin /* Integer <Number> from 0 to 1 */,
            rsv1 /* Integer <Number> from 0 to 1 */,
            rsv2 /* Integer <Number> from 0 to 1 */,
            rsv3 /* Integer <Number> from 0 to 1 */
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