var mongoose = require('mongoose')
var DB = require('../config/db')
var envs = require('../config/env')

var schema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
    like: { type: Number, required: true, default: 0 },
    boost: { type: Number, required: true, default: 0 },
    super_like: { type: Number, required: true, default: 0 },
    planFor: { type: String, enum: envs.PAYMENTS_FOR, required: true },
    appleProductId: { type: String }
}, { timestamps: true })

module.exports = DB.model('plans', schema)