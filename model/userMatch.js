var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    users: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }],
        required: true
    },
    activities: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user_activities'
        }],
        required: true
    }
}, { timestamps: true })

module.exports = DB.model('user_matches', schema)