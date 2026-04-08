async function validateFields(list) {
    // the list must contain objects that look like this:
    var example = {
        name: "",
        type: "", // with parameters included
        constraints: [
            "" // with parameters included (separated by a space)
        ],
        values: []
    }
    const validTypes = [
        "INT",
        "INTEGER",
        "TINYINT",
        "SMALLINT",
        "MEDIUMINT",
        "BIGINT",
        "INT2",
        "INT8",
        "DECIMAL", // has 2 parameters (total digits, digits right of the decimal point)
        "REAL",
        "DOUBLE",
        "FLOAT",
        "NUMERIC",
        "CHARACTER", // 1 parameter (length)
        "VARCHAR", // 1 parameter (length)
        "NCHAR", // 1 parameter (length)
        "NVARCHAR", // 1 parameter (length)
        "TEXT",
        "BOOLEAN",
        "DATE",
        "DATETIME"
    ]

    const validTypesRegex = [ // with regular expressions for each
        ["INT", /\d+/g],
        ["INTEGER", /\d+/g],
        ["TINYINT", /\d+/g],
        ["SMALLINT", /\d+/g],
        ["MEDIUMINT", /\d+/g],
        ["BIGINT", /\d+/g],
        ["INT2", /\d+/g],
        ["INT8", /\d+/g],
        ["DECIMAL", /\d+\.\d+/g], // has 2 parameters (total digits, digits right of the decimal point)
        ["REAL", /\d+\.\d+/g],
        ["DOUBLE", /\d+\.\d+/g],
        ["FLOAT", /\d+\.\d+/g],
        ["NUMERIC", /(\d+\.\d+)|\d+/g],
        ["CHARACTER", /\w+/g], // 1 parameter (length)
        ["VARCHAR", /\w+/g], // 1 parameter (length)
        ["NCHAR", /\w+/g], // 1 parameter (length)
        ["NVARCHAR", /\w+/g], // 1 parameter (length)
        ["TEXT", /\w+/g],
        ["BOOLEAN", /[01]/g],
        ["DATE", /\d\d\d\d-\d\d-\d\d/g],
        ["DATETIME", /\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d/g]
    ]

    const validParameters = [
        {
            type: "DECIMAL",
            parameters: 2
        },
        {
            type: "CHARACTER",
            parameters: 1
        },
        {
            type: "VARCHAR",
            parameters: 1
        },
        {
            type: "NCHAR",
            parameters: 1
        },
        {
            type: "NVARCHAR",
            parameters: 1
        },
    ]
    
    const validConstraints = [
        "NOT NULL",
        "UNIQUE",
        "PRIMARY KEY"
    ]

    const validParaConstraints = [
        "DEFAULT" // needs parameter
    ]

    var hasPK = false;
    // validation process
    for (var i = 0; i < list.length; i++) {
        var field = list[i]
        var err = {fieldID: i, fieldName: field.name};

        if (typeof field.name !== "string" || field.name.trim() === "") {
            throw {code: "S00", httpCode: 400, data: err, message: "Field name is required"};
        }
        // is the name a duplicate?
        for (var j = 0; j < list.length; j++) {
            if (i != j && field.name == list[j].name) throw {code: "V09", httpCode: 400, data: {fieldID: null, fieldName: field.name}, message: "Duplicate field names"};
        }

        var type = field.type.toUpperCase();
        var params = [];
        // does it contain a parameter?
        if (type.includes("(") && type.includes(")")) {
            var split1 = type.split("(");
            type = split1[0];
            // how many parameters are there meant to be
            var paras = 0;
            for (var para of validParameters) {
                if (type == para.type) {
                    paras = para.parameters;
                }
            }
            if (paras == 0) throw {code: "V03", httpCode: 400, data: err, message: "Data type has parameters when it shouldn't"};
            if (paras == 1) {
                if (split1.length == 2) {
                    var split2 = split1[1].replace(")", "");
                    if (isNaN(split2)) throw {code: "V04", httpCode: 400, data: err, message: "Invlid parameter or parameter length"};
                    params.push(split2);
                } else {
                    throw {code: "V02", httpCode: 500, data: err, message: "Invlid parameter format"};
                }
            }
            if (paras == 2) {
                if (split1.length == 2) {
                    var split2 = split1[1].replace(")", "").replaceAll(" ", "").split(",")
                    if (split2.length != 2) throw {code: "V04", httpCode: 400, data: err, message: "Invlid parameter or parameter length"};
                    if (isNaN(split2[0])) throw {code: "V04", httpCode: 400, data: err, message: "Invlid parameter or parameter length"};
                    if (isNaN(split2[1])) throw {code: "V04", httpCode: 400, data: err, message: "Invlid parameter or parameter length"};
                    params.push(split2[0]);
                    params.push(split2[1]);
                } else {
                    throw {code: "V02", httpCode: 500, data: err, message: "Invlid parameter format"};
                }
            }
        }
        if (! validTypes.includes(type)) {
            throw {code: "V05", httpCode: 400, data: err, message: "Invlid data type"};
        }

        var hasUnique = false;
        var hasNotnull = false;
        for (var constr of field.constraints) {
            constr = constr.toUpperCase();
            if (! validConstraints.includes(constr)) {
                // does it have parameters?
                var split1 = constr.split(" ", 2);
                if (! validParaConstraints.includes(split1[0])) throw {code: "V06", httpCode: 400, data: err, message: "Invlid constraint"};
            }
            if (constr == "UNIQUE" || constr == "PRIMARY KEY") hasUnique = true;
            if (constr == "NOT NULL" || constr == "PRIMARY KEY") hasNotnull = true;
            if (constr == "PRIMARY KEY") {
                if (hasPK) throw {code: "V07", httpCode: 400, data: err, message: "More than one PRIMARY KEY in a table"};
                hasPK = true;
            }
        }
        //console.log(regex);
        for (var j = 0; j < field.values.length; j++) {
            var value = field.values[j];
            // is it unique if it needs to be?
            if (hasUnique) {
                for (var k = 0; k < field.values.length; k++) {
                    if (j != k && value == field.values[k]) throw {code: "V10", httpCode: 400, data: err, message: "Field has duplicate values when there shouldn't be"}
                }
            }
            // is it not null if it needs to be?
            if (hasNotnull) {
                if (value == "null" || value == "null") throw {code: "V10", httpCode: 400, data: err, message: "Field has a null value when there shouldn't be"}
            }
            // does it have correct typing
            if (params.length == 1) {
                if (value.length > params[0]) throw {code: "V11", httpCode: 400, data: err, message: `The value: ${value} exceeds the field restrictions`}
            }
            if (params.length == 2) {
                if (value.length > (params[0] + 1)) throw {code: "V11", httpCode: 400, data: err, message: `The value: ${value} exceeds the field restrictions`}
            }
            
            for (var typeData of validTypesRegex) {
                if (typeData[0] == type) {
                    if (! new RegExp(typeData[1]).test(value)) throw {code: "V10", httpCode: 400, data: err, message: `The value: ${value} has an incorrect format`};
                    break;
                }
            }
        }
    }
    return "success";
}

async function validateTables(tables) {
    if (!Array.isArray(tables)) {
        throw {
            code: "S01",
            httpCode: 400,
            data: {fieldID: null, fieldName: null, tableID: null, tableName: null},
            message: "Tables payload must be an array"
        };
    }

    // check for duplicate table names
    for (var i = 0; i < tables.length; i++) {
        var currentTable = tables[i] || {};
        var currentName = typeof currentTable.name === "string" ? currentTable.name.trim() : "";

        if (currentName === "") {
            throw {
                code: "S00",
                httpCode: 400,
                data: {fieldID: null, fieldName: null, tableID: currentTable.id ?? null, tableName: currentTable.name ?? null},
                message: "Table name is required"
            };
        }

        for (var j = 0; j < tables.length; j++) {
            if (i != j && tables[i].name == tables[j].name) throw {
                code: "V09",
                httpCode: 400,
                data: {fieldID: null, fieldName: null, tableID: null, tableName: tables[i].name},
                message: "Duplicate table names"
            };
        }
    }
    return "success";
}

module.exports = {validateFields, validateTables};
