var express = require('express')
var router = express.Router()
var multer = require('multer')
var userModel = require('./../model/user')
var userActivityModel = require('./../model/userActivity')
var commonController = require('./../controller/common')
var sendBirdController = require('./../controller/sendBird')
var matchModel = require('./../model/userMatch')
var contactUsModel = require('./../model/contactUs')
var moment = require('moment')
var envs = require('./../config/env')
var activityModel = require('./../model/userActivity')
var notificationModel = require('./../model/notification')
var notificationController = require('./../controller/notification')
const { checkConsole, distanceLatLng } = require('./../controller/common')
var boostActivityModel = require('../model/boost')
var planModel = require('../model/purchasePlans')
var userMiddleware = require('../middleware/user')
var orderModel = require('../model/orders')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname)
  },
})

var upload = multer({ storage: storage, limits: { fileSize: 1 * 1024 * 1024 } })

router.put('/', async function (req, res) {
  try {
    let response = {}
    let dataToUpdate = { ...req.body }
    console.log(dataToUpdate)
    if (dataToUpdate.status || dataToUpdate.primaryPhone) {
      delete dataToUpdate.status
      delete dataToUpdate.primaryPhone
    }
    if (dataToUpdate.dateOfBirth) {
      dataToUpdate.age = moment().diff(moment(dataToUpdate.dateOfBirth), 'years')
    }
    response.updatedData = await userModel.findOneAndUpdate({ _id: req.user._id }, dataToUpdate, { runValidators: true, new: true })
    if (response.updatedData) {
      if (req.body.firstName || req.body.profilePic) {
        await sendBirdController.updateSendBirdUser(response.updatedData)
      }
      res.status(204).json({})
    } else {
      res.status(400).json({ message: 'Invalid Parameters' })
    }
  } catch (error) {
    // console.log(error)
    res.status(400).json({ message: 'something went wrong', error: error })
  }
})

router.get('/', async function (req, res) {
  try {
    let findUser = { role: 'user', status: 'active' }
    if (req.query.userId) {
      findUser.$and = [{ _id: req.query.userId }, { _id: { $nin: req.user.blockedBy } }]
    } else {
      findUser._id = req.user._id
    }
    let user = await userModel.findOne(findUser).select(envs.PROFILE_FIELDS.join(' ') + ' loc blockedBy')
    user = user.toJSON()
    if (user) {
      if (user.blockedBy.indexOf(req.user._id) != -1) {
        user.blocked = true
      } else {
        user.blocked = false
      }
      if (req.query.userId) {
        user.activityDone = await userActivityModel.findOne({
          from: req.user._id,
          to: req.query.userId,
          activity: { $in: ['yes', 'no', 'super_like'] },
        })
        let loggeduser = await userModel
          .findOne({
            _id: req.user._id,
          })
          .select('loc')
        loggeduser = loggeduser.toJSON()
        console.log(loggeduser)
        console.log(user)
        let distance = distanceLatLng(
          loggeduser.loc.coordinates[1],
          loggeduser.loc.coordinates[0],
          user.loc.coordinates[1],
          user.loc.coordinates[0],
          'K'
        )
        console.log(distance)

        user.distance = distance
      }
      res.status(200).json(user)
    } else {
      res.status(404).json({ message: 'User Not Found' })
    }
  } catch (error) {
    res.status(400).json({ message: 'something went wrong', error: error })
  }
})

router.post('/image', async function (req, res) {
  try {
    upload.single('image')(req, res, async function (error) {
      if (error) {
        if (error.message === 'File too large') res.status(400).json({ message: error.message })
        else {
          res.status(400).json({ message: error })
        }
      } else {
        console.log('req.file', req.file)
        if (req.file) {
          console.log('req.file', req.file)
          let url = await commonController.fileUpload(req.file, 'images')
          await userModel.findOneAndUpdate({ _id: req.user._id }, { $push: { images: url } })
          res.status(200).json({ url: url })
        } else {
          res.status(404).json({ message: 'File Not Received' })
        }
      }
    })
  } catch (err) {
    console.log(err)
    res.status(400).json({ data: err, message: 'something went wrong' })
  }
})

