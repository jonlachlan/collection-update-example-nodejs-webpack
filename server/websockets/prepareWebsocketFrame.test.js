/*
 * Copyright (c) Jon Lachlan 2020
*/

describe('prepareWebsocketFrame', function() {

    it.todo(
        'sets fin=1 and opcode=1 when \`isUtf8\` is true'
    );
    
    it.todo(
        'throws an error if opcode is not between 0 and 15'
    );
    
    it.todo(
        'throws an error if fin, rsv1, rsv2, rsv3 are not between 0 ' +
        'and 1'
    );
    
    it.todo(
        'sets mask to 0'
    );
    
    it.todo(
        'allocates the correct number of bytes for the frame'
    );
});