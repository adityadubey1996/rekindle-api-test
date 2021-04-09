"use strict";

var authController = require('./../controller/auth');

var userModel = require('./../model/user');

var envs = require('./../config/env');

var sendBirdController = require('./../controller/sendBird');

var planModel = require('./../model/purchasePlans');

var appleSignin = require('apple-signin-auth');

var _require = require('./../controller/common'),
    generateReferralCode = _require.generateReferralCode;

var middlewares = {};

function validateUser(req, res, next) {
  var token, payload, filter;
  return regeneratorRuntime.async(function validateUser$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;

          if (!req.headers.authorization) {
            _context.next = 20;
            break;
          }

          token = req.headers.authorization.split(' ')[1];

          if (!token) {
            _context.next = 17;
            break;
          }

          payload = authController.validateToken(token);

          if (!payload) {
            _context.next = 14;
            break;
          }

          filter = {};

          if (payload.primaryPhone) {
            filter = {
              primaryPhone: payload.primaryPhone
            };
          } else {
            filter = {
              primaryEmail: payload.primaryEmail
            };
          }

          _context.next = 10;
          return regeneratorRuntime.awrap(userModel.findOne(filter).populate({
            path: 'plan',
            model: planModel
          }));

        case 10:
          req.user = _context.sent;

          if (req.user) {
            if (!req.user.oneTimeAllocation) {
              req.user.oneTimeAllocation = {
                likes: 0,
                superLikes: 1,
                boost: 0
              };
            }

            req.user = req.user.toJSON();

            if (req.user.status == 'active') {
              next();
            } else {
              res.status(403).json({
                message: 'Your Account is blocked. Please contact admin.'
              });
            }
          } else {
            res.status(401).json({
              message: 'unauthorized request 2'
            });
          }

          _context.next = 15;
          break;

        case 14:
          res.status(401).json({
            message: 'unauthorized request 3'
          });

        case 15:
          _context.next = 18;
          break;

        case 17:
          res.status(401).json({
            message: 'unauthorized request 4'
          });

        case 18:
          _context.next = 21;
          break;

        case 20:
          res.status(401).json({
            message: 'unauthorized request 5'
          });

        case 21:
          _context.next = 26;
          break;

        case 23:
          _context.prev = 23;
          _context.t0 = _context["catch"](0);
          res.status(400).json({
            message: 'something went wrong 6'
          });

        case 26:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 23]]);
}

function validateSignUp(req, res, next) {
  var freePlan, referralCode, notAvailable;
  return regeneratorRuntime.async(function validateSignUp$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;

          if (req.body.primaryPhone) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: 'Invalid Phone'
          }));

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(userModel.findOne({
            primaryPhone: req.body.primaryPhone
          }));

        case 5:
          req.user = _context2.sent;

          if (req.user) {
            _context2.next = 31;
            break;
          }

          _context2.next = 9;
          return regeneratorRuntime.awrap(planModel.findOne({
            planFor: 'membership',
            name: 'Free Plan'
          }));

        case 9:
          freePlan = _context2.sent;

          if (freePlan) {
            _context2.next = 14;
            break;
          }

          _context2.next = 13;
          return regeneratorRuntime.awrap(planModel.create(envs.DEFAULT_FREE_PLAN));

        case 13:
          freePlan = _context2.sent;

        case 14:
          referralCode = "";
          notAvailable = true;

        case 16:
          referralCode = generateReferralCode();
          _context2.next = 19;
          return regeneratorRuntime.awrap(userModel.findOne({
            referralCode: referralCode
          }));

        case 19:
          notAvailable = _context2.sent;

        case 20:
          if (notAvailable) {
            _context2.next = 16;
            break;
          }

        case 21:
          if (notAvailable) {
            _context2.next = 29;
            break;
          }

          _context2.next = 24;
          return regeneratorRuntime.awrap(userModel.create({
            role: 'user',
            primaryPhone: req.body.primaryPhone,
            plan: freePlan._id,
            referralCode: referralCode,
            oneTimeAllocation: {
              likes: 0,
              superLikes: 1,
              boost: 0
            }
          }));

        case 24:
          req.user = _context2.sent;
          _context2.next = 27;
          return regeneratorRuntime.awrap(sendBirdController.createSendBirdUser(req.user));

        case 27:
          req.sendBirdUser = _context2.sent;
          next();

        case 29:
          _context2.next = 32;
          break;

        case 31:
          return _context2.abrupt("return", res.status(400).json({
            message: 'Account already exist. Goto login screen.'
          }));

        case 32:
          _context2.next = 37;
          break;

        case 34:
          _context2.prev = 34;
          _context2.t0 = _context2["catch"](0);
          res.status(400).json({
            message: 'something went wrong',
            error: _context2.t0
          });

        case 37:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 34]]);
}

