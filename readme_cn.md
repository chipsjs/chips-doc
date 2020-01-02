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
- 支持case response校验的数据类型处理（需要完善，除数据类型外，对特定的值进行判断）
- 输出每个flow的报告

## todo
### part 4 
- 设计固定的上下文字段，用于response中值的更新
- 对特殊的base_case生成test_case的处理，比如某种case会直接导致失败
- 增加editorconfig
- airbnb风格开发
- base_url变量的处理
- test2的编写
- statusOther的处理

### part 5
- 报告完善，格式优化
- 对接口response的强check（除类型判断外，会有一些特定值进行判断）
- 实际flow的编写

### 二期
- 搭建swagger ui
- api_doc实际业务的编写
- api某些固定的调用依赖可以定义
- special_case等改成文件夹，自动加载


