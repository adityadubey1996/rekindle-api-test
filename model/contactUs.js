var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    reason: { type: String, required: true, enum: ['vip_service'] },
    status: { type: String, required: true, default: 'new', enum: ['New', 'Open', 'Closed', 'Not Interested'] },
    trails: {
        type: [{
            status: String,
            remark: String,
            createdOn: Date
        }]
    }
}, { timestamps: true })

module.exports = DB.model('user_requests', schema)