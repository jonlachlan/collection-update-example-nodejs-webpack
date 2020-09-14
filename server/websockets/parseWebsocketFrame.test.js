/*
 * Copyright (c) Jon Lachlan 2020
*/

describe('parseWebsocketFrame', function () {

    it.todo(
        'throws an error when \`messageU8int\` is not an instanceof ' +
        '<Uint8Array> or <Buffer>'
    );
    
    it.todo(
        'throws an error if length of \`messageU8int\` is less than 2 bytes'
    );
    
    it.todo(
        'reads extended-payload-length-16 when payload-len is 126'
    );
    
    it.todo(
        'throws an error if messageU8int is length of \`messageU8int\` is ' +
        'less than needed bytes when payload-len is 126'
        // 4 bytes without mask, 8 bytes with mask
    );
    
     it.todo(
        'reads extended-payload-length-63 when payload-len is 127'
    );
    
    it.todo(
        'throws an error if messageU8int is length of \`messageU8int\` is ' +
        'less than needed bytes when payload-len is 127'
        // 10 bytes without mask, 14 bytes with mask
    );
    
    it.todo(
        'throws an error if the most significant bit of extended-payload-' +
        'length-63 is not zero'
    );
    
    it.todo(
        'throws an error if length of \`messageU8Int` does not match the ' +
        'frame size'
    );
    
    it.todo(
        'unmasks a masked payload'
    );
    
    it.todo(
        'does not unmask an unmasked payload'
    );
    
    it.todo(
        'returns an Object with { fin, rsv1, rsv2, rsv3, opcode, mask, ' +
        'payload }'
    );
    
});