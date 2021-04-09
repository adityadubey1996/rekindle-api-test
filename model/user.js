var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    firstName: { type: String, default: 'User' },
    primaryEmail: { type: String },
    emailVerified: { type: Boolean, default: false },
    primaryPhone: { type: String, },
    phoneVerified: { type: Boolean, default: false },
    profileVerified: { type: Boolean, default: false },
    onBoardProcessCount: { type: Number, default: 1 },
    userTutorialStatus: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'delete', 'block'], default: 'active' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    location: {
        type: {
            country: String,
            state: String,
            city: String,
            lat: String,
            long: String
        }
    },
    loc: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        }
    },
    gender: { type: String, enum: ['male', 'female'] },
    interestedIn: { type: String, enum: ['male', 'female'] },
    dateOfBirth: { type: Date },
    age: { type: Number },
    relationshipStatus: { type: String, enum: ['annulled', 'separated', 'awaiting divorce', 'divorced', 'widowed', 'other'] },
    childrenStatus: {
        type: {
            status: { type: String, enum: ['yes', 'no'] },
            count: { type: Number, default: 0 }
        }
    },
    highestEducation: { type: String },
    profession: { type: String },
    thingsThatDescribeYou: { type: [String] },
    thingsYouLove: { type: [String] },
    thingsYouHate: { type: [String] },
    companyName: { type: String },
    religion: { type: String },
    motherTongue: { type: String },
    height: { type: String },
    images: { type: [String] },
    profilePic: { type: String, default: 'https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png' },
    otp: {
        type: {
            code: String,
            expiresIn: Date,
            createdFor: String
        }
    },
    exploreFilter: {
        distance: { type: Number, default: 20000 },
        ageFrom: { type: Number, default: 18 },
        ageTo: { type: Number, default: 60 },
        thingsIHate: { type: Boolean, default: false },
        thingsILove: { type: Boolean, default: false },
        hasChildren: { type: Boolean, default: false },
        relationshipStatus: { type: [String], default: ['annulled', 'separated', 'awaiting divorce', 'divorced', 'widowed', 'other'] }
    },
    blockedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'users'
    },
    notificationSettings: {
        matched: { type: Boolean, default: true },
        superLiked: { type: Boolean, default: true },
        newMessages: { type: Boolean, default: true },
        specialOffers: { type: Boolean, default: true },
    },
    notificationDevice: {
        type: [String],
        default: ["email", "sms", "in_app"]
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'plans',
        required: true
    },
    boostStart: {
        type: Date
    },
    boostEnd: {
        type: Date
    },
    social: {
        type: {
            appleUserId: { type: String }
        }
    },
    oneTimeAllocation: {
        likes: { type: Number, default: 0 },
        superLikes: { type: Number, default: 1 },
        boost: { type: Number, default: 0 }
    },
    referralCode: { type: String },
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: false },
    
}, { timestamps: true })

schema.index({ loc: '2dsphere' })

module.exports = DB.model('users', schema)