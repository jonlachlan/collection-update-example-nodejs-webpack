/*
 * Copyright (c) Jon Lachlan 2020
*/

describe('getMessagesFactory', function() {

    it.todo(
        'returns an error if \`socket\` is not an instance of stream.Duplex'
    );
    
    it.todo(
        'returns an async generator'
    );
    
    describe('returned async generator', function () {
        
        it.todo(
            'closes the connection if there is a payload that is not masked'
        );
        
        it.todo(
            'yields a message if it is an unfragmented text frame or binary ' +
            'frame'
        );
        
        it.todo(
            'sends a Pong with \`payload\` if the message is a Ping'
        );
        
        it.todo(
            'yields a fragmented message when a final frame is sent'
        );
        
        it.todo(
            'yields a message if it is a final frame'
        );
    });
});