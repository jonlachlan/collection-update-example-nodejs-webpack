/*
 * Copyright (c) Jon Lachlan 2020
*/

import uint2ArrayFromUint8Value from './uint2ArrayFromUint8Value.js';

export default function parseWebsocketFrame (
    messageUint8 /* <Uint8Array> or nodejs <Buffer> */
) {

    /*
     * Parse a WebSocket message based on The WebSocket Protocol, as specified 
     * by the Request For Comments 6455 (RFC 6455) by the IETF, see 
     * https://tools.ietf.org/html/rfc6455.
     *
     * Per Section 5.2 of the specification, a base frame takes the 
     * following form, in terms of bits (1's and 0's). The visualization is 
     * wrapped at the 32nd bit:

---------------------- as published in RFC 6455 ---------------------------


      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+


-------------------------- end of quotation -------------------------------

    */

    // First 16 bits (2 octets) are always part of base frame
    const control = [
        ...uint2ArrayFromUint8Value(messageUint8[0]),
        ...uint2ArrayFromUint8Value(messageUint8[1])
    ];
    
    /* is final frame */
    const fin = 
        Boolean(control[0]);
        
    /* reserved bits */
    const rsv1 = 
        Boolean(control[1]);
    const rsv2 = 
        Boolean(control[2]);
    const rsv3 = 
        Boolean(control[3]);

    const opcode = 
        parseInt((
            control
                .slice(
                    4 /* start */, 
                    8 /* end */
                )
                .join('')
        ), 2 /* base */);
        
    const has_mask = 
        Boolean(control[8]);

    const payload_len = 
        parseInt((
            control
                .slice(
                    9 /* start */, 
                    17 /* end */
                )
                .join('')
        ), 2 /* base */);
    
    // Parse for extended payload length

    let has_extended_payload_length_16;
    let has_extended_payload_length_63;
    let payload_length_value;

    switch(payload_len) {

        /*
         * The 7 bits of payload_len can be used to reserve more bits
         * for extended payload length, in which case payload_len is no 
         * longer used to determine value
        */

        case 126:
            /*
             * 2 bytes reserved for extended payload length
            */
            has_extended_payload_length_16 = 
                true;
            payload_length_value =
                parseInt((
                    [
                        // 16 bits (2 bytes) from index 16 to 31
                        ...uint2ArrayFromUint8Value(messageUint8[2]),
                        ...uint2ArrayFromUint8Value(messageUint8[3])
                    ].join('')
                ), 2 /* base */);

        
            break;
    
        case 127:
            /*
             * 8 bytes reserved for extended payload length (63 bits of 
             * value)
            */

            // the first bit out of the 64 must be zero
            const most_significant_bit_is_zero = 
                messageUint8[2] < 256; // 2⁸
                    
            if(!most_significant_bit_is_zero)
                throw new Error(
                    'Value of extended payload length exceeds 2⁶⁴ - 1'
                );
            
            has_extended_payload_length_63 = 
                true;
            payload_length_value =
                parseInt((
                    [
                        // 64 bits (8 bytes) from index 16
                        ...uint2ArrayFromUint8Value(messageUint8[2]), // 1
                        ...uint2ArrayFromUint8Value(messageUint8[3]), // 2
                        ...uint2ArrayFromUint8Value(messageUint8[4]), // 3
                        ...uint2ArrayFromUint8Value(messageUint8[5]), // 4
                        ...uint2ArrayFromUint8Value(messageUint8[6]), // 5
                        ...uint2ArrayFromUint8Value(messageUint8[7]), // 6
                        ...uint2ArrayFromUint8Value(messageUint8[8]), // 7
                        ...uint2ArrayFromUint8Value(messageUint8[9]) // 8
                    ].join('')
                ), 2 /* base */);

            break;

        default:
            payload_length_value = 
                payload_len;

    }

    // Determine payload

    let payload_start_index;
    const payload = 
        new Uint8Array(payload_length_value);

    if(has_mask) {
        let masking_key_octets_start_index;

        if(has_extended_payload_length_16) {
            masking_key_octets_start_index = 
                4;
        } else if(has_extended_payload_length_63) {
            masking_key_octets_start_index = 
                10;
        } else {
            // starting from end of payload_len
            masking_key_octets_start_index = 
                2;
        }

        // Masking key is 32 bits, i.e., 4 octets (4 bytes)
        payload_start_index = 
            masking_key_octets_start_index + 4;
        
        /*
         * Demasking per Section 5.3 of the specification: 
         
-------------------------- as published in RFC 6455 ---------------------------


   To convert masked data into unmasked data, or vice versa, the following 
   algorithm is applied.  The same algorithm applies regardless of the 
   direction of the translation, e.g., the same steps are applied to mask the 
   data as to unmask the data.

   Octet i of the transformed data ("transformed-octet-i") is the XOR of octet 
   i of the original data ("original-octet-i") with octet at index i modulo 4 
   of the masking key ("masking-key-octet-j"):

     j                   = i MOD 4
     transformed-octet-i = original-octet-i XOR masking-key-octet-j


------------------------------ end of quotation -------------------------------

        */
        
        for (
            let i = 0;
            i < payload_length_value;
            i++
        ) {
            payload.fill(
                (
                    messageUint8[i + payload_start_index]
                    ^ /* XOR */
                    messageUint8[masking_key_octets_start_index + (i % 4)]
                )
                , i /* start position */
                , i + 1 /* end position */
            );
        } 
    } else {
        // no masking

        if(has_extended_payload_length_16) {
            payload_start_index = 
                4;
        } else if(has_extended_payload_length_63) {
            payload_start_index = 
                10;
        } else {
            // starting from end of payload_len
            payload_start_index = 
                2;
        }

        payload.set(
            messageUint8.slice(
                payload_start_index /* begin */,
                (
                    payload_start_index + payload_length_value + 1
                ) /* end */
            )
        );
    }
    
    return {        
        fin,
        rsv1,
        rsv2,
        rsv3,
        opcode,
        mask: has_mask,
        payload
    };
}