function validateSignIn(req, res, next) {
  return regeneratorRuntime.async(function validateSignIn$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;

          if (req.body.primaryPhone) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: 'Invalid mobile'
          }));

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(userModel.findOne({
            primaryPhone: req.body.primaryPhone
          }));

        case 5:
          req.user = _context3.sent;

          if (!req.user) {
            _context3.next = 14;
            break;
          }

          if (!(req.user.status == 'active')) {
            _context3.next = 11;
            break;
          }

          next();
          _context3.next = 12;
          break;

        case 11:
          return _context3.abrupt("return", res.status(403).json({
            message: 'Your Account is blocked. Please contact admin.'
          }));

        case 12:
          _context3.next = 15;
          break;

        case 14:
          return _context3.abrupt("return", res.status(400).json({
            message: 'Account does not exists. Goto SignUp screen.'
          }));

        case 15:
          _context3.next = 20;
          break;

        case 17:
          _context3.prev = 17;
          _context3.t0 = _context3["catch"](0);
          res.status(400).json({
            message: 'something went wrong',
            error: _context3.t0
          });

        case 20:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 17]]);
}

function validateOTP(req, res, next) {
  return regeneratorRuntime.async(function validateOTP$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;

          if (req.body.primaryPhone) {
            _context4.next = 3;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: 'Invalid mobile'
          }));

        case 3:
          _context4.next = 5;
          return regeneratorRuntime.awrap(userModel.findOne({
            primaryPhone: req.body.primaryPhone,
            status: 'active'
          }));

        case 5:
          req.user = _context4.sent;

          if (!req.user) {
            _context4.next = 22;
            break;
          }

          if (!(req.user.otp && req.user.otp.createdFor == req.body.verify)) {
            _context4.next = 19;
            break;
          }

          if (!(req.user.otp.code == req.body.otp || envs.MAGIC_OTP == req.body.otp)) {
            _context4.next = 16;
            break;
          }

          if (!(new Date() < new Date(req.user.otp.expiresIn))) {
            _context4.next = 13;
            break;
          }

          next();
          _context4.next = 14;
          break;

        case 13:
          return _context4.abrupt("return", res.status(400).json({
            message: 'OTP Expired'
          }));

        case 14:
          _context4.next = 17;
          break;

        case 16:
          return _context4.abrupt("return", res.status(400).json({
            message: 'Invalid OTP'
          }));

        case 17:
          _context4.next = 20;
          break;

        case 19:
          return _context4.abrupt("return", res.status(400).json({
            message: 'OTP not initialized'
          }));

        case 20:
          _context4.next = 23;
          break;

        case 22:
          return _context4.abrupt("return", res.status(400).json({
            message: 'Account does not exist. Goto signup screen.'
          }));

        case 23:
          _context4.next = 28;
          break;

        case 25:
          _context4.prev = 25;
          _context4.t0 = _context4["catch"](0);
          res.status(400).json({
            message: 'something went wrong',
            error: _context4.t0
          });

        case 28:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 25]]);
}

function validateSocial(req, res, next) {
  var freePlan;
  return regeneratorRuntime.async(function validateSocial$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;

          if (req.body.primaryEmail) {
            _context5.next = 3;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: 'Invalid Email'
          }));

        case 3:
          if (req.body.accessToken) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: 'Invalid Token'
          }));

        case 5:
          if (req.body.platform == 'facebook' || req.body.platform == 'linkedin') {
            req.body.profileVerified = true;
          } else {
            req.body.profileVerified = false;
          }

          _context5.next = 8;
          return regeneratorRuntime.awrap(userModel.findOne({
            primaryEmail: req.body.primaryEmail
          }));

        case 8:
          req.user = _context5.sent;

          if (req.user) {
            _context5.next = 25;
            break;
          }

          _context5.next = 12;
          return regeneratorRuntime.awrap(planModel.findOne({
            planFor: 'membership',
            name: 'Free Plan'
          }));

        case 12:
          freePlan = _context5.sent;

          if (freePlan) {
            _context5.next = 17;
            break;
          }

          _context5.next = 16;
          return regeneratorRuntime.awrap(planModel.create(envs.DEFAULT_FREE_PLAN));

        case 16:
          freePlan = _context5.sent;

        case 17:
          _context5.next = 19;
          return regeneratorRuntime.awrap(userModel.create({
            role: 'user',
            primaryEmail: req.body.primaryEmail,
            plan: freePlan._id,
            profileVerified: req.body.profileVerified,
            oneTimeAllocation: {
              likes: 0,
              superLikes: 1,
              boost: 0
            }
          }));

        case 19:
          req.user = _context5.sent;
          _context5.next = 22;
          return regeneratorRuntime.awrap(sendBirdController.createSendBirdUser(req.user));

        case 22:
          req.sendBirdUser = _context5.sent;
          _context5.next = 26;
          break;

        case 25:
          if (req.body.platform == 'facebook' || req.body.platform == 'linkedin') {
            if (!req.user.profileVerified) {
              try {
                userModel.findOneAndUpdate({
                  profileVerified: true
                }).then(function (resp) {
                  console.log("updated user profileVerified");
                });
              } catch (error) {
                console.log("unable to update user profileVerified");
              }
            }
          }

        case 26:
          if (!(req.user.status == 'active')) {
            _context5.next = 30;
            break;
          }

          next();
          _context5.next = 31;
          break;

        case 30:
          return _context5.abrupt("return", res.status(403).json({
            message: 'Your Account is blocked. Please contact admin.'
          }));

        case 31:
          _context5.next = 36;
          break;

        case 33:
          _context5.prev = 33;
          _context5.t0 = _context5["catch"](0);
          res.status(400).json({
            message: 'something went wrong',
            error: _context5.t0
          });

        case 36:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 33]]);
}

