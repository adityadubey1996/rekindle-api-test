var express = require('express');
var router = express.Router();
var userModel = require('../model/user')
var authController = require('./../controller/auth');
var authMiddleware = require('./../middleware/auth')
var commonController = require('./../controller/common')

router.post('/signup', authMiddleware.validateSignUp, async function (req, res) {
  try {
    let otp = commonController.generateOTP()
    let otpExpiresIn = new Date().setMinutes(new Date().getMinutes() + 5)
    var message = `Your OTP to verify number on Rekindle is ${otp} valid for next 5 minutes. Do not share this OTP with anyone`
    await commonController.sendOTPSms({ message: message, numbers: [req.body.primaryPhone] })
    await userModel.findOneAndUpdate({ _id: req.user._id }, { otp: { code: otp, expiresIn: otpExpiresIn, createdFor: 'signup' } }, { new: true, runValidators: true })
    res.status(204).json({})
  } catch (err) {
    res.status(400).json({ data: err.response.data, message: 'something went wrong' })
  }
})

router.post('/signin', authMiddleware.validateSignIn, async function (req, res) {
  try {
    let otp = commonController.generateOTP()
    let otpExpiresIn = new Date().setMinutes(new Date().getMinutes() + 5)
    var message = `Your OTP to verify number on Rekindle is ${otp} valid for next 5 minutes. Do not share this OTP with anyone`
    await commonController.sendOTPSms({ message: message, numbers: [req.body.primaryPhone] })
    await userModel.findOneAndUpdate({ _id: req.user._id }, { otp: { code: otp, expiresIn: otpExpiresIn, createdFor: 'login' } }, { new: true, runValidators: true })
    res.status(204).json({})
  } catch (err) {
    res.status(400).json({ data: err.response.data, message: 'something went wrong' })
  }
})

router.post('/validate/otp', authMiddleware.validateOTP, async function (req, res) {
  try {
    let response = {}
    response.token = authController.createAccessToken(req.user.toJSON())
    let updateQuery = { otp: { code: 111111, expiresIn: new Date(), createdFor: 'none' } }
    if (req.body.verify == 'signup') {
      updateQuery.phoneVerified = true
    }
    response.user = await userModel.findOneAndUpdate({ _id: req.user._id }, updateQuery, { new: true, runValidators: true })
    res.status(200).json(response)
  } catch (err) {
    res.status(400).json({ data: err, message: 'something went wrong' })
  }
})

router.get('/validate/token', authMiddleware.validateUser, async function (req, res) {
  try {
    let temp = { ...req.user }
    res.status(200).json(temp)
  } catch (err) {
    res.status(400).json({ data: err, message: 'something went wrong' })
  }
})

router.post('/validate/social', authMiddleware.validateSocial, async function (req, res) {
  try {
    let response = {}
    response.token = authController.createAccessToken(req.user.toJSON())
    response.user = req.user
    res.status(200).json(response)
  } catch (err) {
    res.status(400).json({ data: err, message: 'something went wrong' })
  }
})

router.post('/validate/social/apple', authMiddleware.validateAppleSocial, async function (req, res) {
  try {
    let response = {}
    response.token = authController.createAccessToken(req.user.toJSON())
    response.user = req.user
    res.status(200).json(response)
  } catch (err) {
    res.status(400).json({ data: err, message: 'something went wrong' })
  }
})


module.exports = router;
