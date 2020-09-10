/*
 * Copyright (c) Jon Lachlan 2020
*/

import getMessageBuffers from './getMessageBuffers.js';
import parseWebsocketFrame from './parseWebsocketFrame.js';

export default function getUnparsedMessagesFactory(
    socket /* <stream.Duplex> */
) {
    return async function* () {
        for await (const buffer of getMessageBuffers(socket)) {
            yield parseWebsocketFrame(buffer);
        }
    };
}