var userModel = require('./../model/user')
var seederData = require('./../config/seeder')
var moment = require('moment')
var sendBirdController = require('./sendBird')
const { randomIntFromInterval, getRandomFromArray, genRandDecimal } = require('./../controller/common')
var userCount = 500
var controller = {}

async function createUser() {
    let startCount = await userModel.countDocuments({})
    startCount++;
    let newUsers = []
    for (i = 0; i < userCount; i++) {
        newUsers.push(getUser(startCount))
        startCount++;
    }
    try {
        var creationResponse = await userModel.create(newUsers)
        console.log('created data in our DB')
        createSendBirdUser(creationResponse)
    } catch (error) {
        console.log('error in creating data', error)
    }
}

async function createSendBirdUser(users) {
    try {
        // let responses = await sendBirdController.createSendBirdUsersBulk(users)
        console.log("users created on send bird server")
    } catch (error) {
        console.log(error)
    }
}

function getUser(userCount) {
    let user = { ...seederData.userDummyObject }
    user.firstName = `User ${userCount}`
    user.primaryPhone = randomIntFromInterval(9000000000, 9999999999)
    // user.gender = seederData.genders[1]
    user.gender = seederData.genders[randomIntFromInterval(0, 1)]
    user.dateOfBirth = `${randomIntFromInterval(1931, 2001)}-${randomIntFromInterval(10, 12)}-${randomIntFromInterval(10, 30)}`
    user.age = moment().diff(moment(user.dateOfBirth), 'years')
    user.relationshipStatus = seederData.relationshipArray[randomIntFromInterval(0, 5)]
    user.childrenStatus.status = seederData.childrenArray[randomIntFromInterval(0, 1)]
    user.highestEducation = seederData.educationArray[randomIntFromInterval(0, 5)]
    user.interestedIn = seederData.interestArray[randomIntFromInterval(0, 1)]
    user.profession = seederData.professionArray[randomIntFromInterval(0, 3)]
    user.thingsThatDescribeYou = getRandomFromArray(seederData.thingsDescribeArray, 3)
    user.thingsYouLove = getRandomFromArray(seederData.thingsLoveArray, 3)
    user.thingsYouHate = getRandomFromArray(seederData.thingsHateArray, 3)
    if (user.gender == 'male') {
        user.profilePic = seederData.profilePicMaleArray[randomIntFromInterval(0, 2)]
        user.images = seederData.profilePicMaleArray
    } else {
        user.profilePic = seederData.profilePicFemaleArray[randomIntFromInterval(0, 2)]
        user.images = seederData.profilePicFemaleArray
    }
    if (user.childrenStatus.status == 'yes') {
        user.childrenStatus.count = randomIntFromInterval(1, 3)
    }
    let assignedLocationObject = seederData.locationArray[1]
    // let assignedLocationObject = seederData.locationArray[randomIntFromInterval(0, 1)]
    user.location.state = assignedLocationObject.state
    user.location.city = assignedLocationObject.city
    user.loc = {
        type: "Point",
        coordinates: [genRandDecimal(seederData.cityCoordsRange[assignedLocationObject.city].long[0], seederData.cityCoordsRange[assignedLocationObject.city].long[1], 6), genRandDecimal(seederData.cityCoordsRange[assignedLocationObject.city].lat[0], seederData.cityCoordsRange[assignedLocationObject.city].lat[1], 6)]
    }
    return user
}

controller.createUser = createUser

module.exports = controller