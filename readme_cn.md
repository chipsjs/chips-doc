# 结构介绍

## 文件结构 
```
.
+-- script 脚本
+-- apidoc jsonschema接口文档
+-- test_case 测试数据
|   +-- temp 根据json_schema随机生成的测试用例
|   +-- base 一些必须跑的测试用例（手写）
+-- store 临时文件
|   +-- log_store 日志文件
|   +-- swagger_store jsonschema转为swagger的输出
|   +-- report 根据启动日期生成文件
+-- middleware  中间件
|   +-- setting.js  配置中心
|   +-- assist_macro.js 辅助宏
|   +-- log.js  日志模块,多实例，不同的request_id
+-- model 数据处理层
|   +-- formatter.js 不同数据类型间的转换(无用)
|   +-- loader.js 加载api_doc/api_flow以及测试用例,包含一些api的具体信息
|   +-- filter.js 过滤无用的api
|   +-- parser.js 解析apidoc里的jsonschema + apiflow中的特定规则生成test_case(暂时无用)
+-- service 服务层
|   +-- task.js 测试任务，一个task包含多个api，例如注册流程，生成一个log实例
|   +-- taskqueue.js 任务队列
+-- entry 入口
|   +-- mock.js test_case输入进行测试
|   +-- generate_case.js 根据json_schema自动生成test case
+-- api_flow.js 业务逻辑flow,用户自定义控制 
```

## 项目层次结构
```
grap
test_case层 -> model层 -> middleware层 -> service层           
```

## 一期目的
- json_schema 利用faker自动生成test_case

## todo
- 针对不同的定义流程进行加载
- json_schema自动生成test_case
- 合并一些特殊的test_case
- 环境变量，是否重新生成case
- 考虑是否搭建网站ui
