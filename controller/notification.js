var userModel = require('../model/user')
var notificationModel = require('../model/notification')
var mailConfig = require('../config/mail')
var messageConfig = require('../config/message')
var commonController = require('./common')
var controller = {}

async function createNotification(from, to, reason) {
    let response = { mail: false, sms: false, notification: null }
    let r_user = await userModel.findOne({ _id: to })
    let notification = await notificationModel.create({ from: from._id, to: to, reason: reason })
    response.notification = notification._id
    let check = checkSetting(r_user, reason)
    if (r_user && r_user.notificationDevice.indexOf('email') != -1 && r_user.primaryEmail && check) {
        var replacements = {
            "{{firstName}}": r_user.firstName
        }
        var msg = ``
        if (reason == 'match') {
            msg = mailConfig.matchEmail
        } else if (reason == 'message') {
            msg = mailConfig.messageEmail
        } else if (reason == 'super_like') {
            msg = mailConfig.superLikeEmail
        } else if (reason == 'yes') {
            msg = mailConfig.likeEmail
        }
        msg = msg.replace(/{{\w+}}/g, function (all) {
            return replacements[all] || all;
        })
        var mailData = {
            to: r_user.primaryEmail,
            from: 'info@rekindle.club',
            subject: 'Rekindle Notification',
            html: msg,
        }
        try {
            await commonController.sendMail(mailData)
            response.mail = true
        } catch (error) {
            console.error('******** error while sending email ********', error)
        }
    }
    if (r_user && r_user.notificationDevice.indexOf('sms') != -1 && r_user.primaryPhone && check) {
        var replacements = {
            "{{firstName}}": r_user.firstName
        }
        var msg = ``
        if (reason == 'match') {
            msg = messageConfig.match
        } else if (reason == 'super_like') {
            msg = messageConfig.superLike
        } else if (reason == 'message') {
            msg = messageConfig.message
        } else if (reason == 'yes') {
            msg = messageConfig.like
        }
        msg = msg.replace(/{{\w+}}/g, function (all) {
            return replacements[all] || all;
        });
        var msgData = { message: msg, numbers: [r_user.primaryPhone] }
        try {
            await commonController.sendTransSms(msgData)
            response.sms = true
        } catch (error) {
            console.error('******** error while sending sms ********', error)
        }
    }
    return response
}

function checkSetting(user, reason) {
    if (reason == 'match' && user.notificationSettings.matched) {
        return true
    }
    if (reason == 'super_like' && user.notificationSettings.superLiked) {
        return true
    }
    if (reason == 'message' && user.notificationSettings.newMessages) {
        return true
    }
    if (reason == 'yes') {
        return true
    }
    return false
}

controller.createNotification = createNotification
module.exports = controller