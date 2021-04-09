var envs = require('./../config/env')
var iap = require('in-app-purchase');
var controller = {}
let sandBoxFlag = false

if (envs.APPLE_SANDBOX_FLAG == 'true') {
    sandBoxFlag = true
}

iap.config({
    test: envs.APPLE_SANDBOX_FLAG,
    verbose: true
});

function setupApplePayment() {
    return iap.setup()
}

function verifyApplePayment(receipt) {
    return iap.validate(receipt)
}

controller.setupApplePayment = setupApplePayment
controller.verifyApplePayment = verifyApplePayment

module.exports = controller