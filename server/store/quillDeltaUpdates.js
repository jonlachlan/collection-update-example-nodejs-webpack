/*
 * Copyright (c) Jon Lachlan 2020
*/

import { pushHistory } from './pushHistoryInMemory.js';

export default function ({ latestUpdateId } = {}) {
    
    if(!latestUpdateId) {
        throw new Error("Missing latestUpdateId");
    }

    const pushQueue = [];

    return {
        next: async () => {
            
            // Resolve a remaining queued update
            if(
                pushQueue.length > 0
            ) {
                const quillUpdate = pushQueue.shift();
                latestUpdateId = quillUpdate.updateId;

                return Promise.resolve({
                    value: quillUpdate,
                    done: false
                });
            }

            while(
                pushHistory.findIndex(update => 
                    update.updateId === latestUpdateId
                ) === 0
            ) {
                // wait
            }

            // Add all updates since our last resolve
            pushQueue.push(
                pushHistory.slice(
                    0 /* start index */,
                    pushHistory.findIndex(update => 
                        update.updateId === latestUpdateId
                    ) /* end index */
                ).reverse()
            );

            // Resolve the first queued update
            const quillUpdate = await pushQueue.shift();
            latestUpdateId = quillUpdate.updateId;

            return Promise.resolve({
                value: quillUpdate,
                done: false
            });
        },
        [Symbol.asyncIterator]: function () {
            return this;
        }
    };
}