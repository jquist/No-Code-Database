
// -----TEST IS CURRENTLY EXCLUDED, RUN ROUTE TEST INSTEAD-----//

const fs = require('fs');
const filePath = './tempFiles/';
const fileFunctions = require('../functions/file');
const { fail } = require('assert');

describe("File generation tests", () => {
    
    beforeAll(async () => {
        //await fileFunctions.deleteFiles();
        //fs.writeFileSync(`${filePath}fileInfo.json`, JSON.stringify({"nextID":0,"deleteTimes":[]}));
    })

    test("Test database and sql file is generated + delete after", async () => {
        const exampleSQL = "CREATE TABLE test(id int, name varchar(225));";

        var response = (await fileFunctions.generateFiles(exampleSQL, "TestProject", 0)); // timeToLive set to 0 for test
        if (response.failed) fail();
        var fileName = response.fileName;
        console.log(fileName);
        var fileSQL = fs.readFileSync(`${filePath}${fileName}.sql`, 'utf-8');
        await expect(fileSQL).toBe(exampleSQL);

        // sleep function so db file can properly close
        function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
        }
        await sleep(500);
        
        await fileFunctions.deleteFiles();
        await expect(fs.existsSync(`${filePath}${fileName}.sql`)).toBe(false);
    });

    test("Test invalid sql being inserted", async () => {
        const invalidSQL = "CREATE TABLE test?(id int, name varchar(225));";
        
        var response = await fileFunctions.generateFiles(invalidSQL, "TestProject", 0); // timeToLive set to 0 for test
        if (response.failed) {
            return expect(response.code).toBe("V01");
        }
        fail();
    });
});
