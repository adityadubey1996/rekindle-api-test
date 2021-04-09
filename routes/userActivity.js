var express = require('express');
var router = express.Router();
var userActivityModel = require('./../model/userActivity')
var userMatchModel = require('../model/userMatch')
var userModel = require('./../model/user')
var sendBirdController = require('./../controller/sendBird');
const { createActivity } = require('../middleware/activity');
var validActivities = ['yes', 'no', 'super_like']
var notificationController = require('./../controller/notification');
const { checkConsole, distanceLatLng } = require('../controller/common');

router.post('/unmatch', async function (req, res) {
    try {
        if (!req.body.channelUrl) {
            return res.status(400).json({ message: 'invalid channelUrl', error: {} })
        }
        if (!req.body.reason) {
            return res.status(400).json({ message: 'Invalid reason', error: {} })
        }
        if (!req.body.userId) {
            return res.status(400).json({ message: 'Invalid userId', error: {} })
        }
        await sendBirdController.deleteSendBirdChat({ channelUrl: req.body.channelUrl })
        let match = await userMatchModel.findOne({ _id: req.body.channelUrl })
        await userActivityModel.deleteMany({ _id: { $in: match.activities }, activity: { $in: ['yes', 'no', 'super_like'] } })
        await match.deleteOne()
        await userActivityModel.create({ from: req.user._id, to: req.body.userId, activity: 'unmatch', reason: req.body.reason })
        res.status(202).json({})
    } catch (error) {
        return res.status(500).json({ message: 'Something Went Wrong', error: error })
    }
})

router.post('/', createActivity, async function (req, res) {
    try {
        if (!req.body.to || (req.body.to == req.user._id)) {
            return res.status(400).json({ message: 'invalid to', error: {} })
        }
        let isAlready = await userActivityModel.findOne({
            from: req.user._id,
            to: req.body.to,
            activity: { $in: ['yes', 'no', 'super_like'] }
        })
        if (!isAlready) {
            isAlready = await userActivityModel.create({
                from: req.user._id,
                to: req.body.to,
                activity: req.body.activity
            })
        } else {
            isAlready.activity = req.body.activity
            await isAlready.save()
        }
        let newMatch = false
        if (req.body.activity == 'yes' || req.body.activity == 'super_like') {
            var isMatch = await userActivityModel.findOne({
                from: req.body.to,
                to: req.user._id,
                activity: { $in: ['yes', 'super_like'] }
            })
            if (isMatch) {
                let matchAlreadyExist = await userMatchModel.findOne({ users: { $all: [req.body.to, req.user._id] } })
                if (!matchAlreadyExist) {
                    let matchDoc = await userMatchModel.create({ users: [req.body.to, req.user._id], activities: [isAlready._id, isMatch._id] })
                    await sendBirdController.createSendBirdChat({ users: [req.body.to, req.user._id], match: matchDoc })
                    newMatch = true
                } else {
                    // res.status(200).json({ isMatch: newMatch })
                }
            }
        }
        res.status(200).json({ isMatch: newMatch })
        notificationController.createNotification(req.user._id, req.body.to, req.body.activity).then(response => {
            checkConsole(req, 'INFO', ['********* super like notification created *********'])
        }).catch(error => {
            checkConsole(req, 'ERROR', [error, '********* super like notification error *********'])
        })
        if (isMatch) {
            notificationController.createNotification(req.user._id, req.body.to, 'match').then(response => {
                checkConsole(req, 'INFO', ['********* match notification created *********'])
            }).catch(error => {
                checkConsole(req, 'ERROR', [error, '********* match notification error *********'])
            })
        }
    } catch (error) {
        checkConsole(req, 'ERROR', [error, '********* Activity API Catch Error *********'])
        res.status(500).json({ message: 'something went wrong', error: error })
    }
})

router.get('/list', async function (req, res) {
    try {
        if (req.query.fetch == 'match') {
            let matches = await userMatchModel.find({
                users: { $in: [req.user._id] }
            }).populate({ path: 'users', select: 'profilePic firstName profileVerified', model: userModel })
            res.status(200).json(matches)
        } else {
            let activities = await userActivityModel.find({
                to: req.user._id,
                activity: { $in: ['yes', 'super_like'] }
            })
                .populate({ path: 'to', select: 'profilePic firstName profileVerified loc', model: userModel })
                .populate({ path: 'from', select: 'profilePic firstName profileVerified loc', model: userModel })
            
            let activitiesResp = {};
            for (const x in activities) {
                toCoordicates = activities[x].to.loc.coordinates;
                fromCoordicates = activities[x].from.loc.coordinates;
                let distance = distanceLatLng(toCoordicates[1], toCoordicates[0], fromCoordicates[1], fromCoordicates[0], 'K')
                let activitiesRespSingle = {
                    _id: activities[x]._id,
                    createdAt: activities[x].createdAt,
                    reason: activities[x].reason,
                    status: activities[x].status,
                    updatedAt: activities[x].updatedAt,
                    to : activities[x].to,
                    from : activities[x].from,
                    distance : distance
                }
                activitiesResp[x] = activitiesRespSingle;
            }
            
            res.status(200).json(activitiesResp)
        }
    } catch (err) {
        // console.log(err)
        res.status(400).json({ data: err, message: 'something went wrong' })
    }
})

module.exports = router;
