var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
}, { timestamps: true })

module.exports = DB.model('boost_activities', schema)