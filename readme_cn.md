# 结构介绍
- 流程图见项目下cola-doc流程图.jpg

## 文件结构 
```
.
+-- script 脚本
+-- api_doc jsonschema接口文档
+-- api_flow 业务逻辑flow,用户自定义控制 
+-- test_case 测试数据
|   +-- temp 根据json_schema随机生成的测试用例
|   +-- base 一些必须跑的测试用例（手写，会增加到temp_test_case中）
+-- store 临时文件
|   +-- log_store 日志文件
|   +-- swagger_store jsonschema转为swagger的输出
|   +-- report 根据启动日期生成文件
+-- middleware  中间件
|   +-- setting.js  配置中心
|   +-- assist_macro.js 辅助宏
|   +-- log.js  日志模块,多实例，不同的request_id
|   +-- loader.js 数据处理，加载api_doc/api_flow并输出test_case
|   +-- task.js 测试任务，一个task包含多个api，例如注册流程，生成一个log实例
|   +-- taskqueue.js 任务队列
+-- entry 入口
|   +-- mock.js test_case输入进行测试
|   +-- generate_case.js 根据json_schema自动生成test case
```

## 项目层次结构
### generate_case module
```
api_doc/api_flow层 -> model层 -> middleware层 -> test_case层           
```
### mock module
```
test_case层 -> middleware层 -> service层           
```

# feature
- script for main flow checking

## 由接口文档自动生成test_case模块
- 从接口文档中自动fake接口的body/params/path数据
- 同一个flow中可自定义多个api请求的public字段
- 支持flow中定义多个api，支持对flow中api的特殊要求（例如一个flow中某个api的特殊的数据）

## mock以及check业务flow模块
- 支持多flow从test_case中加载测试用例并同步发送多api的http请求
- 支持case response的数据类型校验（to optimize，除数据类型外，对特定的值进行判断）
- 分为成功和失败输出每个flow的报告
- 设计固定的上下文字段，用于response中值的更新 
- base_url变量的处理(to optimize, 未来支持不同url的变量)

## todo
- 对特殊的base_case生成test_case的处理，比如某种case会直接导致失败
- 增加editorconfig
- airbnb风格开发

### 二期
- 搭建swagger ui
- api_doc实际业务的编写
- api某些固定的调用依赖可以定义
- special_case等改成文件夹，自动加载

# 文档编写教程
- 首先，让我们统一上下文。flow指的是一个工作流，比如一个注册流程，其中包含多个case。

## api_doc.json
- api_doc是api粒度的接口文档，其中key是接口名，value是一个对象，需要包含以下内容
```
.
+-- method_type http的方法，例如get
+-- url 例如http://127.0.0.1:3030/locks/proide
+-- request     (optional,每个字段都是Json_schema形式)
|   +-- path    url中可变字段
|   +-- query   http params
|   +-- body    http body
+-- response    (optional，每个字段都是Json_schema形式)
|   +-- success statuscode为200的回复
|   +-- failure 除200外的回复（未来会新增其他statuscode，todo）
```

## api_flow.json
- 用于自定义用户mock,不在此文件中的接口不会被生成测试用例.key为flow名字， value是一个对象，需要包含以下内容
```

        "": ["getHouseLog", "getHouseLog"],
        "context": ["houseID"],
        "getHouseLog": {
            "clientSerial": "4DD02574-CF63-4BEC-B3BF-75CE3ECAD057",
            "houseID": "3818a476-5a9c-43fe-8523-7787327cdfd4"
        }
.
+-- flow 具体flow需要依次跑的case排序
+-- context 会根据request,reponse变化的Flow上下文字段
+-- api_case名     (optional) 一个对象，代表这个api中一些特定的字段
```

## api_flow_template.json
- 该文档是api_flow的模板文档，放置所有编写的api_flow，用户可以从里面找对应flow并放到自定义的api_flow中

## api_special_case.json
- 一些特殊用例
