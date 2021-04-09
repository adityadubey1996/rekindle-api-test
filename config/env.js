var updateEnv = []
var envs = {
    PROTOCOL: process.env.PROTOCOL,
    HOST: process.env.HOST,
    PORT: parseInt(process.env.PORT),

    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_CLUSTER: process.env.DB_CLUSTER,
    DB_DATABASE: process.env.DB_DATABASE,

    JWT_ACCESS_TOKEN_PRIVATE_KEY: process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY,
    JWT_ISSUER: process.env.JWT_ISSUER,
    JWT_ACCESS_TOKEN_AUDIENCE: process.env.JWT_ACCESS_TOKEN_AUDIENCE,
    JWT_ACCESS_TOKEN_EXPIRE: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRE),

    BCRYPT_SALT: process.env.BCRYPT_SALT,

    AWS_IAM_USER_KEY: process.env.AWS_IAM_USER_KEY,
    AWS_IAM_USER_SECRET: process.env.AWS_IAM_USER_SECRET,
    AWS_PRODUCT_BUCKET: process.env.AWS_PRODUCT_BUCKET,
    AWS_CDN_DOMAIN: "d3o0xx818knfo1.cloudfront.net",
    AWS_S3_WITH_REGION_DOMAIN: "rekindle.s3.us-east-2.amazonaws.com",
    AWS_S3_WITHOUT_REGION_DOMAIN: "rekindle.s3.amazonaws.com",
    AWS_S3_REGION: "us-east-2",

    SMS_API_END_POINT: "https://smsapi.edumarcsms.com/api/v1/sendsms",
    OTP_SMS_API_KEY: process.env.OTP_SMS_API_KEY,
    PROMO_SMS_API_KEY: process.env.PROMO_SMS_API_KEY,
    TRANS_SMS_API_KEY: process.env.TRANS_SMS_API_KEY,
    SMS_API_SENDER_ID: process.env.SMS_API_SENDER_ID,
    MAGIC_OTP: 806828,

    SENDBIRD_APP_URL: `https://api-${process.env.SENDBIRD_APP_ID}.sendbird.com/v3`,
    SENDBIRD_APP_ID: process.env.SENDBIRD_APP_ID,
    SENDBIRD_APP_MASTER_TOKEN: process.env.SENDBIRD_APP_MASTER_TOKEN,
    SENDBIRD_APP_SECONDARY_TOKEN: process.env.SENDBIRD_APP_SECONDARY_TOKEN,

    PAYTM_KEY: process.env.PAYTM_KEY,

    PAYMENTS_TYPE: ['one-time', 'subscription'],
    PAYMENTS_FOR: ['boost', 'super_like', 'membership'],

    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,

    BOOST_DURATION_MINUTES: 30,

    CASHFREE_TOKEN_URL: process.env.CASHFREE_TOKEN_URL,
    CASHFREE_CLIENT_ID: process.env.CASHFREE_CLIENT_ID,
    CASHFREE_CLIENT_SECRET: process.env.CASHFREE_CLIENT_SECRET,
    CASHFREE_CRED_TYPE: process.env.CASHFREE_CRED_TYPE,

    APPLE_APP_ID: process.env.APPLE_APP_ID,

    APPLE_SANDBOX_FLAG: process.env.APPLE_SANDBOX_FLAG,

    PLAN_EXPIRE_DURATION: process.env.PLAN_EXPIRE_DURATION,
    PLAN_EXPIRE_COUNT: parseInt(process.env.PLAN_EXPIRE_COUNT),

    PROFILE_FIELDS: [
        'firstName',
        'location',
        'coordinates',
        'age',
        'images',
        'profilePic',
        'thingsYouLove',
        'thingsYouHate',
        'highestEducation',
        'profession',
        'childrenStatus',
        'thingsThatDescribeYou',
        'relationshipStatus',
        'notificationSettings',
        'notificationDevice',
        'plan',
        'profileVerified',
        'height',
        'motherTongue',
        'religion',
        'companyName',
        'referralCode'
    ],
    USERS_LIST_FIELDS: [
        'firstName',
        'age',
        'profilePic',
        'thingsYouLove',
        'thingsYouHate',
        'thingsThatDescribeYou',
        'relationshipStatus',
        'loc',
        'primaryPhone'
    ]

}

trimmer(envs)

envs.DEFAULT_FREE_PLAN = {
    "name": "Free Plan",
    "description": "some description here",
    "amount": 0,
    "like": 20,
    "boost": 0,
    "super_like": 0,
    "planFor": "membership"
}

if (updateEnv.length > 0) {
    console.error(`##################### update the below env variable ##################`);
    console.error(updateEnv)
    console.error(`##################### update the above env variable ##################`);
    process.exit(1)
}

module.exports = envs;

function trimmer(obj) {
    Object.keys(obj).forEach(item => {
        if (typeof (obj[item]) == 'object') {
            trimmer(obj[item])
        } else if (typeof (obj[item]) == 'string') {
            obj[item] = obj[item].trim()
        }
        if ((obj[item] == undefined) || (obj[item] == null) || (!obj[item])) {
            updateEnv.push(item)
        }
    })
}