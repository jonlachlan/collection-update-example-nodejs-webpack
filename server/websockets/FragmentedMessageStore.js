/*
 * Copyright (c) Jon Lachlan 2020
*/

export default function FragmentedMessageStore () {
    const messageStore = [];
    const payloads = [];
    return new class {
        
        start ({
            rsv1,
            rsv2,
            rsv3,
            opcode,
            payload
        }) {
            if(messageStore.length !== 0) {
                throw new Error(
                    'Fragmented message already started'
                );
            }
            messageStore.push({
                rsv1,
                rsv2,
                rsv3,
                opcode
            });
            payloads.push(
                payload
            );
        }
        
        addPayload (payload) {
            payloads.push(
                payload
            );
        }
        
        isStarted () {
            return Boolean(messageStore.length);
        }
        
        finish () {
            if(messageStore.length !== 1) {
                throw new Error(
                    'No fragmented message'
                );
            }
            const message = messageStore.shift();
            message.payload = new Uint8Array(
                payloads.reduce(
                    (
                        length, 
                        payload
                    ) => length + payload.length
                , 0 /* initialValue */)
            );
            payloads.reduce(
                (
                    offset /* accumulator */,
                    payload,
                    index
                ) => {
                    message.payload.set(
                        payload,
                        offset
                    );
                    return offset + payloads[index].length;
                }
            , 0 /* initialValue */);
            return message;
        }
        
    }
}
