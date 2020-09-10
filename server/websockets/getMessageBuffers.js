/*
 * Copyright (c) Jon Lachlan 2020
*/

export default function getMessageBuffers (
    socket /* <stream.Duplex> */
) {

    /*
     * Queue system
    */

    // pushQueue is a backflow of Buffers
    const pushQueue = [];
    // awaitQueue has the resolve function from a Promise
    const awaitQueue = [];

    function pushToQueue (buffer) {
        if(awaitQueue.length) {
            // Resolve the buffer directly if there is a Promise available
            awaitQueue.shift()({
                value: buffer,
                done: false
            });
        } else {
            pushQueue.push(buffer);
        }
    }

    // Hook-in to the nodejs event emitter
    socket.on('data', pushToQueue);
    
    return {
        [Symbol.asyncIterator]: () => ({
            next: async () => {

                while(pushQueue.length && awaitQueue.length) {
                    // Clearinghouse
                    awaitQueue.shift()({
                        value: pushQueue.shift(),
                        done: false
                    });
                }
            
                return new Promise(resolve => {
                    if(pushQueue.length) {
                        resolve({
                            value: pushQueue.shift(),
                            done: false
                        });
                    } else {
                        awaitQueue.push(resolve);
                    }
                });
            }
        })
    };
}