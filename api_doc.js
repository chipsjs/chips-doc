const api_doc_arr = [
  // {
  //   api_name: "test1",
  //   method_type: "get",
  //   url: "http://localhost/{userID}/abc/{lockID}",
  //   description: "A product from Acme's catalog",
  //   // scopes todo
  //   // tag: todo
  //   request: {
  //     path: {
  //       lockID: {type: "string"},
  //       userID: {type: "string"}
  //     },
  //     body: {
  //       type: "object",
  //       properties: {
  //         "productId": {
  //           "description": "The unique identifier for a product",
  //           "type": "integer"
  //         },
  //         "productName": {
  //           "description": "Name of the product",
  //           "type": "string"
  //         },
  //         "price": {
  //           "description": "The price of the product",
  //           "type": "number",
  //           "exclusiveMinimum": 0
  //         }
  //       },
  //       required: [ "productId", "productName", "price" ]
  //     }
  //   },
  //   response: {
  //     result: "success",//特定的
  //     //todo,类型的判断
  //   }
  // },
  // {
  //   api_name: "test2",
  //   method_type: "get",
  //   url: "localhost://users",
  //   description: "A product from Acme's catalog",
  //   // scopes todo
  //   // tag: todo
  //   request: {
  //     query: {
  //       type: "object",
  //       properties: {
  //         "productId": {
  //           "description": "The unique identifier for a product",
  //           "type": "integer"
  //         },
  //         "productName": {
  //           "description": "Name of the product",
  //           "type": "string"
  //         },
  //         "price": {
  //           "description": "The price of the product",
  //           "type": "number",
  //           "exclusiveMinimum": 0
  //         }
  //       },
  //       required: [ "productId", "productName", "price" ]
  //     }
  //   }
  // },
  {
    api_name: "getHouseLog",
    method_type: "get",
    url: "http://127.0.0.1:3030/houses/:houseID/activities", //todo，url可变
    request: {
      path: {
        houseID: {type: "string"}
      },
      query: {
        type: "object",
        properties: {
          "limit": {
            "description": "log limit num",
            "type": "integer",
            "minimum": 1,
            "maximum": 50
          },
          "clientSerial": {
            "description": "serial of the product",
            "type": "string"
          }
        },
        required: [ "limit", "clientSerial" ]
      }
    },
    response: {

    }
  }
];

module.exports = api_doc_arr;

