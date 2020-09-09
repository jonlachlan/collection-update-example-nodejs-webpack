/*
 * Copyright (c) Jon Lachlan 2020
*/

import connect from 'connect';
import getQuillDocument from '../store/getQuillDocument.js'

const route = connect();

route.use('/quill-document', 
    async function (
        request /* <http.IncomingMessage> */, 
        response /* <http.ServerResponse> */
    ) {
        // Do not accept other http verbs such as POST
        if(request.method !== 'GET') {
            response.end();
            return;
        }

        const quillDocument = await getQuillDocument();

        response.setHeader('Content-Type', 'application/json');

        response.end(
            JSON.stringify(
                quillDocument
            )
        );
    }
);

export default route;