router.get('/list', async function (req, res) {
  try {
    let page = 0
    let perPage = 10
    if (req.query.page) {
      page = parseInt(req.query.page)
    }
    if (req.query.perPage) {
      perPage = parseInt(req.query.perPage)
    }
    let now = moment().utcOffset('-00:00').toDate()
    let filters = {
      role: 'user',
      status: 'active',
      gender: req.user.interestedIn,
      onBoardProcessCount: 12,
      _id: { $nin: [...req.user.blockedBy, req.user._id] },
      $and: [
        {
          age: { $gte: req.user.exploreFilter.ageFrom },
        },
        {
          age: { $lte: req.user.exploreFilter.ageTo },
        },
      ],
      relationshipStatus: {
        $in: req.user.exploreFilter.relationshipStatus,
      },
    }
    if (req.user.exploreFilter.thingsIHate) {
      filters['thingsYouHate'] = {
        $in: req.user.thingsYouHate,
      }
    }
    if (req.user.exploreFilter.thingsILove) {
      filters['thingsYouLove'] = {
        $in: req.user.thingsYouLove,
      }
    }
    if (req.user.exploreFilter.hasChildren) {
      filters['childrenStatus.count'] = {
        $ne: 0,
      }
    }
    if (req.query.screen == 'swipe') {
      let likedAndSuperLikedUsers = await activityModel.find({ from: req.user._id, activity: ['yes', 'super_like'] })
      filters._id.$nin = [
        ...filters._id.$nin,
        ...likedAndSuperLikedUsers.map((item) => {
          return item.to
        }),
      ]
    }
    let users = await userModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [req.user.loc.coordinates[0], req.user.loc.coordinates[1]], //[lng, lat]
          },
          key: 'loc',
          distanceField: 'distance',
          distanceMultiplier: 0.001,
          spherical: false,
          maxDistance: req.user.exploreFilter.distance,
          query: filters,
        },
      },
      {
        $addFields: {
          boostActivated: {
            $cond: {
              if: {
                $and: [
                  {
                    $lt: ['$boostStart', now],
                  },
                  {
                    $gt: ['$boostEnd', now],
                  },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
      {
        $sort: { boostActivated: -1 },
      },
      {
        $skip: page * perPage,
      },
      {
        $limit: perPage,
      },
    ])
    res.status(200).json(users)
  } catch (err) {
    console.log(err)
    res.status(400).json({ data: err, message: 'something went wrong' })
  }
})

router.get('/list/map', async function (req, res) {
  try {
    if (!req.query.lng) {
      req.query.lng = req.user.loc.coordinates[0]
    }
    if (!req.query.lat) {
      req.query.lat = req.user.loc.coordinates[1]
    }
    let page = 0
    let perPage = 10
    if (req.query.page) {
      page = req.query.page
    }
    let filters = {
      role: 'user',
      status: 'active',
      _id: { $nin: [...req.user.blockedBy, req.user._id] },
      onBoardProcessCount: 12,
    }
    let users = await userModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [req.query.lng, req.query.lat], //[lng, lat]
          },
          key: 'loc',
          distanceField: 'distance',
          spherical: false,
          maxDistance: req.user.exploreFilter.distance,
          query: filters,
        },
      },
      {
        $sort: { boostActivated: -1 },
      },
      {
        $skip: page * perPage,
      },
      {
        $limit: perPage,
      },
    ])
    res.status(200).json(users)
  } catch (err) {
    console.log(err)
    res.status(400).json({ data: err, message: 'something went wrong' })
  }
})

