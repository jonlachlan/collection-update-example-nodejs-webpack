/*
 * Copyright (c) Jon Lachlan 2020
*/

import Quill from 'quill';

(async () => {

    const userEditor = new Quill('#user-editor', {
        // modules: { toolbar: '#toolbar' },
        theme: 'snow'
    });

    const robotEditor = new Quill('#robot-editor', {
        // modules: { toolbar: '#toolbar' },
        theme: 'snow'
    });

    const encoder = new TextEncoder("utf-8");

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

    try {

        /*
         * See endpoint at /server/routes/quill-document.js
         * This example does not include security-minded HTTP headers
        */
        const response = await fetch('/quill-document', {
            method: 'GET'
        });
        
        let bodyString = "";
        const decoder = new TextDecoder('utf-8');
        const bodyReader = response.body.getReader();
        /*
         * bodyReader.read() returns a promise that resolves to 
         * { value, done }, so we can use it to implement the asyncIterator
         * interface, which is similar and can be used with for await...of
        */
        const bodyAsyncIterator = {
            next: async () => {
                return await bodyReader.read();
            },
            [Symbol.asyncIterator]: function () {
                return this;
            }
        };

        // breaks when finished
        for await (const chunk of bodyAsyncIterator) {
            bodyString += decoder.decode(chunk);
        }
//         console.log(bodyString);
        const quillDocument = JSON.parse(
            bodyString
        );

//         console.log(quillDocument);

        userEditor.setContents(quillDocument.content);
        
        robotEditor.setContents(quillDocument.content);
    } catch (error) {
        console.log(error);
    }
})();