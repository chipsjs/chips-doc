# 04-Cola Doc Mock

## 01-Bind Lock && Unbind Lock Demo

- Generic call way: /flow/list && /flow/run
- Quick api for bind lock: /bind/lock

## 02-How to use it

- 1.  In cola-server-repo(https://bitbucket.org/apac_eco_system/cola-server), there is a dir named `flow`
- 2. create a new json file or add flow to exist json file
- 3. Write the flow according to cola-doc schema (Introduction Later)
- 4.  call api /cola/api/flow/list/:version/:name get flow and update it
- 4. call api /cola/api/flow/run and you will get the report about this flow

## 04-Introduction cola-doc's schema

- There are three key param: flow(required), extensions, context

```jsx
eg in *.json:
{
  "random_key": {
    "flow": [],
    "extensions": {
    },
    "context": {
    }
  }
}
```

### flow

- flow意味着具体的调用过程,  加入一个flow调用了post /a 以及 get /b, 则这个flow这样写:

```jsx
"flow": ['post /a', 'get /b']
```

这可以被识别并且自动从swagger中获取信息

- 当然, 我们也支持一个flow中两次调用同一个接口, 可以这样写

```jsx
"flow": ['post /a@1', 'post /a@2']
```

这也可以被识别并且自动获取'post /a'中的信息

### extensions

- extensions用于灵活可插拔的对flow进行自定义控制, 目前支持controller, getswagger, httpclient.
- 具体写法如下:

```jsx
"flow": ['post /a@1', 'post /a@2'],
"extensions": {
	"post /a@1": [extension1, extension2]
}
```

### context

- context用于上下文字段以及对不同字段名但是同属于一个上下文字段的控制
- 它有两个Key, params(required), scope
- 一个简单的例子如下:

```jsx
"context": {
	"params": {
		"lockID": "a"
	}
}
// 代表mock的lockID是a并且会根据response回来的lockID进行更新
```

- 假设需要/a 接口下的response  [lock](http://lock.id)info.id 更新 lockID, 并且使下一个/b接口的request hostlockInfo.lockID 使用lockID, 可以这样写

```jsx
"context": {
	"params": ['lockID'],
	"scope": {
		"lockID": ["lockinfo.id", "hostlockInfo.lockID"]
	}
}
```

## 05-Introduction cola-doc's extensions

### controller

- 用于控制flow, 有两个功能
- 第一个是ignore功能, 用于控制当接口的response满足某个条件时控制后面flow中的某个接口不去调用
- eg:

```jsx
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

- 用于获取api对应的swagger文档
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

- 有以下两个功能:
- 1.可以覆盖context params, 用于想要给某个api强行指定request param的值

eg:

```jsx
// 代表/ap1中的lockID使用a, 不管context中的lockID是什么值
"extensions": {
    "post /api1": [
      {
        "middleware": "httpclient",
        "params": {
          "request": {
            "lockID": "a"
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
- 该插件用于执行api前或者执行api后执行function, 以此来实现接口没办法做到的一些功能
- 以下这个例子代表当api1的返回存在success.a时将a打印出来

```js
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
