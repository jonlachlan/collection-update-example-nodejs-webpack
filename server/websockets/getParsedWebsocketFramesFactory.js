/*
 * Copyright (c) Jon Lachlan 2020
*/

import parseWebsocketFrame from './parseWebsocketFrame.js';

export default function getParsedWebsocketFramesFactory (
    socket /* <stream.Duplex> */
) {

    /*
     * Queue system
    */

    // pushQueue is a queue of Promises that resolve parsed Buffers
    const pushQueue = 
        [];
    // awaitQueue has a resolve function from a Promise that was yielded
    const awaitQueue = 
        [];
    
    async function clearinghouse () {
        while(
            pushQueue.length 
            && 
            awaitQueue.length
        ) {
            awaitQueue.shift()(
                await pushQueue.shift() /* <Promise> */
            );
        }
    }
    
    function pushToQueue (buffer) {
        pushQueue.push(
            new Promise(
                (resolve, reject) => {
                    resolve(
                        parseWebsocketFrame(buffer) /* <Object> */
                    ); 
                }
            )
        );

        clearinghouse();
    }

    // Hook-in to the nodejs event emitter
    socket.on(
        'data', 
        pushToQueue
    );
    
    return async function* () {

        while(true) {
            const next = 
                new Promise(
                    (resolve, reject) => {
                        awaitQueue.push(resolve);
                    }
                );
            
            clearinghouse();
            
            // waits on yield
            yield next;
        }
    }
}