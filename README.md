# About 

An implemenation of server-side WebSocket using the [Collection Update Websocket Subprotocol](https://github.com/jonlachlan/collection-update-websocket-protocol) in JavaScript using [NodeJS](https://nodejs.org).

The repository does not use a library for WebSockets, instead it implements it directly. You can copy all the files in `/server/websockets` and adapt the `/server/websockets/updates.js` to use it as a WebSocket server. The client-side code is in `/browser` and uses Webpack.

The repository code does not provide an example message for using the `collection-update` protocol, it only shows how to connect using the protocol.

# Copyright

Copyright (c) Jon Lachlan 2020
