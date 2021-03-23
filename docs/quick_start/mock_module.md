[TOC]

# Chips-Doc Mock Module

## 02-How to use

- import chips-doc
- call FlowManager.run with the following parameters: user_id, template_flows, swaggers, flow_name, headers, flows_context
- the function will return the report and the flows_context which you can update into user context
- eg1(import chips-doc in script): <https://github.com/chipsjs/chips-doc/blob/master/docs/examples/scripts_style/scripts>

- eg2(import chips-doc in server):

```js
const { FlowManager } = require('chips-doc');
const { flows, swaggers } = require('../data')

const runFlows = async (ctx, next) => {
  const { reports, flows_context } = await FlowManager.run({
    user_id: ctx.user_id,
    template_flows: flows.major,
    swaggers,
    flow_name: ctx.flow_name,
    headers: ctx.user_headers,
    flows_context: ctx.context || {}
  });

  ctx.body = {
    reports
  };
  ctx.context = flows_context;

  await next();
};

module.exports = { runFlows };

```

## 04-Introduction chips-doc's schema

- There are three key param: flow(required), extensions, context

```json
// In this case, this file is template_flows and flow_name is register
{
  "register": {
    "flow": ["get /user", "post /login"],
    "extensions": {
      
    },
    "context": {
      "params": ["user_id"]
    }
  }
}
```

### flow

- flow意味着具体的调用过程,  加入一个flow调用了post /a 以及 get /b, 则这个flow这样写:

```json
"flow": ['post /a', 'get /b']
```

这可以被识别并且自动从swagger中获取信息

- 当然, 我们也支持一个flow中两次调用同一个接口, 可以这样写

```jsx
"flow": ['post /a@1', 'post /a@2']
```

这也可以被识别并且自动获取'post /a'中的信息

### extensions

- extensions用于灵活可插拔的对flow进行自定义控制, 目前支持controller, getswagger, httpclient and secrectFunction
- 具体写法如下:

```json
{
  "flow": ['post /a@1', 'post /a@2'],
  "extensions": {
    "post /a@1": [{
      "middleware": 'getswagger',
      "params": {
        "onlymock": ['firstName', 'lastName']
      }
    }, {
      "middleware": 'httpclient',
      "params": {
        "request": {
          "lastName": "Xu"
        }
      }
    }]
  }
}

```

### context

- context用于上下文字段以及对不同字段名但是同属于一个上下文字段的控制
- 它有两个Key, params(required), scope
- 一个简单的例子如下:

```json
{
  "flow": ['post /a@1', 'post /a@2'],
  "context": {
    "params": {
      "name": "a"
    }
  }
}
// 代表mock的name是a并且会根据response回来的name进行更新
```

- 假设需要/a 接口下的response的userInfo.id 更新 user, 并且使下一个/b接口的request user.id 使用该更新后的userId, 可以这样写

```json
{
  "flow": ['post /a', 'post /a'],
  "context": {
    "params": ['userId'],
    "scope": {
      "userId": ["userId", "userInfo.id", "user.ID"]
    }
  }
}
```

- 假设需要特定task上的response去覆盖context.params, 可以这样写, 代表post /a@1.userId的参数将会去覆盖context

```json
{
  "flow": ['post /a@1', 'post /a@2'],
  "context": {
    "params": ['userId'],
    "scope": {
      "userId": ["userId", "post /a@1.userId"]
    }
  }
```

## 05-Introduction chips-doc's extensions

### controller

- 用于控制flow的执行流程, 有两个功能： 分别是ignore和dest
- 第一个是ignore功能, 用于控制当接口的response满足某个条件时控制后面flow中的某个接口不去调用
- eg:

```json
{
  "flow": ["post /api2", "get /api1", "get /api3"],
  "extensions": {
    "post /api2": [
      {
        "middleware": "controller",
        "params": {
          "ignore": {
            "task_id": "get /api1", // default ignore
            "and_condition": {
              "data.success": false // when api1 response.data.success === false, get /api1 will execute
            },
            "un_condition": {
              "status": 200 // when api1 response.data.status !== 200, will execute get /api1
            },
            "or_condition": {
              "data.success": false // 一个匹配上则ignore
            }
          }
        }
      }
    ]
  }
}
```

