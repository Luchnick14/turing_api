'use strict'

import Project from '../models/Project.js';
import User from '../models/User.js';
import { check, validationResult } from 'express-validator';

const validateProjectCreation = [
    check('name', 'El nombre es obligatorio').notEmpty(),
    check('status', 'El estado es obligatorio y debe ser Active o Inactive').notEmpty().isIn(['Active', 'Inactive']),
];

const createProject = async (req, res) => {
    const { name, description, status } = req.body;
    const errors = validationResult(req);

    try {
        const admin = await User.findById({ _id: req.user.id });
        if (!admin || admin.role !== 'Admin'){
            return res.status(400).json({ msg: 'El administrador no es válido' });
        }

        if (!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const newProject = new Project({
            name,
            description,
            createdBy: req.user.id,
            status: status || 'Inctive',
            users: []
        });

        const projectStored = await newProject.save();
        return res.status(201).json({ msg: 'Proyecto creado con éxito', project: projectStored });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al crear el proyecto', error: error.message });
    }
};


const listProjects = async (req, res) => {
    try {
        const projects = await Project.find({ deleted: false });
        return res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al listar los proyectos', error: error.message });
    }
};

const updateProject = async (req, res) => {
    const { projectId, name, description, status } = req.body;
    const errors = validationResult(req);

    try {
        const project = await Project.findById({ _id: projectId });
        if (!project){
            return res.status(400).json({ msg: 'El proyecto no es válido' });
        }

        if (!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        project.name = name || project.name;
        project.description = description || project.description;
        project.status = status || project.status;

        const projectUpdated = await project.save();
        return res.status(200).json({ msg: 'Proyecto actualizado con éxito', projectUpdated });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al actualizar el proyecto', error: error.message });
    }
};

const deleteProject = async (req, res) => {
    const { projectId } = req.body;
    
    try {
        const admin = await User.findById({ _id: req.user.id });
        if (!admin || admin.role !== 'Admin'){
            return res.status(400).json({ msg: 'El administrador no es válido' });
        }

        const project = await Project.findById({ _id: projectId });
        if (!project){
            return res.status(400).json({ msg: 'El proyecto no es válido' });
        }
        
        project.deleted = true;
        await project.save();

        return res.status(200).json({ msg: 'Proyecto eliminado con éxito' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al eliminar el proyecto', error: error.message });
    }
};

const assignUserToProject = async (req, res) => {
    const { projectId, usersIds } = req.body;
    if (!Array.isArray(usersIds) || usersIds.length === 0) {
        return res.status(400).json({ msg: 'Debes proporcionar un array de IDs de trabajadores.' });
    }

    try {
        const project = await Project.findById({ _id: projectId, deleted: false });
        if (!project){
            return res.status(400).json({ msg: 'El proyecto no es válido' });
        }

        const users = await User.find({ _id: { $in: usersIds } });
        if (users.length !== usersIds.length) {
            return res.status(400).json({ msg: 'Uno o más trabajadores no son válidos.' });
        }

        users.forEach(user => {
            const alreadyInProject = project.users.some(projectUser => 
                projectUser.user.toString() === user._id.toString()
            );

            // Si el usuario no está asignado al proyecto, lo añadimos
            if (!alreadyInProject) {
                project.users.push({ user: user._id });
            }
        });

        const projectUpdated = await project.save();

        return res.status(200).json({ msg: 'Trabajadores asignados con éxito',
            projectUpdated
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al asignar el trabajador al proyecto', error: error.message });
    }
};

const removeUserFromProject = async (req, res) => {
    const { projectId, workerId } = req.body;

    try {
        const project = await Project.findById({ _id: projectId });
        if (!project){
            return res.status(400).json({ msg: 'El proyecto no es válido' });
        }

        const worker = await User.findById({ _id: workerId });
        if (!worker || worker.role !== 'Worker'){
            return res.status(400).json({ msg: 'El trabajador no es válido' });
        }

        const originalWorkersCount = project.workers.length;
        project.workers = project.workers.filter(id => {id.toString() !== workerId.toString()});

        if (project.workers.length === originalWorkersCount) {
            return res.status(400).json({ msg: 'El trabajador no estaba asignado al proyecto' });
        }

        const projectSaved = await project.save();
        return res.status(200).json({ msg: 'Trabajador removido con éxito', projectSaved });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al remover el trabajador del proyecto', error: error.message });
    }
};


export {
    validateProjectCreation,
    createProject,
    listProjects,
    updateProject,
    deleteProject,
    assignUserToProject,
    removeUserFromProject
};