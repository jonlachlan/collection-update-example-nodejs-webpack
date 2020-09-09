/*
 * Copyright (c) Jon Lachlan 2020
*/
 

export default function uint2ArrayFromUint8Value (
    uint8Value /* <Number> */
) {
    /*
     * Get an octet (8, i.e., one byte) of 1's and 0's from a single unsigned 
     * int8 integer
    */
    
    let remaining = uint8Value;
    const uint2Array = [];
    let leftmostValue = 1;
    for (let i = 1; i <= 8; i++) {
        if(remaining % (leftmostValue * 2)) {
            uint2Array.unshift(1);
            remaining -= leftmostValue;
        } else {
            uint2Array.unshift(0);
        }
        leftmostValue = leftmostValue * 2;
    }
    return uint2Array;
}