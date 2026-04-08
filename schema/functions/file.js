const fs = require('fs');
const sqlite3 = require('sqlite3');
const filePath = './tempFiles/';

async function generateFiles(sqlString, projectName, timeToLive = 1000 * 60 * 10) { // default to 10 mins
    // response object
    var res = {
        failed: false,
        code: "",
        message: "",
        fileName: "",
        httpCode: 0
    };

    function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
    }

    // get nextID and increment
    var info = await JSON.parse(fs.readFileSync(`${filePath}fileInfo.json`, 'utf-8'));
    var id = info.nextID;
    info.nextID = info.nextID + 1;

    var fileName = projectName + '-' + id;

    // add deleteTimes for the current fileNames
    info.deleteTimes.push({
        fileName: fileName,
        deleteTime: Date.now() + timeToLive
    })
    
    // create new db
    var newdb = new sqlite3.Database(`${filePath}${fileName}.db`, (err) => {
        if (err) {
            res.failed = true;
            res.code = "V00";
            res.message = "Server Error";
            res.httpCode = 500;
        }
    });

    await sleep(500);
    if (res.failed) return res;

    // run the sql
    newdb.exec(sqlString, (err) => {
        if (err) {
            res.failed = true;
            res.code = "V01";
            res.message = "Got sql error when inserting the schema: " + err.message;
            res.httpCode = 400;
        }
    });
    newdb.close();

    await sleep(500);
    if (res.failed) {
        // if it failed here the database must be deleted
        if (fs.existsSync(`${filePath}${fileName}.db`)) {
            fs.unlinkSync(`${filePath}${fileName}.db`)
        }
        return res;
    }

    try {
        // create sql file
        fs.writeFileSync(`${filePath}${fileName}.sql`, sqlString);

        // write to info file
        fs.writeFileSync(`${filePath}fileInfo.json`, JSON.stringify(info));
    } catch (err) {
        res.failed = true;
        res.code = "F00";
        res.message = "Server Error";
        res.httpCode = 500;
        return res;
    }

    res.fileName = fileName;
    return res;
}

async function deleteFiles() {
    // delete all files past the delete time specified in fileInfo
    var info = await JSON.parse(fs.readFileSync(`${filePath}fileInfo.json`, 'utf-8'));
    var keep = [];
    const date = Date.now();
    for (var item of info.deleteTimes) {
        if (item.deleteTime < date) {
            // delete files
            try {
                if (fs.existsSync(`${filePath}${item.fileName}.db`)) {
                    fs.unlinkSync(`${filePath}${item.fileName}.db`)
                }
                if (fs.existsSync(`${filePath}${item.fileName}.sql`)) {
                    fs.unlinkSync(`${filePath}${item.fileName}.sql`)
                }
            } catch (err) {
                console.log("Error deleting temp files: " + err);
                throw {code: "F00", message: "Server Error", httpCode: 500};
            }
        } else {
            // add the item to the new array to be kept in fileInfo
            keep.push(item)
        }
    }
    info.deleteTimes = keep;
    try {
        fs.writeFileSync(`${filePath}fileInfo.json`, JSON.stringify(info));
    } catch (err) {
        console.log("Error writing to file: " + err);
        throw {code: "F00", message: "Server Error", httpCode: 500};
    }
}

module.exports = {generateFiles, deleteFiles};