router.get('/list/count', async function (req, res) {
  try {
    let filters = {
      role: 'user',
      status: 'active',
      gender: req.user.interestedIn,
      _id: { $nin: [...req.user.blockedBy, req.user._id] },
      onBoardProcessCount: 12,
      $and: [
        {
          age: { $gte: req.user.exploreFilter.ageFrom },
        },
        {
          age: { $lte: req.user.exploreFilter.ageTo },
        },
      ],
      relationshipStatus: {
        $in: req.user.exploreFilter.relationshipStatus,
      },
      loc: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [req.user.loc.coordinates[0], req.user.loc.coordinates[1]], //[lng, lat]
          },
          $maxDistance: req.user.exploreFilter.distance,
        },
      },
    }
    if (req.user.exploreFilter.thingsIHate) {
      filters['thingsYouHate'] = {
        $in: req.user.thingsYouHate,
      }
    }
    if (req.user.exploreFilter.thingsILove) {
      filters['thingsYouLove'] = {
        $in: req.user.thingsYouLove,
      }
    }
    if (req.user.exploreFilter.hasChildren) {
      filters['childrenStatus.count'] = {
        $ne: 0,
      }
    }
    if (req.query.screen == 'swipe') {
      let likedAndSuperLikedUsers = await activityModel.find({ from: req.user._id, activity: ['yes', 'super_like'] })
      filters._id.$nin = [
        ...filters._id.$nin,
        ...likedAndSuperLikedUsers.map((item) => {
          return item.to
        }),
      ]
    }
    let users = await userModel.count(filters)
    res.status(200).json(users)
  } catch (err) {
    console.log(err)
    res.status(400).json({ data: err, message: 'something went wrong' })
  }
})

router.post('/block', async function (req, res) {
  try {
    if (!req.body.channelUrl) {
      return res.status(400).json({ message: 'Invalid ChannelUrl', error: {} })
    }
    if (!req.body.userId || req.body.userId == req.user._id) {
      return res.status(400).json({ message: 'Invalid UserId', error: {} })
    }
    if (req.body.activity == 'block') {
      let isExist = await userActivityModel.findOne({ from: req.user._id, to: req.body.userId, activity: 'block' })
      if (!isExist) {
        await sendBirdController.muteSendBirdUser({ channelUrl: req.body.channelUrl, userId: req.body.userId })
        await userModel.findOneAndUpdate({ _id: req.body.userId }, { $addToSet: { blockedBy: req.user._id } }, { runValidators: true })
        await userActivityModel.create({
          from: req.user._id,
          to: req.body.userId,
          activity: 'block',
          reason: req.body.reason,
          additionalInfo: req.body.additionalInfo,
        })
        res.status(204).json({})
      } else {
        res.status(404).json({ message: 'Already Blocked' })
      }
    } else if (req.body.activity == 'unblock') {
      let isExist = await userActivityModel.findOne({ from: req.user._id, to: req.body.userId, activity: 'block' })
      if (isExist) {
        await sendBirdController.unmuteSendBirdUser({ channelUrl: req.body.channelUrl, userId: req.body.userId })
        await userModel.findOneAndUpdate({ _id: req.body.userId }, { $pull: { blockedBy: req.user._id } }, { runValidators: true })
        await isExist.deleteOne()
        res.status(204).json({})
      } else {
        res.status(404).json({ message: 'User Not Blocked' })
      }
    } else {
      res.status(400).json({ message: 'Invalid Activity', error: {} })
    }
  } catch (error) {
    res.status(400).json({ message: 'something went wrong', error: error })
  }
})

