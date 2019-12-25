module.exports = {
    "register": [
        {
            "api_name": "test1",
            "method_type": "get",
            "url": "localhost://users",
            "response": {
                "result": "success"
            },
            "body": {
                "productId": -3512715,
                "productName": "quis anim eu officia",
                "price": 70919383.54970235
            }
        },
        {
            "api_name": "test2",
            "method_type": "get",
            "url": "localhost://users",
            "query": {
                "productId": -3512715,
                "productName": "a",
                "price": 79754266.93257144
            }
        }
    ]
};