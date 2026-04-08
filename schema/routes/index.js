var express = require('express');
var router = express.Router();
var getDate = require('../functions/date.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.status(404).json({
        code: 404,
        message: "Invalid route",
        errorCode: "E01",
        data: {},
        time: getDate()
    });
});

module.exports = router;