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
+-- model 数据处理层
|   +-- loader.js 加载api_doc/api_flow并输出test_case
|   +-- filter.js 过滤无用的api(暂时无用)
+-- service 服务层
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
- 对case result校验的处理
- todo

## todo
- 对base_case生成test_case的处理
- 针对api_flow中的特定流程进行加载
- 搭建swagger ui

## idea
- api某些固定的调用依赖可以定义