- 第二个是dest功能, 用于当满足条件时跳转到对应的api或者flow上, 以下例子代表当post /api2的返回是success ==true时, 跳转到 get /api1上

```js
  task1: {
    flow: ['post /api2', 'post /api4', 'get /api1', 'get /api7'],
    extensions: {
      'post /api2': [
        {
          middleware: 'controller',
          params: {
            dest: {
              task_id: 'get /api1',
              condition: {
                success: true
              }
            }
          }
        }
      ]
    }
  },
```

### getswagger

- 对swagger进行版本控制以及定制化mock对应字段
- 目前有两个功能: 1.version 2.onlymock
- 如果不使用这个插件, 默认获取config下default_version的swagger并且对swagger里的字段都mock
- eg:

```js
// 代表获取v0.0.2.json下的swagger并且mock数据时只会mock param1
"extensions": {
  "get /api1": [
    {
      "middleware": "getswagger",
      "params": {
        "version": "v0.0.2",
        "onlymock": ["param1"]
      }
    }
  ]
}
```

### httpclient

- 提供给用户指定request参数或者从运行时上下文中更新参数的功能:
- 1.可以覆盖context params, 用于想要给某个api强行指定request param的值

eg:

```jsx
// 代表/ap1中的userId使用a, 不管context中的userId是什么值
"extensions": {
    "post /api1": [
      {
        "middleware": "httpclient",
        "params": {
          "request": {
            "userName": "a"
          }
        }
      }
    ]
  },
```

- 2.支持变量, 代表这个变量会被context中对应的值替换

eg:

```js
// 代表LockIDs === ['a']
"extensions": {
    "post /api1": [
      {
        "middleware": "httpclient",
        "params": {
          "request": {
            "LockIDs": ["${lockID}"]
          }
        }
      }
    ]
  },
  "context": {
    "params": {
      "lockID": "a",
    }
  }
```

### secretfunction

- 提供在task执行前/后的函数编程入口. 当用户场景用上述三个插件无法做到时, 可以使用该插件自定义编程
- 以下这个例子代表当api1的返回存在success.a时将a打印出来

```json
  testflow: {
    flow: ['get /api1'],
    extensions: {
      'get /api1': [
        {
          middleware: 'secretfunction',
          params: {
            after: (ctx, res) => {
              const a = res.success;
              if (a) {
                console.log(a);
              }
            }
          }
        }
      ]
    }
  },
```

## 06-real flow

```jsx
{
  "lock": {
    "flow": ["get /devices/capabilities", "post /houses", "post /locks", "put /locks/:lockID"],
    "extensions": {
      "get /devices/capabilities": [
        {
          "middleware": "getswagger",
          "params": {
            "onlymock": ["deviceType", "productID", "productTypeID"]
          }
        }
      ],
      "post /locks": [
        {
          "middleware": "getswagger",
          "params": {
            "version": "v2.0.0",
            "onlymock": ["houseID", "serialNumber", "LockIDs", "LockName"]        
          }
        },
        {
          "middleware": "httpclient",
          "params": {
            "request": {
              "LockIDs": ["${lockID}"]
            }
          }
        }
      ],
      "put /locks/:lockID": [
        {
          "middleware": "getswagger",
          "params": {
            "onlymock": ["LockName", "hostLockInfo"]
          }
        }
      ]
    },
    "context": {
      "params": {
        "serialNumber": "a",
        "lockID": "b",
        "productID": "111",
        "productTypeID": "2222",
        "manufacturer": "",
        "lockSerialNumber": "",
        "lockType": "",
        "houseID": ""
      },
      "scope": {
        "productID": ["hostLockInfo.productID"],
        "productTypeID": ["hostLockInfo.productTypeID"],
        "manufacturer": ["lock.manufacturer", "hostLockInfo.manufacturer"],
        "lockSerialNumber": ["lock.serialNumber", "hostLockInfo.serialNumber"],
        "lockType": ["lock.type", "hostLockInfo.Type"],
        "houseID": ["HouseID"]
      }
    }
  }
}
```
