'use strisct'

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
        type: String, 
        enum: ['Active', 'Inactive'], 
        required: true 
    },
    admins: [{
        admin: { type: Schema.Types.ObjectId, ref: 'User' },
        tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
    }],
    workers: [{
        worker: { type: Schema.Types.ObjectId, ref: 'User' },
        tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
    }],
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    deleted: { type: Boolean, default: false }
});

export default mongoose.model('Project', ProjectSchema);