router.post('/delete', async function (req, res) {
  try {
    await contactUsModel.deleteMany({ user: req.user._id })
    await userActivityModel.deleteMany({ $or: [{ from: req.user._id }, { to: req.user._id }] })
    let matches = await matchModel.find({ users: { $in: [req.user._id] } })
    let promises = []
    matches.forEach((item) => {
      promises.push(sendBirdController.deleteSendBirdChat({ channelUrl: item._id }))
    })
    await Promise.all(promises)
    await matchModel.deleteMany({ users: { $in: [req.user._id] } })
    await sendBirdController.deleteSendBirdUser({ userId: req.user._id })
    await notificationModel.deleteMany({ $or: [{ from: req.user._id }, { to: req.user._id }] })
    await userModel.updateMany({ blockedBy: { $in: [req.user._id] } }, { $pull: { blockedBy: req.user._id } })
    await userModel.deleteOne({ _id: req.user._id })
    res.status(204).json({})
  } catch (error) {
    res.status(400).json({ message: 'something went wrong', error: error })
  }
})

router.put('/chat', async function (req, res) {
  try {
    if (!req.body.channelUrl) {
      return res.status(400).json({ message: 'Invalid ChannelUrl', error: {} })
    }
    if (req.body.operation == 'delete') {
      await sendBirdController.hideSendBirdChat({ channelUrl: req.body.channelUrl, userId: req.user._id })
    } else if (req.body.operation == 'clear') {
      await sendBirdController.clearSendBirdChat({ channelUrl: req.body.channelUrl, userId: req.user._id })
    } else {
      return res.status(400).json({ message: 'Invalid Operation', error: error })
    }
    res.status(204).json({})
  } catch (error) {
    res.status(400).json({ message: 'something went wrong', error: error })
  }
})

router.post('/message/notification', async function (req, res) {
  try {
    if (!req.body.to) {
      return res.status(400).json({ message: 'Invalid to', error: {} })
    }
    let response = await notificationController.createNotification(req.user._id, req.body.to, 'message')
    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({ message: 'something went wrong', error: error })
  }
})

router.get('/balance', async function (req, res) {
  let availableData = { like: 20, boost: 0, super_like: 0 + req.user.oneTimeAllocation.superLikes }
  let planStartDate = moment().utcOffset('-00:00').subtract(envs.PLAN_EXPIRE_COUNT, envs.PLAN_EXPIRE_DURATION).toDate()
  let findQuery = {
    from: req.user._id,
    activity: 'yes',
    $and: [
      { updatedAt: { $gte: moment().utcOffset('-00:00').startOf('date').toDate() } },
      { updatedAt: { $lte: moment().utcOffset('-00:00').endOf('date').toDate() } },
    ],
  }
  let findQuery2 = {
    from: req.user._id,
    activity: 'super_like',
    $and: [
      { updatedAt: { $gte: moment().utcOffset('-00:00').startOf('month').toDate() } },
      { updatedAt: { $lte: moment().utcOffset('-00:00').endOf('month').toDate() } },
    ],
  }
  let findQuery3 = {
    user: req.user._id,
    $and: [
      { createdAt: { $gte: moment().utcOffset('-00:00').startOf('month').toDate() } },
      { createdAt: { $lte: moment().utcOffset('-00:00').endOf('month').toDate() } },
    ],
  }
  let spentLikeCount = await activityModel.countDocuments(findQuery)
  let spentSuperLikeCount = await activityModel.countDocuments(findQuery2)
  let spentBoostCount = await boostActivityModel.countDocuments(findQuery3)
  let orders = await orderModel
    .find({
      user: req.user._id,
      status: 'complete',
      createdAt: {
        $gt: planStartDate,
      },
    })
    .sort({ createdAt: -1 })
    .populate({ path: 'planId', model: planModel })
  if (orders.length > 0) {
    orders.forEach((order) => {
      if (order.planId) {
        availableData.like += order.planId.like
        availableData.boost += order.planId.boost
        availableData.super_like += order.planId.super_like
      }
    })
  }
  let balance = {
    boost: availableData.boost - spentBoostCount,
    like: availableData.like - spentLikeCount,
    super_like: availableData.super_like - spentSuperLikeCount,
  }
  res.status(200).json(balance)
})

