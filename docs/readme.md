# ReadMe

## Project Introduction

- 一个E2E测试框架，用于。与开发有关的测试有两种， UT和E2E测试。 UT是单元测试， 用来保证某个函数或者某个中间件是稳定可靠的，但是有部分场景，比如想要知道线上某个接口，某个模块（如注册模块）是否是可靠的，这通过UT是没办法测试到的。E2E测试全名叫做端到端测试， 如字面意思， 从一端发起到另一端，保证的是这个过程中输入输出的可靠性和稳定性。市面上目前有一些e2e测试框架，但是都不足够通用不够灵活不够智能化。但是这个框架可以做到一次编写，case可以给多个使用。quick start可以见 <https://github.com/chipsjs/chips-doc/blob/master/docs/quick_start/mock_module.md>

## Project Structure

### Convert Module

- doc: docs/quick_start/convert_module.md
- feat: chips spec -> swagger

### Mock Module

- doc: docs/quick_start/mock_module.md
- feat: swagger + extension + flow -> mock

#### feat1: 由接口文档自动生成test_case模块

- 从接口文档中自动fake接口的body/params/path数据
- 同一个flow中可自定义多个api请求的public字段
- 支持flow中定义多个api，支持对flow中api的特殊要求（例如一个flow中某个api的特殊的数据）

#### feat2: mock以及check业务flow模块

- 支持多flow从test_case中加载测试用例并同步发送多api的http请求
- 支持case response的数据类型校验（to optimize，除数据类型外，对特定的值进行判断）
- 分为成功和失败输出每个flow的报告
- 设计固定的上下文字段，用于response中值的更新 
- base_url变量的处理(to optimize, 未来支持不同url的变量)
- 对特定的special_test_case的处理

## 优势

- 基于flow的数据模拟支持粒度更广，对header等公用字段的便捷化统一定义
- 自动生成测试用例并支持自动request以及response 强check
- 便于调试与定位bug，一次编写全组（cloud,android,ios）使用,不用费心调配各种环境
- 解决同事之间的低效沟通，规范后端与悉相关业移动端之间的开发接口，避免出现一个业务流程中少api，调错api以及调乱api的情况 
- 对不熟悉模块的开发更友善，能更快熟务逻辑
- 用于测试整个flow的时间
