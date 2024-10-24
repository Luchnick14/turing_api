'use strict'

import jwt from 'jsonwebtoken';

const checkAuth = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ msg: 'No autorizado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        return res.status(403).json({ msg: 'Token inválido o expirado' });
    }
};

export default checkAuth;