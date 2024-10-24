'use strict';

import jwt from 'jsonwebtoken';

const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(req.headers);
    if (!authHeader) {
        return res.status(401).json({ msg: 'No autorizado, token faltante' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ msg: 'No autorizado, token no encontrado' });
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
