# Change Log

## v1.0.0

### 2019.12~2020.1

- first version：base feature,about support auto generate_case/mock/report
- author: kris.xu

### 2020.3

- support convert api_spec to json-schema
- author: kris.xu

### 2020.5

- support swagger ui and refactoring convert module(new design is based on swagger and convert swagger to json-schema, the old design is based on json-schema, it is not generic and simple enough)
- author: kris.xu

### 2020.6

- 1.refactor fake&mock module 2.add ut test for them 3.fix some bugs
- author: kris.xu

### 2020.7

- 1. refactor extension to support middlewares 2.fix bugs and add ut test
- author: kris.xu

### 2020.8

- 1. optimize ut test 2.add husky 3. support getswagger middleware
- author: kris.xu

## Sechedule

### v1.1.0

- items fake
- 自定义flow: 1.单个api
- 部分headers放入context中
- context build的时候创建而不是run时
- context 各层自己管理自己的context
- extensions的解析和处理都在flow这一层

### v1.2.0

- 更改flow test方式, 不用使用真实的mock server
- 记录flow中的历史数据, 不用重复输入

### no plan

- support flows
- support dependence flow of flow
- 考虑绝对路径来做key
