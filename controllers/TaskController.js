'use strict'

import { check, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

const validateTask = [
    check('title', 'El nombre de la tarea es obligatorio').notEmpty(),
    check('description', 'La descripción de la tarea es obligatoria').notEmpty(),
    check('status', 'El estado debe ser pending, in-progress o completed')
    .isIn(['pending', 'in-progress', 'completed']),
];

const createTask = async (req, res) => {
    const { title, description, projectId, assignedTo, status } = req.body;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Proyecto no encontrado' });
        }

        const userInProject = project.users.some(users => users.user.toString() === assignedTo);
        if (!userInProject) {
            return res.status(400).json({ msg: 'El usuario no está asignado al proyecto' });
        }

        const newTask = new Task({
            title,
            description,
            project: projectId,
            assignedTo,
            status: status || "pending",
            createdBy: req.user.id,
            updatedBy: req.user.id
        });

        const taskStored = await newTask.save();

        if (userInProject) {
            project.users.forEach(user => {
                if (user.user.toString() === assignedTo && !user.tasks.includes(taskStored._id)) {
                    user.tasks.push(taskStored._id); // Agregar tarea sin duplicar
                }
            });
        }

        console.log(project.users);

        await project.save();
        
        return res.status(201).json({ msg: 'Tarea creada con éxito', task: taskStored });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al crear la tarea', error: error.message });
    }
};

const updateTask = async (req, res) => {
    const { taskId, title, description, status } = req.body;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ msg: 'Tarea no encontrada' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.updatedBy = req.user.id;
        task.updatedAt = new Date();

        const taskUpdated = await task.save();

        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ msg: 'Proyecto asociado a la tarea no encontrado' });
        }

        project.users.forEach(user => {
            user.tasks = user.tasks.map(userTaskId =>
                userTaskId.toString() === taskId ? taskUpdated._id : userTaskId
            );
        });

        console.log(project.users);

        await project.save();

        return res.status(200).json({ msg: 'Tarea actualizada con éxito', task: taskUpdated });
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

        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ msg: 'Proyecto asociado a la tarea no encontrado' });
        }

        project.users.forEach(user => {
            user.tasks = user.tasks.filter(taskIdInUser => taskIdInUser.toString() !== task._id.toString());
        });

        await project.save();

        await Task.findByIdAndDelete(taskId);

        return res.status(200).json({ msg: 'Tarea eliminada con éxito' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al eliminar la tarea', error: error.message });
    }
};

const listTasksByUser = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id });
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
    listTopPerformers
};