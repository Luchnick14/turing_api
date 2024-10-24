'use strict'

import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import User from '../models/User.js';



const validateLogin = [
    check('email', 'El email es requerido y debe ser un email válido').isEmail().notEmpty(),
    check('password', 'La contraseña es requerida').notEmpty()
];

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        process.env.SECRET,
        { expiresIn: '24h' }
    );
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const isMatch = await argon2.verify(user.password, password);
        if(!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }
    
        const token = generateToken(user);
    
        return res.status(200).cookie('access_token', token,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            }
        ).json({
            msg: 'Inicio de sesión exitoso',
            token,
            user: {
                name: user.name,
                email: user.email,
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
}

export {
    validateLogin,
    loginUser
};