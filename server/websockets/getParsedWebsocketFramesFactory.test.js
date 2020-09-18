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
    
    it.todo(
        'adds a Promise to \`parserQueue\` when a message is sent from a ' +
        'client and resolves an Object from parseWebsocketFrames in the ' +
        'returned async generator'
    );
    
    it.todo(
        'handles multiple messages in a single Buffer'
    );
    
});