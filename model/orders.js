var mongoose = require('mongoose')
var DB = require('../config/db')
var envs = require('../config/env')

var schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    status: { type: String, default: 'incomplete', enum: ['incomplete', 'complete'], required: true },
    paymentType: { type: String, enum: envs.PAYMENTS_TYPE, required: true },
    paymentFor: { type: String, enum: envs.PAYMENTS_FOR, required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'plans', required: true },
    paymentAmount: { type: Number },
    paymentCurrency: { type: String },
    paymentMode: { type: String },
    referenceId: { type: String },
    platform: { type: String }
}, { timestamps: true })

module.exports = DB.model('orders', schema)