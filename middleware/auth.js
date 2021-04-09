var authController = require('./../controller/auth')
var userModel = require('./../model/user')
var envs = require('./../config/env')
var sendBirdController = require('./../controller/sendBird')
var planModel = require('./../model/purchasePlans')
const appleSignin = require('apple-signin-auth');
const { generateReferralCode } = require('./../controller/common');

var middlewares = {}

async function validateUser(req, res, next) {
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1]
            if (token) {
                let payload = authController.validateToken(token)
                if (payload) {
                    let filter = {}
                    if (payload.primaryPhone) {
                        filter = { primaryPhone: payload.primaryPhone }
                    } else {
                        filter = { primaryEmail: payload.primaryEmail }
                    }
                    req.user = await userModel.findOne(filter).populate({ path: 'plan', model: planModel })
                    if (req.user) {
                        if (!req.user.oneTimeAllocation) {
                            req.user.oneTimeAllocation = {
                                likes: 0,
                                superLikes: 1,
                                boost: 0
                            }
                        }
                        req.user = req.user.toJSON()
                        if (req.user.status == 'active') {
                            next()
                        } else {
                            res.status(403).json({ message: 'Your Account is blocked. Please contact admin.' })
                        }
                    } else {
                        res.status(401).json({ message: 'unauthorized request 2' })
                    }
                } else {
                    res.status(401).json({ message: 'unauthorized request 3' })
                }
            } else {
                res.status(401).json({ message: 'unauthorized request 4' })
            }
        } else {
            res.status(401).json({ message: 'unauthorized request 5' })
        }
    } catch (err) {
        res.status(400).json({ message: 'something went wrong 6' })
    }
}

async function validateSignUp(req, res, next) {
    try {
        if (!req.body.primaryPhone) {
            return res.status(400).json({ message: 'Invalid Phone' })
        }
        req.user = await userModel.findOne({ primaryPhone: req.body.primaryPhone })
        if (!req.user) {
            let freePlan = await planModel.findOne({ planFor: 'membership', name: 'Free Plan' })
            if (!freePlan) {
                freePlan = await planModel.create(envs.DEFAULT_FREE_PLAN)
            }
            let referralCode = ""
            let notAvailable = true; 
            do {
                referralCode = generateReferralCode();
                notAvailable = await userModel.findOne({ referralCode: referralCode })
            } while (notAvailable );

            if(!notAvailable){
                req.user = await userModel.create({
                    role: 'user', 
                    primaryPhone: req.body.primaryPhone, 
                    plan: freePlan._id, 
                    referralCode: referralCode, 
                    oneTimeAllocation: {
                        likes: 0,
                        superLikes: 1,
                        boost: 0
                    }
                })
                req.sendBirdUser = await sendBirdController.createSendBirdUser(req.user)
                next()
            }
            
        } else {
            return res.status(400).json({ message: 'Account already exist. Goto login screen.' })
        }
    } catch (error) {
        res.status(400).json({ message: 'something went wrong', error: error })
    }
}
async function validateSignIn(req, res, next) {
    try {
        if (!req.body.primaryPhone) {
            return res.status(400).json({ message: 'Invalid mobile' })
        }
        req.user = await userModel.findOne({ primaryPhone: req.body.primaryPhone })
        if (req.user) {
            if (req.user.status == 'active') {
                next()
            } else {
                return res.status(403).json({ message: 'Your Account is blocked. Please contact admin.' })
            }
        } else {
            return res.status(400).json({ message: 'Account does not exists. Goto SignUp screen.' })
        }
    } catch (error) {
        res.status(400).json({ message: 'something went wrong', error: error })
    }
}

async function validateOTP(req, res, next) {
    try {
        if (!req.body.primaryPhone) {
            return res.status(400).json({ message: 'Invalid mobile' })
        }
        req.user = await userModel.findOne({ primaryPhone: req.body.primaryPhone, status: 'active' })
        if (req.user) {
            if (req.user.otp && req.user.otp.createdFor == req.body.verify) {
                if ((req.user.otp.code == req.body.otp) || (envs.MAGIC_OTP == req.body.otp)) {
                    if (new Date() < new Date(req.user.otp.expiresIn)) {
                        next()
                    } else {
                        return res.status(400).json({ message: 'OTP Expired' })
                    }
                } else {
                    return res.status(400).json({ message: 'Invalid OTP' })
                }
            } else {
                return res.status(400).json({ message: 'OTP not initialized' })
            }
        } else {
            return res.status(400).json({ message: 'Account does not exist. Goto signup screen.' })
        }
    } catch (error) {
        res.status(400).json({ message: 'something went wrong', error: error })
    }
}

