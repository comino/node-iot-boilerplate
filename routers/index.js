var express = require('express');
var router = express.Router();

//var authDevice =  require("../middleware/authDevice");
//var device = require( "../controllers/v0/device.js");


router.get('/', function (req, res, next) {
    var quotes = [
        "If my answers frighten you then you should cease asking scary questions.",
        "Play with matches, you get burned.",
        "Any time of the day is a good time for pie",
        "Besides, isn’t it more exciting when     you don’t have permission?",
    ];
    res.json(
        {
            "success": true,
            "quote": quotes[Math.floor(Math.random() * 4)]
        }
    );
});

router.all('/check', function (req, res, next) {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
        success: true,
        message: 'System online'
    }));
});

//  router.post("/v0/devices/:devID/data",                [authDevice], device.sendData);

//router.post( '/login',   auth.login);
//router.post( '/signup',  auth.signup);

//router.post( '/v0/devices', device.addToUser);


module.exports = router;
