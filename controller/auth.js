var jsonwebtoken = require('jsonwebtoken')
var bcrypt = require('bcryptjs');
var envs = require('../config/env')

var controller = {}

function encryptString(string) {
    return bcrypt.hashSync(string, envs.BCRYPT_SALT);
}

function compareEncryptedString(string, hash) {
    return bcrypt.compareSync(string, hash);
}

function createAccessToken(payload) {
    return jsonwebtoken.sign(payload, envs.JWT_ACCESS_TOKEN_PRIVATE_KEY, { issuer: envs.JWT_ISSUER, audience: envs.JWT_ACCESS_TOKEN_AUDIENCE, expiresIn: envs.JWT_ACCESS_TOKEN_EXPIRE })
}

function validateToken(token) {
    let payload = null
    try {
        payload = jsonwebtoken.verify(token, envs.JWT_ACCESS_TOKEN_PRIVATE_KEY, { issuer: envs.JWT_ISSUER, audience: envs.JWT_ACCESS_TOKEN_AUDIENCE, ignoreExpiration: true })
    } catch (catchError) {
        payload = null
    }
    return payload
}

controller.createAccessToken = createAccessToken
controller.validateToken = validateToken
controller.encryptString = encryptString
controller.compareEncryptedString = compareEncryptedString

module.exports = controller