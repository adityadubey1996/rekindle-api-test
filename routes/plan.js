var express = require('express');
var router = express.Router();
var contactUsModel = require('./../model/contactUs')
var planModel = require('./../model/purchasePlans')

router.get('/', async function (req, res) {
    try {
        let plans = await planModel.find({ planFor: req.query.planFor })
        res.status(200).json(plans)
    } catch (error) {
        res.status(500).json({ error: error, message: 'something went wrong' })
    }
})

router.post('/interest', async function (req, res) {
    try {
        await contactUsModel.create({
            user: req.user._id,
            reason: 'vip_service',
            status: 'New',
            trails: [{
                status: 'New',
                remark: '',
                createdOn: new Date()
            }]
        })
        res.status(204).json({})
    } catch (error) {
        res.status(500).json({ message: 'something went wrong', error: error })
    }
})

module.exports = router;
