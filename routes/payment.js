var express = require('express');
var router = express.Router();
var envs = require('./../config/env')
var paymentMiddlewares = require('./../middleware/payment')
var orderModel = require('../model/orders')
var planModel = require('./../model/purchasePlans')
var userModel = require('./../model/user');
var axios = require('axios').default

router.post('/order', paymentMiddlewares.createOrder, async function (req, res) {
    let order = await orderModel.create({ ...req.body })
    res.status(200).json(order)
})

router.put('/order', paymentMiddlewares.updateOrder, async function (req, res) {
    try {
        let updatedData = { ...req.body }
        updatedData.status = 'complete'
        let tempOrder = await orderModel.findOneAndUpdate({ _id: req.body.orderId }, updatedData, { new: true, runValidators: true })
        await userModel.findOneAndUpdate({ _id: req.user._id }, { plan: tempOrder.planId })
        res.status(204).json({})
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

router.post("/hash", async function (req, res) {
    try {
        let headers = {
            'x-client-id': envs.CASHFREE_CLIENT_ID,
            'x-client-secret': envs.CASHFREE_CLIENT_SECRET
        }
        let response = await axios.post(envs.CASHFREE_TOKEN_URL, req.body, { headers: headers })
        res.status(200).json({ checksum: response.data.cftoken, type: envs.CASHFREE_CRED_TYPE })
    } catch (error) {
        return res.status(500).json({ error: error })
    }
})

module.exports = router;
