const valFunctions = require('../functions/validation');
const { fail } = require('assert');

describe("Validation tests", () => {
    
    beforeAll(async () => {
    })

    test("Test correct field", async () => {
        var list = [
            {name: "1", type: "INT", constraints: [], values: []},
            {name: "2", type: "BOOLEAN", constraints: [], values: []},
            {name: "3", type: "DATETIME", constraints: [], values: []},
            {name: "4", type: "NUMERIC", constraints: [], values: []},
            {name: "5", type: "TEXT", constraints: [], values: []}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test correct field with parameters", async () => {
        var list = [
            {name: "1", type: "DECIMAL(4, 2)", constraints: [], values: []},
            {name: "2", type: "DECIMAL(4,2)", constraints: [], values: []},
            {name: "3", type: "CHARACTER(255)", constraints: [], values: []},
            {name: "4", type: "VARCHAR(20)", constraints: [], values: []}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test correct field with constraints", async () => {
        var list = [
            {name: "1", type: "INT", constraints: ["UNIQUE", "PRIMARY KEY"], values: []},
            {name: "2", type: "BOOLEAN", constraints: ["NOT NULL"], values: []},
            {name: "3", type: "DATETIME", constraints: ["DEFAULT 25"], values: []}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test correct field with constraints", async () => {
        var list = [
            {name: "1", type: "INT", constraints: ["UNIQUE", "PRIMARY KEY"], values: []},
            {name: "2", type: "BOOLEAN", constraints: ["NOT NULL"], values: []},
            {name: "3", type: "DATETIME", constraints: ["DEFAULT 25"], values: []}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test incorrect field", async () => {
        var list = [
            {name: "1", type: "FAKEFEILD", constraints: [], values: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V05");
        }
    });
    test("Test incorrect parameter usage", async () => {
        var list = [
            {name: "1", type: "INT(200)", constraints: [], values: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V03");
        }
        var list = [
            {name: "1", type: "DECIMAL(200)", constraints: [], values: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V04");
        }
        var list = [
            {name: "1", type: "VARCHAR(200,10)", constraints: [], values: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V04");
        }
        var list = [
            {name: "1", type: "VARCHAR(abc)", constraints: [], values: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V04");
        }
        var list = [
            {name: "1", type: "VARCHAR200", constraints: [], values: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V05");
        }
        var list = [
            {name: "1", type: "VARCHAR", constraints: [], values: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            console.log(err);
            await expect(err.code).toBe("V05");
        }
    });
    test("Test incorrect constraint usage", async () => {
        var list = [
            {name: "1", type: "INT", constraints: ["FAKECONSTR"], values: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V06");
        }
        var list = [
            {name: "1", type: "INT", constraints: ["DEFAULT"], values: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V06");
        }
        var list = [
            {name: "1", type: "INT", constraints: ["NOT NULL 5"], values: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V06");
        }
    });
    test("Test correct value types", async () => {
        var list = [
            {name: "1", type: "INT", constraints: [], values: ["0","500","11","0"]},
            {name: "2", type: "BOOLEAN", constraints: [], values: ["0","1"]},
            {name: "3", type: "DATETIME", constraints: [], values: ["2025-12-11 15:20:11"]},
            {name: "4", type: "NUMERIC", constraints: [], values: ["5000","0.1","2"]},
            {name: "5", type: "TEXT", constraints: [], values: ["test", "tester", "testing", "test"]}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test correct parameter value types", async () => {
        var list = [
            {name: "1", type: "DECIMAL(4,2)", constraints: [], values: ["22.22","1.1","22.1","1.22"]},
            {name: "2", type: "CHARACTER(255)", constraints: [], values: ["hi", "hello", "good day"]}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test duplicate unique value", async () => {
        var list = [
            {name: "1", type: "INT", constraints: ["PRIMARY KEY"], values: ["1","1"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V10");
        }
        var list = [
            {name: "2", type: "INT", constraints: ["UNIQUE"], values: ["1","1"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V10");
        }
    });
    test("Test null notnull value", async () => {
        var list = [
            {name: "1", type: "INT", constraints: ["PRIMARY KEY"], values: [null,"1"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V10");
        }
        var list = [
            {name: "2", type: "INT", constraints: ["NOT NULL"], values: ["null","1"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V10");
        }
    });
    test("Test incorrect value types", async () => {
        var list = [
            {name: "1", type: "INT", constraints: [], values: ["1.1"]}
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V10");
        }
        var list = [
            {name: "2", type: "BOOLEAN", constraints: [], values: ["2"]}
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V10");
        }
        var list = [
            {name: "3", type: "DATETIME", constraints: [], values: ["2025-12-11"]}
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V10");
        }
        var list = [
            {name: "4", type: "NUMERIC", constraints: [], values: ["abc"]}
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V10");
        }
    });
    test("Test incorrect value restrictions", async () => {
        var list = [
            {name: "1", type: "DECIMAL(4,2)", constraints: [], values: ["11.111"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V11");
        }
        var list = [
            {name: "2", type: "CHARACTER(10)", constraints: [], values: ["abcdefghijk"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V11");
        }
    });
});
