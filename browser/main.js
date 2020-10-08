/*
 * Copyright (c) Jon Lachlan 2020
*/

(async () => {

    /*
     * See endpoint at /server/websockets/updates.js
    */
    const updatesWebsocket = new WebSocket(
        'ws://localhost:3000/updates' /* url */, 
        'collection-update' /* protocol */
    );

    console.log(updatesWebsocket);

    updatesWebsocket.onclose = function(event) {
        console.log('close');
        console.log(event);
    }
    updatesWebsocket.onopen = function(event) {
        console.log('open');
    
        updatesWebsocket.send(
            JSON.stringify(
                {
                    appalacia: 'trail'
                }
            )
        );
    }
    
    updatesWebsocket.onmessage = async function (event) {
        const decoder = new TextDecoder('utf-8');
        if(event.data.stream) {

            const dataStream = event.data.stream();
            const reader = dataStream.getReader();
        
            const dataAsyncIterator = {
                next: async () => {
                    return await reader.read();
                },
                [Symbol.asyncIterator]: function() {
                    return this;
                }
            };
    
            let payload;
            // breaks when finished
            for await (const chunk of dataAsyncIterator) {
                payload = chunk;
            }
            console.log(`received websocket payload with length ${payload.length}`);
            
            updatesWebsocket.send(
                payload
            );
        }
    }
})();