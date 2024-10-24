'use strict'

import express from 'express';
import {
    validateTask,
    createTask,
    listTasksByUser,
    updateTask,
    deleteTask,
    updateTaskStatus,
    listTopPerformers
} from '../../controllers/TaskController.js';

const task_router = express.Router();

task_router.post('/create', validateTask, createTask);
task_router.get('/list', listTasksByUser);
task_router.put('/update', updateTask);
task_router.delete('/delete', deleteTask);
task_router.put('/status', updateTaskStatus);
task_router.post('/top-performers', listTopPerformers);

export default task_router;
