import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config.js';
import checkAuth from './middlewares/checkAuth.js';

import users_router from './routes/Users/UserRoute.js';
import auth_router from './routes/Login/AuthRoute.js';
import project_router from './routes/Project/ProjectRoute.js';
import task_router from './routes/Task/TaskRoute.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.DB).then(() => {
    console.log('Conexión a la base de datos establecida con éxito!!');
    app.listen(process.env.PORT, () => {
        console.log('Servidor corriendo en el puerto: ' + process.env.PORT);
    });
}).catch((err) => {
    console.log(`Error al conectar a la base de datos: ${err}`);
    process.exit(1);
});

// Cargar rutas
app.use('/users', users_router);
app.use('/auth', auth_router);

app.use('/project', checkAuth, project_router);

app.use('/task', checkAuth, task_router);