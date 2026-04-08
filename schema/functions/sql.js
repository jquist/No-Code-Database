const valFunctions = require('../functions/validation');

const numberTypes = [
    "INT",
    "INTEGER",
    "TINYINT",
    "SMALLINT",
    "MEDIUMINT",
    "BIGINT",
    "INT2",
    "INT8",
    "DECIMAL",
    "REAL",
    "DOUBLE",
    "FLOAT",
    "NUMERIC",
    "BOOLEAN"
];

async function isNumber(type) {
    for (var Ntype of numberTypes) {
        if (type.includes(Ntype)){
            return true;
        }
    }
    return false;
}

async function generateSQL(canvas) {
    try {
        var relationships = canvas.relationships;
        var tables = canvas.tables;
    } catch {
        throw {code: "S00", httpCode: 400, message: "Invalid JSON format"};
    }
    // table validation
    await valFunctions.validateTables(tables);

    // give all table data a relations array to add to later
    try {
        for (var i = 0; i < tables.length; i++) {
            tables[i].relations = [];
            // example:
            // {
            //     key: "p" or "f",
            //     row: 0 or "field name",
            //     rowREF: null or "field name"
            //     tableREF: null or "table name"
            //     depTableID: null or id
            // }
            
            // does table have everything else it needs?
            var id = tables[i].id;
            var name = tables[i].name;
            var data = tables[i].data;
            var attributes = tables[i].attributes;
            var dataRows = tables[i].dataModelRows;
        }
    } catch {
        throw {code: "S00", httpCode: 400, message: "Invalid JSON format"};
    }
    
    // insert all relationships into the tables
    var interTables = [] // extra manyToMany tables
    for (var rel of relationships) {
        try {
            var source = rel.source;
            var sourceRow = parseInt(rel.sourceHandle.split("-")[1]);
            var target = rel.target;
            var targetRow = parseInt(rel.targetHandle.split("-")[1]);
            var type = rel.type;
        } catch {
            throw {code: "S00", httpCode: 400, message: "Invalid JSON format"};
        }
        if (type == "oneToManyEdge" || type == "oneToOneEdge") {
            for (var i = 0; i < tables.length; i++) {
                if (tables[i].id == source) {
                    tables[i].relations.push({
                        key: "p",
                        row: sourceRow,
                        rowREF: null,
                        tableREF: null,
                        depTableID: null
                    });

                    for (var j = 0; j < tables.length; j++) {
                        if (tables[j].id == target) {
                            tables[j].relations.push({
                                key: "f",
                                row: tables[j].data[targetRow],
                                rowREF: tables[i].data[sourceRow],
                                tableREF: tables[i].name,
                                depTableID: i // This is the id of the table that must have its data inserted first before this table goes
                            });
                        }
                    }
                }
            }
        } else if (type == "manyToManyEdge") {
            // create new table with references to that table
            var inter = {
                tableName1:"",
                rowName1: "",
                rowType1: "",
                tableName2:"",
                rowName2: "",
                rowType2: "",
                data: []
            }
            for (var i = 0; i < tables.length; i++) {
                if (tables[i].id == source) {
                    inter.tableName1 = tables[i].name;
                    inter.rowName1 = tables[i].data[sourceRow];
                    inter.rowType1 = tables[i].attributes[sourceRow].type;
                    
                }
            }
            for (var i = 0; i < tables.length; i++) {
                if (tables[i].id == target) {
                    inter.tableName2 = tables[i].name;
                    inter.rowName2 = tables[i].data[targetRow];
                    inter.rowType2 = tables[i].attributes[targetRow].type;
                }
            }
            interTables.push(inter);
        }
    }
    
    // generate each table's string individually with validation
    var sqlString = "";
    for (var table of tables) {
        var fieldList = [];
        var tableString = `CREATE TABLE ${table.name}(`;

        for (var i = 0; i < table.data.length; i++) {
            // convert frontend format to my format
            var constraints = [];
            if (table.attributes[i].nn) constraints.push("NOT NULL");
            if (table.attributes[i].unique) constraints.push("UNIQUE");
            if (table.attributes[i].default != "") {
                constraints.push(`DEFAULT ${table.attributes[i].default}`);
            }

            // Check primary key should be there
            if (table.attributes[i].pk) {
                var done = false;
                for (var rel of table.relations) {
                    if (rel.key == "p" && rel.row == i) {
                        constraints.push("PRIMARY KEY");
                        done = true;
                    } else if (rel.key == "p") throw {code: "V08", httpCode: 400, message: "Relationship is not connected to a primary key"};
                }
                if (!done) constraints.push("PRIMARY KEY");
            }

            // init data
            var values = [];
            for (var row of table.dataModelRows) values.push(row[i]);
            
            fieldList.push({
                name: table.data[i],
                type: table.attributes[i].type,
                constraints: constraints,
                values: values
            });
        }

        // validate fields
        try {
            await valFunctions.validateFields(fieldList);
        } catch (err) {
            err.tableID = table.id;
            err.tableName = table.name;
            throw err;
        }
        
        // my format to sql
        for (var field of fieldList) {
            tableString += `${field.name} ${field.type} `;
            for (var constr of field.constraints) {
                tableString += `${constr} `;
            }
            tableString = tableString.substring(0, tableString.length - 1) + ", ";
        }

        // add in forign key
        for (var rel of table.relations) {
            if (rel.key == "f") tableString += `FOREIGN KEY (${rel.row}) REFERENCES ${rel.tableREF}(${rel.rowREF}), `;
        }
        tableString = tableString.substring(0, tableString.length - 2) + ");";

        sqlString += tableString + " ";
    }

    // add initial data
    var idsLeft = [];
    for (var i = 0; i < tables.length; i++) {
        // does table have init data?
        if (tables[i].dataModelRows.length != 0) {
            idsLeft.push(i);
        }
    }
    var index = 0;
    var prevLength = idsLeft.length;
    while (idsLeft.length > 0) {
        var id = idsLeft[index];
        // does table have a dependancy?
        var canInsert = true;
        for (var rel of tables[id].relations) {
            if (rel.key == "f") {
                if (idsLeft.includes(rel.depTableID)) {
                    canInsert = false;
                }
            }
        }
        // insert data
        if (canInsert) {
            var dataString = `INSERT INTO ${tables[id].name}(`;
            for (var name of tables[id].data) {
                dataString += `${name}, `;
            }
            dataString = dataString.substring(0, dataString.length - 2) + ") VALUES (";
            for (var row of tables[id].dataModelRows) {
                for (var i = 0; i < row.length; i++) {
                    if (await isNumber(tables[id].attributes[i].type.toUpperCase())) {
                        dataString += `${row[i]}, `
                    } else {
                        dataString += `'${row[i]}', `
                    }
                }
                dataString = dataString.substring(0, dataString.length - 2) + "), (";
            }
            sqlString += dataString.substring(0, dataString.length - 3) + "; ";

            // remove id from array
            idsLeft.splice(idsLeft.indexOf(id), 1);
        } else {
            // if data can't be inserted move onto next table
            index++;
        }
        if (index >= idsLeft.length) {
            index = 0;
            if (prevLength == idsLeft.length) {
                throw {code: "V12", httpCode: 400, message: "Relationship dependancy error (you may have invalid or circular relationships)"};
            }
            prevLength = idsLeft.length;
        }
    }

    // add inter tables
    for (var inter of interTables) {
        // check if the first 3 digits of each name is unique
        var name1 = inter.tableName1.substring(0, 3);
        var name2 = inter.tableName2.substring(0, 3);
        if (name1 == name2) {
            name1 += "1";
            name2 += "2";
        }

        var tableString = "";
        tableString += `CREATE TABLE ${name1}_${name2}_connector(`
        tableString += `${name1}_${inter.rowName1} ${inter.rowType1}, `
        tableString += `${name2}_${inter.rowName2} ${inter.rowType2}, `
        tableString += `PRIMARY KEY(${name1}_${inter.rowName1}, ${name2}_${inter.rowName2}), `
        tableString += `FOREIGN KEY(${name1}_${inter.rowName1}) REFERENCES ${inter.tableName1}(${inter.rowName1}), `
        tableString += `FOREIGN KEY(${name2}_${inter.rowName2}) REFERENCES ${inter.tableName2}(${inter.rowName2}));`
        sqlString += tableString + " ";
    }
    sqlString = sqlString.substring(0, sqlString.length - 1);

    return sqlString; // actual return
}


module.exports = {generateSQL};
