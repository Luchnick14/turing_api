'use strict'

import express from 'express';
import { loginUser, validateLogin } from '../../controllers/AuthController.js';

const auth_router = express.Router();

auth_router.post('/login', validateLogin, loginUser);

export default auth_router;