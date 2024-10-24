'use strict'

import { check, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

const validateTask = [
    check('name', 'El nombre de la tarea es obligatorio').notEmpty(),
    check('description', 'La descripción de la tarea es obligatoria').notEmpty(),
    check('status', 'El estado de la tarea es obligatorio y debe ser pending, in-progress').notEmpty().isIn(['pending', 'in-progress']),
];

const createTask = async (req, res) => {
    const { title, description, projectId, assignedTo } = req.body;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Proyecto no encontrado' });
        }

        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        const newTask = new Task({
            title,
            description,
            project: projectId,
            assignedTo,
            createdBy: req.user.id
        });

        const taskStored = await newTask.save();
        return res.status(201).json({ msg: 'Tarea creada con éxito', task: taskStored });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al crear la tarea', error: error.message });
    }
};

const updateTask = async (req, res) => {
    const { taskId, title, description, status, assignedTo } = req.body;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ msg: 'Tarea no encontrada' });
        }

        const project = Project.findById(task.project);
        if (!project.workers.includes(assignedTo)) {
            return res.status(404).json({ msg: 'El trabajador no está asignado a este proyecto' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.assignedTo = assignedTo || task.assignedTo;
        task.updatedBy = req.user.id;
        task.updatedAt = new Date();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al actualizar la tarea', error: error.message });
    }
};

const deleteTask = async (req, res) => {
    const { taskId } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ msg: 'Tarea no encontrada' });
        }

        await task.remove();
        return res.status(200).json({ msg: 'Tarea eliminada con éxito' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al eliminar la tarea', error: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    const { taskId, status } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ msg: 'Tarea no encontrada' });
        }

        task.status = status;
        task.updatedBy = req.user.id;
        task.updatedAt = new Date();

        const taskUpdated = await task.save();
        return res.status(200).json({ msg: 'Estado de la tarea actualizado con éxito', task: taskUpdated });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al actualizar el estado de la tarea', error: error.message });
    }
};

const listTasksByUser = async (req, res) => {
    const userId = req.user.id;
    
    try {
        const tasks = await Task.find({ assingedTo: userId });
        return res.status(200).json({ tasks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al obtener las tareas', error: error.message });
    }
};

const listTopPerformers = async (req, res) => {
    const { projectId } = req.body;

    try {
        const tasks = await Task.find({ project: projectId, status: 'completed' });
        const taskCountByUser = {};

        tasks.forEach(task => {
            taskCountByUser[task.assignedTo] = (taskCountByUser[task.assignedTo] || 0) + 1;
        });

        const topPerformers = Object.entries(taskCountByUser)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        return res.status(200).json({ topPerformers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al obtener los mejores trabajadores', error: error.message });
    }
};

export {
    validateTask,
    createTask,
    listTasksByUser,
    updateTask,
    deleteTask,
    updateTaskStatus,
    listTopPerformers
};