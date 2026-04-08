const request = require("supertest");
const {app,server} = require("../app");
const fs = require('fs');
const filePath = './tempFiles/';
const fileFunctions = require('../functions/file');
const { pathToFileURL } = require("url");

let agent;


describe("Schema Route tests", () => {

    beforeAll(async () => {
        agent = request.agent(app);
    });

    test("Test build route", async () => {
        var res = await agent.post("/build").send({
            //send a data object 
            data: {
                projectName: "name",
                canvas: {
                    relationships: [
                        {
                            "id": "el-1",
                            "source": "3",
                            "sourceHandle": "row-0-left",
                            "target": "1",
                            "targetHandle": "row-0-right",
                            "type": "manyToManyEdge"
                        },
                        {
                            "id": "el-2",
                            "source": "2",
                            "sourceHandle": "row-0-left",
                            "target": "1",
                            "targetHandle": "row-3-right",
                            "type": "oneToManyEdge"
                        }
                    ],
                    tables: [
                        {
                            id: "1",
                            name: "Students",
                            position: {x:100,y:100},
                            data: ["id", "name", "age", "School_id", "passed"],
                            attributes: [
                                {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                                {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: false},
                                {ai: false, default: "18", nn: false, pk: false, type: "INT", unique: false},
                                {ai: false, default: "", nn: false, pk: false, type: "INT", unique: false},
                                {ai: false, default: "", nn: false, pk: false, type: "INT", unique: false}
                            ],
                            dataModelRows: [
                                ["1", "bob", "18", "1", "1"],
                                ["2", "sam", "19", "1", "0"]
                            ]
                        },
                        {
                            id: "2",
                            name: "School",
                            position: {x:100,y:100},
                            data: ["id", "name"],
                            attributes: [
                                {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                                {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: false}
                            ],
                            dataModelRows: [
                                ["1", "school"]
                            ]
                        },
                        {
                            id: "3",
                            name: "Course",
                            position: {x:100,y:100},
                            data: ["id", "name"],
                            attributes: [
                                {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                                {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: true}
                            ],
                            dataModelRows: [
                                ["1", "course"]
                            ]
                        }
                    ]
                }
            }
        });
        // Status OK
        console.log(res.body);
        expect(res.status).toBe(200);
        var fileName = res.body.data.fileName;

        res = await agent.get("/build/DB").send({data:{fileName: fileName}})
        expect(res.status).toBe(200);

        res = await agent.get("/build/SQL").send({data:{fileName: fileName}})
        expect(res.status).toBe(200);
    });

    afterAll(async () => {
        server.close();
    });
});