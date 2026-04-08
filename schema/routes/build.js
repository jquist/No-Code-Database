var express = require('express');
var router = express.Router();
var file = require('../functions/file.js');
var sql = require('../functions/sql.js');
var getDate = require('../functions/date.js');
var path = require('path');

router.post('/', async (req, res, next) => {
    try {
        var {data} = req.body;
        var ProjectName = data.projectName;
        var canvas = data.canvas;
    }catch (err){
        return res.status(400).json({
            code: 400,
            message: err.message,
            errorCode: "S00",
            data: {}, // can send back additional data later
            time: getDate(),
        });
    }

    try {
        var SqlString = await sql.generateSQL(canvas)
    } catch(err) {
        const statusCode = err.httpCode || 500;
        return res.status(statusCode).json({
            code: statusCode,
            message: err.message || 'Unable to generate SQL from canvas data',
            errorCode: err.code || 'SQL_GENERATION_FAILED',
            data: err.data || {},
            time: getDate(),
        });
    }
    try {
        var result = await file.deleteFiles()
    }catch(err) {
        const statusCode = err.httpCode || 500;
        return res.status(statusCode).json({
            code: statusCode,
            message: err.message || 'Unable to clean temporary files',
            errorCode: err.code || 'FILE_DELETE_FAILED',
            data: {}, // can send back additional data later
            time: getDate(),
        });
    }
    
    var result = await file.generateFiles(SqlString, ProjectName, 0) // placeholder ttl value
    if (result.failed == true) {
        if (result.code == "V00") {
        const statusCode = result.httpCode || 400;
        return res.status(statusCode).json({
            code: statusCode,
            message: result.message || 'Validation failed',
            errorCode: result.code || 'VALIDATION_ERROR',
            data: {}, // can send back additional data later
                time: getDate(),
            });
        } else if (result.code == "V01") {
            const statusCode = result.httpCode || 400;
            return res.status(statusCode).json({
                code: statusCode,
                message: result.message || 'Validation failed',
                errorCode: result.code || 'VALIDATION_ERROR',
                data: {}, // can send back additional data later
                time: getDate(),
            });
        }
    }

    return res.status(200).json({
        code: 200,
        message: "Files generated successfully",
        errorCode: "",
        data: {fileName: result.fileName},
        time: getDate()
    })

});

router.get('/DB', async (req, res, next) => {
    const fileName = typeof req.query.fileName === "string" && req.query.fileName.trim()
        ? req.query.fileName.trim()
        : (req.body?.data?.fileName || "");

    if (!fileName) {
        return res.status(400).json({
            code: 400,
            message: "File name is required",
            errorCode: "S00",
            data: {},
            time: getDate(),
        });
    }

    const resolvedPath = path.resolve("tempFiles/" + fileName + ".db");
    res.sendFile(resolvedPath, function (err) {
        if (err) {
            return res.status(400).json({
                code: 400,
                message: "Error sending Files",
                errorCode: "F00",
                data: err, // can send back additional data later
                time: getDate(),
            });
        }
    });
});

router.get('/SQL', async (req, res, next) => {
    const fileName = typeof req.query.fileName === "string" && req.query.fileName.trim()
        ? req.query.fileName.trim()
        : (req.body?.data?.fileName || "");

    if (!fileName) {
        return res.status(400).json({
            code: 400,
            message: "File name is required",
            errorCode: "S00",
            data: {},
            time: getDate(),
        });
    }

    const resolvedPath = path.resolve("tempFiles/" + fileName + ".sql");
    res.sendFile(resolvedPath, function (err) {
        if (err) {
            return res.status(400).json({
                code: 400,
                message: "Error sending Files",
                errorCode: "F00",
                data: err, // can send back additional data later
                time: getDate(),
            });
        }
    });
});

module.exports = router;

