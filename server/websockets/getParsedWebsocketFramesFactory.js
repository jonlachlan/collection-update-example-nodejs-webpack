/*
 * Copyright (c) Jon Lachlan 2020
*/

import parseWebsocketFramesFactory from './parseWebsocketFramesFactory.js';
import AwaitQueue from './AwaitQueue.js';

export default function getParsedWebsocketFramesFactory (
    socket /* <stream.Duplex> */
) {

    const parseMore = 
        parseWebsocketFramesFactory();
    
    /*
     * Queue system
    */
    
    /* 
     * parserQueue returns a Promise on shift() that resolves an iterable of 
     * parsed websocket frames
    */
    const parserQueue = 
        new AwaitQueue();
        
    const bufferQueue =
        new AwaitQueue();

    function pushToQueue (buffer) {
        bufferQueue.push(buffer);
    }
    
    async function runParser() {
        while(true) {
            parserQueue.push(
                parseMore(await bufferQueue.shift())
            )
        }
    }
    runParser();    

    // Hook-in to the nodejs event emitter
    socket.on(
        'readable', 
        function() {
            pushToQueue(this.read());
        }
    );
    
    return async function* () {
        
        while(true) {
            
            const frames = 
                await parserQueue.shift();
                
            for await (const frame of frames) {
                yield frame;
            }            
        }
    }
}