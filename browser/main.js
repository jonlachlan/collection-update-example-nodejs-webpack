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
        console.log(event);
    }
    updatesWebsocket.onopen = function(event) {
        console.log('open');
        console.log(event);
    
        updatesWebsocket.send(
            JSON.stringify(
                {
                    appalacia: 'trail'
                }
            )
        );
    }
    
    updatesWebsocket.onmessage = async function (event) {
        console.log(event);
        const decoder = new TextDecoder('utf-8');
        const data = new Response(event.data);
        const text = await data.text()
        console.log(text);
        
         updatesWebsocket.send(
            `client received ${text}`
        );
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