router.put('/notification', async function (req, res) {
  try {
    if (!req.query.notificationId) {
      return res.status(400).json({ message: 'invalid Notification Id' })
    }
    await notificationModel.findOneAndUpdate({ _id: req.query.notificationId }, { status: 'seen' }, { new: true })
    return res.status(202).json({})
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong', error: JSON.stringify(error) })
  }
})

router.get('/notification', async function (req, res) {
  try {
    let filters = {
      to: req.user._id,
    }
    let perPage = 2
    let page = 0
    if (req.query.page) {
      page = parseInt(req.query.page)
    }
    if (req.query.status) {
      filters.status = req.query.status
    }
    if (req.query.reason) {
      filters.reason = req.query.reason
    }
    if (req.query.perPage) {
      perPage = parseInt(req.query.perPage)
    }
    let notifications = await notificationModel
      .find(filters)
      .skip(page * perPage)
      .limit(perPage)
      .populate({ path: 'to', select: '_id profilePic firstName', model: userModel })
      .populate({ path: 'from', select: '_id profilePic firstName', model: userModel })
    return res.status(200).json(notifications)
  } catch (error) {
    commonController.checkConsole(req, 'ERROR', [error, '**** error in notification catch ****'])
    return res.status(500).json({ message: 'Something went wrong', error: {} })
  }
})

router.post('/boost', userMiddleware.boost, async function (req, res) {
  try {
    let start = moment()
    let end = moment().add(envs.BOOST_DURATION_MINUTES, 'minutes')
    let newBoost = await boostActivityModel.create({ user: req.user, start: start.toDate(), end: end.toDate() })
    let userUpdateData = { boostStart: start.toDate(), boostEnd: end.toDate() }
    await userModel.findOneAndUpdate({ _id: req.user._id }, userUpdateData)
    res.status(200).json(newBoost)
  } catch (error) {
    checkConsole(req, 'ERROR', [error, ' boost post api catch error'])
    res.status(500).json({ message: 'Somethign Went Wrong' })
  }
})

router.get('/boost', async function (req, res) {
  try {
    if (req.query.type == 'active') {
      let now = moment().utcOffset('-00:00').toDate()
      let activeBoost = await boostActivityModel.findOne({ user: req.user._id, $and: [{ end: { $gte: now } }, { start: { $lte: now } }] })
      res.status(200).json({ boost: activeBoost })
    } else {
      let allBoosts = await boostActivityModel.find({ user: req.user._id })
      res.status(200).json(allBoosts)
    }
  } catch (error) {
    checkConsole(req, 'ERROR', [error, ' boost get api catch error'])
    res.status(500).json({ message: 'Something Went Wrong' })
  }
})
router.post('/refer', async function (req, res) {
  try {
    if (!req.body.referralCodeUsed) {
      return res.status(400).json({ message: 'Invalid referral code', error: {} })
    }

    let isAvailable = await userModel.findOne({ referralCode: req.body.referralCodeUsed })
    if (!isAvailable) {
      return res.status(400).json({ message: 'Invalid referral code', error: {} })
    }

    let isAlreadyUsed = await userModel.findOne({ _id: req.user._id })
    if (isAlreadyUsed.referrer) {
      return res.status(400).json({ message: 'You have already used referral code', error: {} })
    }

    await userModel.updateOne(
      { _id: req.user._id },
      {
        $inc: { 'oneTimeAllocation.superLikes': 2 },
        referrer: isAvailable._id,
      }
    )

    await userModel.updateOne(
      { _id: isAvailable._id },
      {
        $inc: { 'oneTimeAllocation.superLikes': 5 },
      }
    )
    var message = `Someone has joined at Rekindle using your referral code.`
    await commonController.sendOTPSms({ message: message, numbers: [isAvailable.primaryPhone] })

    res.status(200).json({ message: 'Referral code used successfully' })
  } catch (error) {
    res.status(500).json({ message: 'something went wrong', error: error })
  }
})

module.exports = router