function validateAppleSocial(req, res, next) {
  var appleTokenData, freePlan;
  return regeneratorRuntime.async(function validateAppleSocial$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;

          if (req.body.accessToken) {
            _context6.next = 3;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: 'Invalid Token'
          }));

        case 3:
          appleTokenData = null;
          _context6.prev = 4;
          _context6.next = 7;
          return regeneratorRuntime.awrap(appleSignin.verifyIdToken(req.body.accessToken, {
            audience: envs.APPLE_APP_ID,
            ignoreExpiration: true
          }));

        case 7:
          appleTokenData = _context6.sent;
          _context6.next = 13;
          break;

        case 10:
          _context6.prev = 10;
          _context6.t0 = _context6["catch"](4);
          return _context6.abrupt("return", res.status(400).json({
            message: 'Invalid Token',
            error: _context6.t0
          }));

        case 13:
          if (appleTokenData) {
            _context6.next = 15;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: 'Invalid Token'
          }));

        case 15:
          if (appleTokenData.sub) {
            _context6.next = 17;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: 'Invalid sub'
          }));

        case 17:
          _context6.next = 19;
          return regeneratorRuntime.awrap(userModel.findOne({
            'social.appleUserId': appleTokenData.sub
          }));

        case 19:
          req.user = _context6.sent;

          if (req.user) {
            _context6.next = 34;
            break;
          }

          _context6.next = 23;
          return regeneratorRuntime.awrap(planModel.findOne({
            planFor: 'membership',
            name: 'Free Plan'
          }));

        case 23:
          freePlan = _context6.sent;

          if (freePlan) {
            _context6.next = 28;
            break;
          }

          _context6.next = 27;
          return regeneratorRuntime.awrap(planModel.create(envs.DEFAULT_FREE_PLAN));

        case 27:
          freePlan = _context6.sent;

        case 28:
          _context6.next = 30;
          return regeneratorRuntime.awrap(userModel.create({
            role: 'user',
            primaryEmail: req.body.primaryEmail || appleTokenData.email,
            social: {
              appleUserId: appleTokenData.sub
            },
            plan: freePlan._id,
            oneTimeAllocation: {
              likes: 0,
              superLikes: 1,
              boost: 0
            }
          }));

        case 30:
          req.user = _context6.sent;
          _context6.next = 33;
          return regeneratorRuntime.awrap(sendBirdController.createSendBirdUser(req.user));

        case 33:
          req.sendBirdUser = _context6.sent;

        case 34:
          if (!(req.user.status == 'active')) {
            _context6.next = 38;
            break;
          }

          next();
          _context6.next = 39;
          break;

        case 38:
          return _context6.abrupt("return", res.status(403).json({
            message: 'Your Account is blocked. Please contact admin.'
          }));

        case 39:
          _context6.next = 44;
          break;

        case 41:
          _context6.prev = 41;
          _context6.t1 = _context6["catch"](0);
          res.status(400).json({
            message: 'something went wrong',
            error: _context6.t1
          });

        case 44:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 41], [4, 10]]);
}

middlewares.validateUser = validateUser;
middlewares.validateSignUp = validateSignUp;
middlewares.validateSignIn = validateSignIn;
middlewares.validateOTP = validateOTP;
middlewares.validateSocial = validateSocial;
middlewares.validateAppleSocial = validateAppleSocial;
module.exports = middlewares;