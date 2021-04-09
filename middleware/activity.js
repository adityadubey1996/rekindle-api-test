var activityModel = require('../model/userActivity')
var orderModel = require('./../model/orders')
var planModel = require('../model/purchasePlans')
var userModel = require('../model/user')
var moment = require('moment')
var envs = require('../config/env')
var middlewares = {}

async function createActivity(req, res, next) {
    let availableData = { like: 20, super_like: 0 }
    let planStartDate = moment().utcOffset("-00:00").subtract(envs.PLAN_EXPIRE_COUNT, envs.PLAN_EXPIRE_DURATION).toDate()
    let spentLikeCount = 0
    let spentSuperLikeCount = 0
    if (req.body.activity == 'yes') {
        let findQuery = { from: req.user._id, activity: 'yes', $and: [{ 'updatedAt': { $gte: moment().utcOffset("-00:00").startOf('date').toDate() } }, { 'updatedAt': { $lte: moment().utcOffset("-00:00").endOf('date').toDate() } }] }
        spentLikeCount = await activityModel.countDocuments(findQuery)
    } else if (req.body.activity == 'super_like') {
        let findQuery2 = { from: req.user._id, activity: 'super_like', $and: [{ 'updatedAt': { $gte: moment().utcOffset("-00:00").startOf('month').toDate() } }, { 'updatedAt': { $lte: moment().utcOffset("-00:00").endOf('month').toDate() } }] }
        spentSuperLikeCount = await activityModel.countDocuments(findQuery2)
    } else {
        return res.status(400).json({ message: 'Invalid Activity' })
    }
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
                if (req.body.activity == 'yes') {
                    availableData.like += order.planId.like
                } else if (req.body.activity == 'super_like') {
                    availableData.super_like += order.planId.super_like
                }
            }
        })
    }
    req.oneTimeAllocation = {
        superLikes: false,
        likes: false
    }
    if (req.body.activity == 'yes') {
        if (spentLikeCount >= availableData.like) {
            return res.status(400).json({ message: 'No likes Left' })
        }
    } else if (req.body.activity == 'super_like') {
        if (spentSuperLikeCount >= availableData.super_like) {
            availableData.super_like += req.user.oneTimeAllocation.superLikes
            if (spentSuperLikeCount >= availableData.super_like) {
                return res.status(400).json({ message: 'No super likes Left' })
            } else {
                req.user.oneTimeAllocation.superLikes--;
                try {
                    userModel.findOneAndUpdate({ oneTimeAllocation: req.user.oneTimeAllocation }).then(resp => {
                        console.log("updated user oneTimeAllocation super like")
                    })
                } catch (error) {
                    console.log("unable to update user oneTimeAllocation super like")
                }
            }
        }
    }
    next()
}

middlewares.createActivity = createActivity

module.exports = middlewares