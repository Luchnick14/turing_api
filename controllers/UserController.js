'use strict';

import { check, validationResult } from 'express-validator';
import argon2 from 'argon2';
import User from '../models/User.js';


const validateCreation = [
    check('name', 'El nombre es obligatorio').notEmpty(),
    check('lastName', 'El apellido es obligatorio').notEmpty(),
    check('email', 'El email debe ser válido').isEmail().notEmpty(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    check('role', 'El rol es obligatorio y debe ser Admin o Worker').notEmpty().isIn(['Admin', 'Worker']),
];

const createNewUser = async (req, res) => {
    const { name, lastName, email, password, role } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        const newUser = new User({
            name,
            lastName,
            email,
            password: await argon2.hash(password),
            role: role || 'Worker'
        });

        const userStored = await newUser.save();
        return res.status(201).json({ msg: 'Usuario creado con éxito', user: userStored });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al crear el usuario', error: error.message });
    }
};

const listUsers = async (req, res) => {
    try {
        const users = await User.find();
        
        if (!users) {
            return res.status(404).json({ msg: 'No hay usuarios para mostrar' });
        }

        const usersList = users.map(user => {
            return {
                id: user._id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            };
        });
        return res.status(200).json({ users: usersList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al listar los usuarios', error: error.message });
    }
};

export { 
    validateCreation, 
    createNewUser,
    listUsers 
};
