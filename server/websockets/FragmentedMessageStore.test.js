/*
 * Copyright (c) Jon Lachlan 2020
*/

import FragmentedMessageStore from './FragmentedMessageStore.js';

describe('FragmentedMessageStore', function () {
    
    it(
        'stores { rsv1, rsv2, rsv3, opcode, payload } on start() and returns it on ' + 
        'finish()'
    , function () {
    
        const store = new FragmentedMessageStore();
        const initialFrame = {
            rsv1: 0,
            rsv2: 0,
            rsv3: 0,
            opcode: 0x2,
            payload: new Uint8Array(8).fill(1)
        };
        store.start(
            initialFrame
        );
        const message = store.finish();
        expect(message).toEqual(
            initialFrame
        );
    });
    
    it(
        'appends payloads with addPayload()'
    , function () {
    
        const store = new FragmentedMessageStore();
        const initialFrame = {
            rsv1: 0,
            rsv2: 0,
            rsv3: 0,
            opcode: 0x2,
            payload: new Uint8Array(8).fill(1)
        };
        store.start(
            initialFrame
        );
        store.addPayload(
            new Uint8Array(20).fill(2)
        );
        store.addPayload(
            new Uint8Array(12).fill(3)
        );
        const message = store.finish();
        expect(message).toEqual({
            ...initialFrame,
            payload: 
                new Uint8Array(40)
                    .fill(1, 0, 8)
                    .fill(2, 8, 28)
                    .fill(3, 28, 40)
        });
    });
    
    it(
        'indicates a fragmented message has been started with isStarted()'    
    , function () {
    
        const store = new FragmentedMessageStore();
        expect(store.isStarted()).toEqual(
            false
        );
        const initialFrame = {
            rsv1: 0,
            rsv2: 0,
            rsv3: 0,
            opcode: 0x2,
            payload: new Uint8Array(8).fill(1)
        };
        store.start(
            initialFrame
        );
        expect(store.isStarted()).toEqual(
            true
        );
        const message = store.finish();
        expect(message).toEqual(
            initialFrame
        );
        expect(store.isStarted()).toEqual(
            false
        );
        store.start({
            rsv1: 0,
            rsv2: 0,
            rsv3: 0,
            opcode: 0x2,
            payload: new Uint8Array(10).fill(2)
        });
        expect(store.isStarted()).toEqual(
            true
        );
    });
    
    it(
        'throws an error if start() is called again before finish() is called'
    , function () {
        const store = new FragmentedMessageStore();
        const initialFrame = {
            rsv1: 0,
            rsv2: 0,
            rsv3: 0,
            opcode: 0x2,
            payload: new Uint8Array(8).fill(1)
        };
        let errorMessage;
        try {
            store.start(
                initialFrame
            );
            store.start({
                rsv1: 0,
                rsv2: 0,
                rsv3: 0,
                opcode: 0x2,
                payload: new Uint8Array(10).fill(2)
            });
        } catch (err) {
            errorMessage = err.message;
        }
        expect(errorMessage).toEqual(
            'Fragmented message already started'
        );
    });
    
    it(
        'throws an error if finish() is called before start() is called'
    , function () {
               const store = new FragmentedMessageStore();
        const initialFrame = {
            rsv1: 0,
            rsv2: 0,
            rsv3: 0,
            opcode: 0x2,
            payload: new Uint8Array(8).fill(1)
        };
        let errorMessage1;
        try {
            store.start(
                initialFrame
            );
            const message1 = store.finish();
            expect(message1).toEqual(
                initialFrame
            );
            const message2 = store.finish();
        } catch (err) {
            errorMessage1 = err.message;
        }
        expect(errorMessage1).toEqual(
            'No fragmented message'
        );
        let errorMessage2;
        try {
            const message3 = store.finish();
        } catch (err) {
            errorMessage2 = err.message;
        }
        expect(errorMessage2).toEqual(
            'No fragmented message'
        );
        
    });
});