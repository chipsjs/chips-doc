//标准template
// const template = {
//     register: {
//         flow: ["test1", "test2"],
//         // test1: {
//         //
//         // } 特定的一些行为
//         public_param: ["productId"]
//     },
// };

const api_flow_arr = {
    test: {
        flow: ["getHouseLog"],
        getHouseLog: {
            clientSerial: "4DD02574-CF63-4BEC-B3BF-75CE3ECAD057",
            houseID: "3818a476-5a9c-43fe-8523-7787327cdfd4"
        }
    }
};
//这份文件的自定义，还要考虑

module.exports = api_flow_arr;
