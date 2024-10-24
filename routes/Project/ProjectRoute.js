'use strict'

import express from 'express';
import {
    validateProjectCreation,
    createProject,
    listProjects,
    updateProject,
    deleteProject,
    assignWorkerToProject,
    removeWorkerFromProject,
    assignAdminToProject
} from '../../controllers/ProjectController.js';

const project_router = express.Router();

project_router.post('/create', validateProjectCreation, createProject);
project_router.get('/list', listProjects);
project_router.put('/update', updateProject, validateProjectCreation);
project_router.put('/delete', deleteProject);
project_router.put('/assign_worker', assignWorkerToProject);
project_router.put('/remove_worker', removeWorkerFromProject);
project_router.put('/assign_admin', assignAdminToProject);

export default project_router;