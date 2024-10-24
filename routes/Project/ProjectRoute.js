'use strict'

import express from 'express';
import {
    validateProjectCreation,
    createProject,
    listProjects,
    updateProject,
    deleteProject,
    assignUserToProject,
    removeUserFromProject
} from '../../controllers/ProjectController.js';

const project_router = express.Router();

project_router.post('/create', validateProjectCreation, createProject);
project_router.get('/list', listProjects);
project_router.put('/update', updateProject, validateProjectCreation);
project_router.put('/delete', deleteProject);
project_router.put('/assign_user', assignUserToProject);
project_router.put('/remove_user', removeUserFromProject);

export default project_router;