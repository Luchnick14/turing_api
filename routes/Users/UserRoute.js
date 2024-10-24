'use strisct'

import express from 'express';
import checkAuth from '../../middlewares/checkAuth.js';
import { validateCreation, createNewUser, listUsers } from '../../controllers/UserController.js';

const users_router = express.Router();

users_router.post('/create', validateCreation, createNewUser);
users_router.get('/list', checkAuth, listUsers);

export default users_router;