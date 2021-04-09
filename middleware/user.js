var boostActivityModel = require('../model/boost')
var moment = require('moment')
const { checkConsole } = require('../controller/common')
var planModel = require('../model/purchasePlans')
var orderModel = require('../model/orders')
var envs = require('../config/env')
var middlewares = {}

async function boost(req, res, next) {
    let availableData = { like: 20, boost: 0, super_like: 0 }
    let planStartDate = moment().utcOffset("-00:00").subtract(envs.PLAN_EXPIRE_COUNT, envs.PLAN_EXPIRE_DURATION).toDate()
    let findQuery3 = { user: req.user._id, $and: [{ 'createdAt': { $gte: moment().utcOffset("-00:00").startOf('month').toDate() } }, { 'createdAt': { $lte: moment().utcOffset("-00:00").endOf('month').toDate() } }] }
    let spentBoostCount = await boostActivityModel.countDocuments(findQuery3)
    let orders = await orderModel.find({
        user: req.user._id,
        status: 'complete',
        createdAt: {
            $gt: planStartDate
        }
    }).sort({ createdAt: -1 }).populate({ path: 'planId', model: planModel })
    if (orders.length > 0) {
        orders.forEach(order => {
            if (order.planId) {
                availableData.boost += order.planId.boost
            }
        })
    }
    if (spentBoostCount >= availableData.boost) {
        return res.status(400).json({ message: 'No Boost Left' })
    }
    next()
}

middlewares.boost = boost

module.exports = middlewares