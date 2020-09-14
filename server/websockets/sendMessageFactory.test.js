/*
 * Copyright (c) Jon Lachlan 2020
*/

describe('sendMessageFactory', function() {

    it.todo(
        'throws an error if \`socket\` is not an instance of ' +
        'stream.Duplex'
    );
    
    it.todo(
        'throws an error if payload is not an instance of Uint8Array'
    );
    
    it.todo(
        'throws an error if \`isUtf8\` is not a Boolean'
    );
    
    it.todo(
        'throws an error if \`opcode\` is not an integer between 0 and 15 ' +
        'or undefined'
    );
    
    it.todo(
        'throws an error if \`rsv1\`, \`rsv2\`, \`rsv3\` or \`fin\` are not ' +
        'each an integer between 0 and 1 or undefined'
    );
    
    it.todo(
        'successfully sends a message to a client'
    );
    
});