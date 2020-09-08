# 04-Cola Doc Mock

## 01-Bind Lock && Unbind Lock Demo

- Generic call way: /flow/list && /flow/run
- Quick api for bind lock: /bind/lock

## 02-What it can do?

- 快速方便的模拟api 调用flow: 1.支持上下文字段与字段作用域 2.支持变量 3. 三个插件随用随加: controller, getswagger, httpclient
- 三个真实的案例

```
1. kris, 你去测一下pin code与masterpin一样时会怎么样? 
理论上会被挡掉: 结果kris绑定过程中陆陆续续遇到6处困难, 绑锁耗时3h
- 清空正在debug的开发环境上下文 
- 锁没电池  
- 找不到锁 
- 好不容易绑锁成功了App版本需要更新:从jekins上下载安装 
- 扩展坞的usb连接报accessories disables,mac上安装不下去 
- 出现异常情况,Pincode处于creating状态,不清楚后端的response是否success 由于prod环境不能抓包回到devel环境打开抓包工具分析问题
-> 现在: 登录cola-doc使用bind lock flow, 1min

2.一个flow如果要用postman模拟需要发送多次请求, 不断对其请求参数进行修改, 手动获取上下文参数, 如果需要多次重复调用, 累死人
-> 现在: 一次调用瞬间跑完整个流程，无需关心上下文参数的传递

3.前端: activity log使用v4版本啦, 但是解析失败会报错, 前端问我们能否帮忙看一下这个接口返回的是不是有问题? 
	后端: 你能把这个功能传的接口和参数给我吗?
	...half hour later
	前端: 怎么了? (两个人的上下文早就丢光啦)
-> 现在: - 前端: 能看下response吗, 后端: 可以用cola-doc自己调一下 - 后端: 能帮忙看下这个功能调用的接口吗 前端: 自己看cola-doc
```

## 03-How to use it

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

- 用于控制flow
- 目前只有一个ignore功能, 用于控制当接口的response满足某个条件时控制后面flow中的某个接口不去调用
- eg:

```jsx
"flow": ["post /api2", "get /api1"],
"extensions": {
  "post /api2": [
    {
      "middleware": "controller",
      "params": {
        "ignore": {
          "task_id": "get /api1",
          "condition": {
            "success": false // when api1 response.data.success === false, get /api1 不将会调用
          }
        }
      }
    }
  ]
}
```

### getswagger

- 用于获取api对应的swagger文档
- 目前有两个功能: 1.version 2.onlymock
- 如果不使用这个插件, 默认获取config下default_version的swagger并且对swagger里的字段都mock
- eg:

```jsx
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

```jsx
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

## 07-Common Issues

### swagger extension

- Sometimes,  our august-api-spec translates to  swagger that doesn't quite convey what this interface means. So we need to add swagger-extension. Cola-Doc support add swagger additional type and can sync it well.
- add spec in xxx_extention.json and create  pr to cola-server
- click the refresh button in cola-frontend after this pr is merged
- eg:

```jsx
/device/capabilities
```

## 08-question