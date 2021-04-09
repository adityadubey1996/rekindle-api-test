var PaytmChecksum = require('paytmchecksum')
var planModel = require('./../model/purchasePlans')
var orderModel = require('./../model/orders')
var envs = require('../config/env')
var paymentController = require('./../controller/payment')
var middlewares = {}

async function createOrder(req, res, next) {
    if (!req.body.paymentType || envs.PAYMENTS_TYPE.indexOf(req.body.paymentType) == -1) {
        return res.status(400).json({ message: 'Invalid paymentType' })
    }
    if (!req.body.paymentFor || envs.PAYMENTS_FOR.indexOf(req.body.paymentFor) == -1) {
        return res.status(400).json({ message: 'Invalid paymentFor' })
    }
    if (!req.body.planId) {
        return res.status(400).json({ message: 'Invalid planId' })
    } else {
        req.plan = await planModel.findOne({ _id: req.body.planId })
        if (!req.plan) {
            return res.status(400).json({ message: 'Invalid planId' })
        }
    }
    req.body.user = req.user._id
    next()
}

async function updateOrder(req, res, next) {
    if (!req.body.orderId) {
        return res.status(400).json({ message: 'Invalid orderId' })
    }
    if (!req.body.paymentCurrency) {
        return res.status(400).json({ message: 'Invalid paymentCurrency' })
    }
    if (!req.body.paymentMode) {
        return res.status(400).json({ message: 'Invalid paymentMode' })
    }
    if (!req.body.referenceId) {
        return res.status(400).json({ message: 'Invalid referenceId' })
    }
    if (!req.body.paymentAmount) {
        return res.status(400).json({ message: 'Invalid paymentAmount' })
    }
    if (!req.body.platform) {
        req.body.platform = 'android'
    }
    if (req.body.platform == 'android') {
        if (!req.body.CheckSumHash) {
            return res.status(400).json({ message: 'Invalid CheckSumHash' })
        } else {
            // verify the checksum hash
        }
    } else if (req.body.platform == 'ios') {
        if (!req.body.appleReceiptData) {
            return res.status(400).json({ message: 'Invalid appleReceiptData' })
        } else {
            try {
                await paymentController.setupApplePayment()
                await paymentController.verifyApplePayment(req.body.appleReceiptData)
            } catch (error) {
                console.log(error)
                return res.status(500).json({ message: 'Something Went Wrong', error: error })
            }
        }
    } else {
        return res.status(400).json({ message: 'Invalid platform' })
    }
    next()
}

middlewares.createOrder = createOrder
middlewares.updateOrder = updateOrder

module.exports = middlewares