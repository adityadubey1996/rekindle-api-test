var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    reason: { type: String, required: true, enum: ['super_like', 'match', 'message', 'yes'] },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    status: { type: String, required: true, enum: ['seen', 'unseen'], default: 'unseen' }
}, { timestamps: true })

module.exports = DB.model('notifications', schema)