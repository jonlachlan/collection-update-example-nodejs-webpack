/*
 * Copyright (c) Jon Lachlan 2020
*/

import connect from 'connect';
import rootRoute from './root.js';

const routes = connect();
routes.use(rootRoute);

export default routes;
