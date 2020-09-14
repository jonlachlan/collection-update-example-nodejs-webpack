/*
 * Copyright (c) Jon Lachlan 2020
*/

describe('getParsedWebsocketFramesFactory', function() {
    
    it.todo(
        'throws an error if \`socket\` is not an instance of stream.Duplex'
    );
    
    it.todo(
        'returns an async generator'
    );
    
    describe('returned async generator', function () {
        
        it.todo(
            'adds an initial Promise to \`awaitQueue\` and yields it'
        );
        
        it.todo(
            'resolves an Object from parseWebsocketFrame if \`pushQueue\` is ' +
            'not empty on initialization'
        );
    });
    
    it.todo(
        'adds a Buffer to \`pushQueue\` when a message is sent from a client ' +
        'and resolves an Object from parseWebsocketFrame in the returned ' +
        'async generator'
    );
    
});