/*
 * Copyright (c) Jon Lachlan 2020
*/

describe('parseWebsocketFrames generator', function () {

    it.todo(
        'throws an error when \`messagesUint8\` is not an instanceof ' +
        '<Uint8Array> or <Buffer>'
    );
    
    it.todo(
        'throws an error if length of \`messagesUint8\` is less than 2 bytes'
    );
    
    it.todo(
        'reads extended-payload-length-16 when payload-len is 126'
    );
    
    it.todo(
        'throws an error if length of \`messagesUint8\` is less than needed ' +
        'bytes when payload-len is 126'
        // 4 bytes without mask, 8 bytes with mask
    );
    
     it.todo(
        'reads extended-payload-length-63 when payload-len is 127'
    );
    
    it.todo(
        'throws an error if length of \`messagesUint8\` is less than needed ' +
        'bytes when payload-len is 127'
        // 10 bytes without mask, 14 bytes with mask
    );
    
    it.todo(
        'throws an error if the most significant bit of extended-payload-' +
        'length-63 is not zero'
    );
    
    it.todo(
        'throws an error if length of \`messagesUint8` is less than the ' +
        'frame size'
    );
    
    it.todo(
        'unmasks a masked payload'
    );
    
    it.todo(
        'does not unmask an unmasked payload'
    );
    
    it.todo(
        'yields an Object with { fin, rsv1, rsv2, rsv3, opcode, mask, ' +
        'payload }'
    );
    
    it.todo(
        'yields multiple times if more than one websocket message is ' +
        'included in \`messagesUint8\`'
    );
    
});