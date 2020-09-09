/*
 * Copyright (c) Jon Lachlan 2020
*/

import connect from 'connect';
import rootRoute from './root.js';
import quillDocumentRoute from './quill-document.js';

const routes = connect();
routes.use(quillDocumentRoute);
routes.use(rootRoute);

export default routes;
