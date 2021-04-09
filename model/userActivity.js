var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    activity: { type: String, enum: ['yes', 'no', 'super_like', 'block', 'unmatch'], required: true },
    reason: { type: String },
    additionalInfo: { type: String }
}, { timestamps: true })

module.exports = DB.model('user_activities', schema)