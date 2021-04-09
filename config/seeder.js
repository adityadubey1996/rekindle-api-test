module.exports = {
    genders: ['male', 'female'],
    relationshipArray: ["annulled", "seperated", "awaiting divorce", "divorced", "widowed", "other"],
    childrenArray: ['yes', 'no'],
    educationArray: ['Masters', 'Graduate', 'Doctorate', "Bachelor's", "Primary Education", "Secondary education"],
    interestArray: ['male', 'female'],
    locationArray: [{ state: 'delhi', city: 'new delhi' }, { state: 'karnataka', city: 'bengaluru' }],
    cityCoordsRange: {
        "new delhi": {
            lat: [28.543020, 28.775594],
            long: [76.989260, 77.340823]
        },
        "bengaluru": {
            lat: [12.861582, 13.105799],
            long: [77.463433, 77.705132]
        }
    },
    professionArray: ['engineer', 'doctor', 'teacher', 'lawyer'],
    profilePicMaleArray: [
        'https://d3o0xx818knfo1.cloudfront.net/images/1601562652653_dexter.jpg',
        'https://d3o0xx818knfo1.cloudfront.net/images/1601563384471_jack_sparrow.jpg',
        'https://d3o0xx818knfo1.cloudfront.net/images/1601564180123_lucifer.jpg'
    ],
    profilePicFemaleArray: [
        'https://d3o0xx818knfo1.cloudfront.net/images/1601563779772_hannah%20mckay.jpg',
        'https://d3o0xx818knfo1.cloudfront.net/images/1601564129302_nun.jpeg',
        'https://d3o0xx818knfo1.cloudfront.net/images/1601564297505_conjuring.jpg'
    ],
    thingsLoveArray: [
        'Adventure',
        'Alcohol',
        'Chocolates',
        'Food',
        'Movies',
        'Photography'
    ],
    thingsDescribeArray: [
        'Ambitious',
        'Considerate',
        'Hilarious',
        'Affable',
        'Adaptable',
        'Cheerful'
    ],
    thingsHateArray: [
        'Politics',
        'Alcohol',
        'Cooking',
        'God',
        'Liars',
        'Judgemental'
    ],
    userDummyObject: {
        "loc": {
            "type": "Point",
            "coordinates": [
                76.1521755,
                30.3796725
            ]
        },
        "exploreFilter": {
            "distance": 73000,
            "ageFrom": 18,
            "ageTo": 60,
            "thingsIHate": true,
            "thingsILove": true,
            "hasChildren": false,
            "relationshipStatus": [
                "annulled",
                "seperated",
                "awaiting divorce",
                "divorced",
                "widowed",
                "other"
            ]
        },
        "firstName": "Bir2",
        "emailVerified": false,
        "phoneVerified": true,
        "onBoardProcessCount": 12,
        "userTutorialStatus": true,
        "status": "active",
        "role": "user",
        "thingsThatDescribeYou": [
            "Adaptable",
            "Affable",
            "Ambitious"
        ],
        "thingsYouLove": [
            "Adventure",
            "Airport",
            "Alcohol"
        ],
        "thingsYouHate": [
            "Late Replies",
            "Politics",
            "Alcohol"
        ],
        "images": [
            "https://d3o0xx818knfo1.cloudfront.net/images/1605962864541_faff09e9-2329-4130-a88e-b76c7000c133.jpg"
        ],
        "profilePic": "https://d3o0xx818knfo1.cloudfront.net/images/1605962864541_faff09e9-2329-4130-a88e-b76c7000c133.jpg",
        "blockedBy": [],
        "notificationDevice": [
            "email",
            "sms",
            "in_app"
        ],
        // "_id": "5fb90bcab505de38bfa8c7be",
        "primaryPhone": "9465024235",
        "plan": {
            "like": 100,
            "boost": 100,
            "super_like": 100,
            "_id": "5fb6a535ceff777d8839aedb",
            "name": "Free Plan",
            "description": "some description here",
            "amount": 0,
            "planFor": "membership",
            "createdAt": "2020-11-19T17:02:45.607Z",
            "updatedAt": "2020-11-19T17:02:45.607Z",
            "__v": 0
        },
        "otp": {
            "code": 111111,
            "expiresIn": "2020-11-21T15:37:45.602Z",
            "createdFor": "none"
        },
        "age": 19,
        "dateOfBirth": "2001-11-21T12:43:56.349Z",
        "gender": "female",
        "interestedIn": "male",
        "childrenStatus": {
            "count": 0,
            "status": "no"
        },
        "relationshipStatus": "annulled",
        "location": {
            "city": "Nabha",
            "country": "India",
            "state": "Punjab"
        },
        "highestEducation": "No Formal Education",
        "profession": "Administrative Services"
    }
}