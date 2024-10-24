'use strict'

import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Admin', 'Worker'], 
        required: true 
    },
    assignedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }]
});

export default mongoose.model('User', userSchema);