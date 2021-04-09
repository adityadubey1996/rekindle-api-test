var AWS = require('aws-sdk')
const sgMail = require('@sendgrid/mail')
var fs = require('fs')
var envs = require('./../config/env')
var axios = require('axios').default
var commons = {}

sgMail.setApiKey(envs.SENDGRID_API_KEY)

function checkConsole(req, type, arrayParams) {
    let data = [
        new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata'
        }),
        type,
        req.logId,
        req.originalUrl,
        req.method,
    ]
    if (type == 'INFO') {
        console.log(data.join(' | '), ...arrayParams)
    } else if (type == 'ERROR') {
        console.error(data.join(' | '), ...arrayParams)
    }
}

function sendMail(data) {
    return sgMail.send(data)
}

function fileUpload(file, directory) {
    return new Promise((resolve, reject) => {
        fs.readFile(file.path, function (err, data) {
            if (err) {
                reject(err);
            } else {
                const S3 = new AWS.S3({
                    accessKeyId: envs.AWS_IAM_USER_KEY,
                    secretAccessKey: envs.AWS_IAM_USER_SECRET,
                    Bucket: envs.AWS_PRODUCT_BUCKET,
                });
                S3.createBucket(function () {
                    const params = {
                        ACL: 'public-read',
                        Bucket: envs.AWS_PRODUCT_BUCKET + `/${directory}`,
                        Key: file.filename,
                        ContentType: file.mimetype,
                        ContentEncoding: file.encoding,
                        Body: data,
                    };
                    S3.upload(params, function (err, url) {
                        fs.unlink(file.path, function (err) {
                            if (err) {
                                reject(err);
                            }
                        });
                        if (err) {
                            reject(err);
                        } else {
                            if (url.Location.indexOf(envs.AWS_S3_REGION) == -1) {
                                url.Location = url.Location.replace(envs.AWS_S3_WITHOUT_REGION_DOMAIN, envs.AWS_CDN_DOMAIN)
                            } else {
                                url.Location = url.Location.replace(envs.AWS_S3_WITH_REGION_DOMAIN, envs.AWS_CDN_DOMAIN)
                            }
                            resolve(url.Location);
                        }
                    });
                });
            }
        });
    });
}

function sendOTPSms(data) {
    let body = {
        apikey: envs.OTP_SMS_API_KEY,
        number: data.numbers,
        message: data.message,
        senderId: envs.SMS_API_SENDER_ID,
        "templateId": "1707161130464243591"
    }
    return axios.post(envs.SMS_API_END_POINT, body)
}

function sendTransSms(data) {
    let body = {
        number: data.numbers,
        message: data.message,
        senderId: envs.SMS_API_SENDER_ID
    }
    return axios.post(envs.SMS_API_END_POINT, body, {
        headers: {
            apikey: envs.TRANS_SMS_API_KEY,
            "templateId": "1707161130464243591"
        }
    })
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000)
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function genRandDecimal(min, max, decimalPlaces) {
    var rand = Math.random() < 0.5 ? ((1 - Math.random()) * (max - min) + min) : (Math.random() * (max - min) + min);  // could be min or max or anything in between
    var power = Math.pow(10, decimalPlaces);
    return Math.floor(rand * power) / power;
}

function getRandomFromArray(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        return [arr[0], arr[1], arr[2]]
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}
function distanceLatLng(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist.toFixed(3);
    }
}
function generateReferralCode() {
    const str_result = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
    let parts = str_result.split('');
    for (let i = parts.length; i > 0;) {
        let random = parseInt(Math.random() * i);
        let temp = parts[--i];
        parts[i] = parts[random];
        parts[random] = temp;
    }
    return parts.join('').substring(0, 6);
}

commons.fileUpload = fileUpload
commons.sendOTPSms = sendOTPSms
commons.generateOTP = generateOTP
commons.sendTransSms = sendTransSms
commons.randomIntFromInterval = randomIntFromInterval
commons.getRandomFromArray = getRandomFromArray
commons.genRandDecimal = genRandDecimal
commons.sendMail = sendMail
commons.checkConsole = checkConsole
commons.distanceLatLng = distanceLatLng
commons.generateReferralCode = generateReferralCode

module.exports = commons