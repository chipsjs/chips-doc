const api_doc_arr = [
  {
    api_name: "test1",
    method_type: "post",
    url: "localhost://users",
    description: "A product from Acme's catalog",
    // scopes todo
    // tag: todo
    request: {
      body: {
        type: "object",
        properties: {
          "productId": {
            "description": "The unique identifier for a product",
            "type": "integer"
          },
          "productName": {
            "description": "Name of the product",
            "type": "string"
          },
          "price": {
            "description": "The price of the product",
            "type": "number",
            "exclusiveMinimum": 0
          }
        },
        required: [ "productId", "productName", "price" ]
      }
    }
  },
  {
    api_name: "test2",
    method_type: "get",
    url: "localhost://users",
    description: "A product from Acme's catalog",
    // scopes todo
    // tag: todo
    request: {
      query: {
        type: "object",
        properties: {
          "productId": {
            "description": "The unique identifier for a product",
            "type": "integer"
          },
          "productName": {
            "description": "Name of the product",
            "type": "string"
          },
          "price": {
            "description": "The price of the product",
            "type": "number",
            "exclusiveMinimum": 0
          }
        },
        required: [ "productId", "productName", "price" ]
      }
    }
  }
];

module.exports = api_doc_arr;

