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
            workers: []
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
        const projects = await Project.find();
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
        return res.status(200).json({ msg: 'Proyecto eliminado con éxito', project });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al eliminar el proyecto', error: error.message });
    }
};

const assignWorkerToProject = async (req, res) => {
    const { projectId, workersIds } = req.body;
    if (!Array.isArray(workersIds) || workersIds.length === 0) {
        return res.status(400).json({ msg: 'Debes proporcionar un array de IDs de trabajadores.' });
    }

    try {
        const project = await Project.findById({ _id: projectId });
        if (!project){
            return res.status(400).json({ msg: 'El proyecto no es válido' });
        }

        const workers = await User.find({ _id: { $in: workersIds } });
        if (workers.length !== workersIds.length) {
            return res.status(400).json({ msg: 'Uno o más trabajadores no son válidos.' });
        }

        workers.forEach(worker => {
            const alreadyInProject = project.workers.some(workerId => workerId._id.toString() === worker._id.toString());
        
            if (!alreadyInProject) {
                project.workers.push(worker._id);
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

const removeWorkerFromProject = async (req, res) => {
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

const assignAdminToProject = async (req, res) => {
    const { projectId, adminId } = req.body;

    try {
        const project = await Project.findById({ _id: projectId });
        if (!project){
            return res.status(400).json({ msg: 'El proyecto no es válido' });
        }

        const admin = await User.findById({ _id: adminId });
        if (!admin || admin.role !== 'Admin'){
            return res.status(400).json({ msg: 'El administrador no es válido' });
        }

        const alreadyInProject = project.admins.some(adminId => adminId._id.toString() === admin._id.toString());
        if (alreadyInProject) {
            return res.status(400).json({ msg: 'El administrador ya está asignado al proyecto' });
        }
        project.admins.push(adminId);
        
        const projectUpdated = await project.save();

        return res.status(200).json({ msg: 'Administrador asignado con éxito', projectUpdated });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al asignar el administrador al proyecto', error: error.message });
    }
};


export {
    validateProjectCreation,
    createProject,
    listProjects,
    updateProject,
    deleteProject,
    assignWorkerToProject,
    removeWorkerFromProject,
    assignAdminToProject
};