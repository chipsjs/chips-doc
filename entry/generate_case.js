//faker
const faker = require("json-schema-faker");
const api_doc = require("../api_doc");
const config = require('config');
const fs = require("fs");

async function generateCaseInit() {

}

const temp_test_case_path =  config.get("base_test_case_path") + "//" + "temp_test_case";

//区分query和body
for(let i in api_doc) {
    faker.resolve(api_doc[i].request.body).then(sample => {
        console.log(sample);
    });
}



//加载flow并自动生成文件