async function validateSocial(req, res, next) {
    try {
        if (!req.body.primaryEmail) {
            return res.status(400).json({ message: 'Invalid Email' })
        }
        if (!req.body.accessToken) {
            return res.status(400).json({ message: 'Invalid Token' })
        }
        if (req.body.platform == 'facebook' || req.body.platform == 'linkedin') {
            req.body.profileVerified = true
        } else {
            req.body.profileVerified = false
        }
        req.user = await userModel.findOne({ primaryEmail: req.body.primaryEmail })
        if (!req.user) {
            let freePlan = await planModel.findOne({ planFor: 'membership', name: 'Free Plan' })
            if (!freePlan) {
                freePlan = await planModel.create(envs.DEFAULT_FREE_PLAN)
            }
            req.user = await userModel.create({
                role: 'user', primaryEmail: req.body.primaryEmail, plan: freePlan._id, profileVerified: req.body.profileVerified, oneTimeAllocation: {
                    likes: 0,
                    superLikes: 1,
                    boost: 0
                }
            })
            req.sendBirdUser = await sendBirdController.createSendBirdUser(req.user)
        } else {
            if (req.body.platform == 'facebook' || req.body.platform == 'linkedin') {
                if (!req.user.profileVerified) {
                    try {
                        userModel.findOneAndUpdate({ profileVerified: true }).then(resp => {
                            console.log("updated user profileVerified")
                        })
                    } catch (error) {
                        console.log("unable to update user profileVerified")
                    }
                }
            }
        }
        if (req.user.status == 'active') {
            next()
        } else {
            return res.status(403).json({ message: 'Your Account is blocked. Please contact admin.' })
        }
    } catch (error) {
        res.status(400).json({ message: 'something went wrong', error: error })
    }
}

async function validateAppleSocial(req, res, next) {
    try {
        if (!req.body.accessToken) {
            return res.status(400).json({ message: 'Invalid Token' })
        }
        var appleTokenData = null;
        try {
            appleTokenData = await appleSignin.verifyIdToken(req.body.accessToken, {
                audience: envs.APPLE_APP_ID,
                ignoreExpiration: true,
            })
        } catch (err) {
            return res.status(400).json({ message: 'Invalid Token', error: err })
        }
        if (!appleTokenData) {
            return res.status(400).json({ message: 'Invalid Token' })
        }
        if (!appleTokenData.sub) {
            return res.status(400).json({ message: 'Invalid sub' })
        }
        req.user = await userModel.findOne({ 'social.appleUserId': appleTokenData.sub })
        if (!req.user) {
            let freePlan = await planModel.findOne({ planFor: 'membership', name: 'Free Plan' })
            if (!freePlan) {
                freePlan = await planModel.create(envs.DEFAULT_FREE_PLAN)
            }
            req.user = await userModel.create({
                role: 'user', primaryEmail: req.body.primaryEmail || appleTokenData.email, social: { appleUserId: appleTokenData.sub }, plan: freePlan._id, oneTimeAllocation: {
                    likes: 0,
                    superLikes: 1,
                    boost: 0
                }
            })
            req.sendBirdUser = await sendBirdController.createSendBirdUser(req.user)
        }
        if (req.user.status == 'active') {
            next()
        } else {
            return res.status(403).json({ message: 'Your Account is blocked. Please contact admin.' })
        }
    } catch (error) {
        res.status(400).json({ message: 'something went wrong', error: error })
    }
}

middlewares.validateUser = validateUser
middlewares.validateSignUp = validateSignUp
middlewares.validateSignIn = validateSignIn
middlewares.validateOTP = validateOTP
middlewares.validateSocial = validateSocial
middlewares.validateAppleSocial = validateAppleSocial

module.exports = middlewares