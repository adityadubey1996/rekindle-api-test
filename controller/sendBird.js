var axios = require('axios').default
var envs = require('./../config/env')
var controller = {}
var sendBirdHeader = {
    'Api-Token': envs.SENDBIRD_APP_SECONDARY_TOKEN
}

function deleteSendBirdUser(data) {
    return axios.delete(envs.SENDBIRD_APP_URL + `/users/${data.userId}`, { headers: sendBirdHeader })
}

function deleteSendBirdChat(data) {
    return axios.delete(envs.SENDBIRD_APP_URL + `/group_channels/${data.channelUrl}`, { headers: sendBirdHeader })
}

function unmuteSendBirdUser(data) {
    return axios.delete(envs.SENDBIRD_APP_URL + `/group_channels/${data.channelUrl}/mute/${data.userId}`, { headers: sendBirdHeader })
}

function muteSendBirdUser(data) {
    let body = {
        "user_id": data.userId,
    }
    return axios.post(envs.SENDBIRD_APP_URL + `/group_channels/${data.channelUrl}/mute`, body, { headers: sendBirdHeader })
}

function clearSendBirdChat(data) {
    let body = {
        "user_id": data.userId,
    }
    return axios.put(envs.SENDBIRD_APP_URL + `/group_channels/${data.channelUrl}/reset_user_history`, body, { headers: sendBirdHeader })
}

function hideSendBirdChat(data) {
    let body = {
        "user_id": data.userId,
    }
    return axios.put(envs.SENDBIRD_APP_URL + `/group_channels/${data.channelUrl}/hide`, body, { headers: sendBirdHeader })
}

function createSendBirdChat(data) {
    let body = {
        "name": `${data.match._id}_chat`,
        "cover_url": "https://dxstmhyqfqr1o.cloudfront.net/sample/cover/cover_08.jpg",
        "custom_type": "Private Chat",
        "is_distinct": true,
        "user_ids": data.users,
        "channel_url": data.match._id
    }
    return axios.post(envs.SENDBIRD_APP_URL + `/group_channels`, body, { headers: sendBirdHeader })
}

function updateSendBirdUser(user) {
    let body = {
        nickname: user.firstName,
        profile_url: user.profilePic
    }
    return axios.put(envs.SENDBIRD_APP_URL + `/users/${user._id}`, body, { headers: sendBirdHeader })
}

function createSendBirdUser(user) {
    let body = {
        user_id: user._id,
        nickname: user.firstName,
        profile_url: user.profilePic
    }
    return axios.post(envs.SENDBIRD_APP_URL + '/users', body, { headers: sendBirdHeader })
}

function createSendBirdUsersBulk(users) {
    let promises = []
    users.forEach(item => {
        let body = {
            user_id: item._id,
            nickname: item.firstName,
            profile_url: item.profilePic
        }
        promises.push(
            axios.post(envs.SENDBIRD_APP_URL + '/users', body, { headers: sendBirdHeader })
        )
    })
    return Promise.all(promises)
}

controller.createSendBirdUsersBulk = createSendBirdUsersBulk
controller.createSendBirdUser = createSendBirdUser
controller.updateSendBirdUser = updateSendBirdUser
controller.createSendBirdChat = createSendBirdChat
controller.hideSendBirdChat = hideSendBirdChat
controller.clearSendBirdChat = clearSendBirdChat
controller.unmuteSendBirdUser = unmuteSendBirdUser
controller.muteSendBirdUser = muteSendBirdUser
controller.deleteSendBirdChat = deleteSendBirdChat
controller.deleteSendBirdUser = deleteSendBirdUser

module.exports = controller