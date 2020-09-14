/*
 * Copyright (c) Jon Lachlan 2020
*/

export default function prepareWebsocketFrame (
    payload /* <Uint8Array> */,
    /* Optional options object */
    {
        isUtf8 /* <Boolean> */,
        
        /* For advanced usage */
        opcode /* Integer <Number> between 0 and 15 */,
        fin /* Integer <Number> between 0 and 1 */,
        rsv1 /* Integer <Number> between 0 and 1 */,
        rsv2 /* Integer <Number> between 0 and 1 */,
        rsv3 /* Integer <Number> between 0 and 1 */
    } = { isUtf8: false }
) {

    let extended_payload_length_bytes;
    let payload_len;
    if(payload.length <= 125) {
        // Fits in 7 bits
        payload_len = payload.length;
        extended_payload_length_bytes = 0;
    } else if(payload.length >= 65536) {
        // Won't fit in 16 bits, use 63 bits
        payload_len = 127;
        extended_payload_length_bytes = 8;
    } else {
        // Fits in 16 bits
        payload_len = 126;
        extended_payload_length_bytes = 2;
    }
    
    // length of a Uint8Array is measured in bytes
    const preparedMessage = new Uint8Array(
        2 + extended_payload_length_bytes + payload.length
    );

    // Set first byte (8 bits)
    
    // First four (4) bits of first byte
    if(fin || rsv1 || rsv2 || rsv3) {
        // All are undefined by default
        preparedMessage.fill(
            (
                (fin ? 1 : 0) * Math.pow(2, 7)
                +
                (rsv1 ? 1 : 0) * Math.pow(2, 6)
                +
                (rsv2 ? 1 : 0) * Math.pow(2, 5)
                +
                (rsv3 ? 1 : 0) * Math.pow(2, 4)
            ),
            0 /* start position */, 
            1 /* end position */
        );
    } else {
        // final frame, no reserved bits
        preparedMessage.fill(
            128, 
            0 /* start position */, 
            1 /* end position */
        );
    }
    
    // Second four (4) bits of first byte
    if(opcode) {
        preparedMessage.fill(
            preparedMessage[0] + opcode, 
            0 /* start position */, 
            1 /* end position */
        );
    } else if(isUtf8) {
        // opcode is text frame
        preparedMessage.fill(
            preparedMessage[0] + 1, 
            0 /* start position */, 
            1 /* end position */
        );        
    } else {
        // opcode is binary frame
        preparedMessage.fill(
            preparedMessage[0] + 2, 
            0 /* start position */, 
            1 /* end position */
        );
    }
    
    /*
     * Set second byte. Because we are not masking (server-to-client messages 
     * are not masked), the leftmost bit (MASK) of 8 through 15 will be 0, and 
     * the 7 remaining are payload_len, thus we can use the value of 
     * payload_len.
    */
    preparedMessage.fill(
        payload_len, 
        1 /* start position */, 
        2 /* end position */
    );    
    
    const extended_payload_length = 
        new Uint8Array(extended_payload_length_bytes);
    
    const extended_payload_length_value = 
        Uint8Array.from(payload.length);
      
    extended_payload_length.set(
        extended_payload_length_value,
        (
            /*
             * Actual value of extended payload length may consume fewer bytes than 
             * allocated
            */
            extended_payload_length_bytes - 
            extended_payload_length_value.length
        ) /* offset */
    );
    
    preparedMessage.set(
        extended_payload_length, 
        2 /* offset */
    );
    preparedMessage.set(
        payload, 
        2 + extended_payload_length_bytes /* offset */
    );
    
    return preparedMessage /* <Uint8Array> */;
}