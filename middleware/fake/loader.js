const faker = require('json-schema-faker');
const fs = require('fs');

const Base = require('../../lib/base_class');
const loop = require('../../lib/loop');

/**
 * api doc format check
 *
 * @param {string} api_name - api name
 * @param {object} api_doc_info - a field in json
 * @return {boolean} successFlag - return true when format is correct
 */
const docCheck = async (api_name, api_doc_info) => {
  if (typeof api_name === 'undefined' || typeof api_doc_info.method_type === 'undefined' || typeof api_doc_info.url === 'undefined') {
    throw new TypeError(`Loader::docCheck: api doc format error! api name is ${api_name}`);
  }

  switch (api_doc_info.method_type) {
    case 'get':
    case 'post':
    case 'put':
    case 'delete':
      // do nothing;
      break;
    default:
      throw new TypeError(`Loader::docCheck: api doc format error! api name is ${api_name}`);
  }

  return true;
};

/**
 * generate context param for test case flow
 *
 * @param {object} public_param_obj - context param
 * @param {object} request_param - request param, request.body or request.query
 * @return {valid}
 */
const _overwriteByPublicParam = async (public_param_obj, request_param = {}) => {
  Object.entries(request_param).forEach(([key, value]) => {
    // eslint-disable-next-line no-prototype-builtins
    if (value && public_param_obj.hasOwnProperty(key)) {
      if (!public_param_obj[key]) {
        // eslint-disable-next-line no-param-reassign
        public_param_obj[key] = value;
      } else {
        // eslint-disable-next-line no-param-reassign
        request_param[key] = public_param_obj[key];
      }
    }
  });
};

/**
 * generate specified value in param for test case flow
 *
 * @param {object} special_condition - param need to be specified
 * @param {object} request_param - request param, request.body or request.query
 * @return {valid}
 */
const _overwriteBySpecialCondition = async (special_condition, request_param) => {
  if (typeof special_condition !== 'object' || request_param !== 'object') return;

  Object.entries(special_condition).forEach(([key, value]) => {
    if (request_param.hasOwnProperty(key)) {
      request_param[key] = value;
    }
  });
};

/**
 * faker data to generate test case from api doc
 *
 * @param {object} input - data rule on json-schema
 * @return {valid}
 */
const _fakerData = async (input) => new Promise((resolve) => {
  faker.resolve(input).then((result) => {
    resolve(result);
  })
});

/**
 * generate http path, such as houseID/:userID -> houseID/123901547
 *
 * @param {object} special_condition - param need to be specified
 * @param {object} path_condition - param rule on json-schema
 * @return {url} - new url or null
 */
const _generateUrl = async (special_condition, path_condition, url) => {
  if (typeof special_condition !== 'object' || typeof path_condition !== 'object') return null;

  const path = await _fakerData(path_condition);
  Object.keys(special_condition).forEach((i) => {
    if (path.hasOwnProperty(i)) {
      path[i] = special_condition[i];
    }
  });
  const new_url = Object.entries(path).reduce((temp_url, [key, value]) => {
    return temp_url.replace(`:${key}`, value);
  }, url);

  return new_url;
}

class Loader extends Base.factory() {
  constructor() {
    super();
    this._api_doc_map = new Map();
  }

  static initialize({ log_module, temp_test_case_path, special_test_case_path }) {
    this.loadInstance({
      read_only_properties: {
        logger: log_module || console,
        temp_test_case_path,
        special_test_case_path
      }
    });
  }

  /**
   * parse api doc format to test case
   * @param {object} [doc] -
   * @param {string} [doc.api_name] - such as postUser_1 || postUser_2
   * @param {string} [doc.real_api_name] - such as postUser
   * @param {object} [doc.public_param_obj] - context param
   * @param {object} [doc.special_condition] - param need to be specified
   * @return {object} test_case - test case which has faker data
   */
  async _parseDoc2TestCase({
    api_name = '', real_api_name = '', public_param_obj = {}, special_condition = {}
  }) {
    const api_info = this._getApiDoc(real_api_name);
    if (!api_info) throw new TypeError(`no exist ${real_api_name} in api doc`);
    const test_case = {
      api_name,
      real_api_name,
      method_type: api_info.method_type,
      url: await _generateUrl(special_condition, api_info.request.path, api_info.url)
    };

    if (typeof api_info.request !== 'undefined') {
      if (typeof api_info.request.body !== 'undefined') {
        test_case.body = await _fakerData(api_info.request.body);
        await _overwriteByPublicParam(public_param_obj, test_case.body);
        await _overwriteBySpecialCondition(special_condition, test_case.body);
      }
      if (typeof api_info.request.query !== 'undefined') {
        test_case.query = await _fakerData(api_info.request.query);
        await _overwriteByPublicParam(public_param_obj, test_case.query);
        await _overwriteBySpecialCondition(special_condition, test_case.query);
      }
    }

    test_case.response = api_info.response;
    return test_case;
  }

  /**
   * parse api doc format to test case
   * @param {object} api_flow - api doc flow based on specific rules,
   *    such as one item in api_flow_template.json
   * @return {object} test_case - test case which has faker data
   */
  async _generateTestCaseFlow(api_flow) {
    const public_param_obj = {};
    // necessary
    if (Array.isArray(api_flow.public_param)) {
      Object.keys(api_flow.public_param).forEach((key) => {
        public_param_obj[key] = null;
      });
    }

    const test_case_flow = await loop.reduce(api_flow.flow.values(),
      async (temp_test_case_flow, item) => {
        const api_name = api_flow.flow[item];
        let real_api_name = api_name;
        const pos = api_name.indexOf('_');
        if (pos !== -1) {
          real_api_name = api_name.substr(0, pos);
        }

        const test_case = await this._parseDoc2TestCase({
          api_name,
          real_api_name,
          public_param_obj,
          special_condition: api_flow[api_name]
        });

        temp_test_case_flow.push(test_case);
        return temp_test_case_flow;
      }, []);

    return test_case_flow;
  }

  /**
   * load api doc
   * @param {json} api_doc_json - json that follows api doc format
   * @return {valid}
  */
  loadApiDoc(api_doc_json) {
    Object.keys(api_doc_json).forEach((i) => {
      if (docCheck(i, api_doc_json[i])) {
        this._api_doc_map.set(i, api_doc_json[i]);
      }
    });
  }

  /**
   * exist this api_name in api doc
   * @param {string} api_name - api name
   * @return {boolean} - true || false
   */
  _existInApiDoc(api_name) {
    if (!this._api_doc_map.has(api_name)) {
      return false;
    }

    return true;
  }

  /**
   * get api doc after loadApiDoc
   * @param {string} api_name - json that follows api doc format which is generated by convert.js
   * @return {object} - one api in api doc
   */
  _getApiDoc(api_name) {
    if (!this._existInApiDoc(api_name)) {
      throw new TypeError(`Loader::_existInApiDoc: generate test case fail! The most likely reason is that ${api_name} does not exist in api_doc.js or its format is error`);
    }

    return this._api_doc_map.get(api_name);
  }

  /**
   * output file which is test case flow
   * @param {json} api_special_json -
   *    json that follows api doc format which is generate by user specify
   * @return {valid}
   */
  // todo
  async outputSpecialCase(api_special_json) {
    const special_json = Object.entries(api_special_json).reduce(temp_test_case_flow, ([key, value]) => {
      if (this._existInApiDoc(key)) {
        const api_doc = this._api_doc_map.get(key);
        const test_case = {
          method_type: api_doc.method_type,
          url: api_doc.url
        };
        // if (Array.isArray(api_special_json[i]) === true) {
        //   api_special_json[i].forEach((j) => {
        //     // todo,校验数据格式
        //   });
        // }
        test_case.cases = value;

        temp_test_case_flow[key] = value;
        return temp_test_case_flow;
      }
    }, {});

    if (Object.keys(special_json).length !== 0) {
      fs.writeFileSync(this.special_test_case_path(), JSON.stringify(special_json, null, 2));
    }
  }

  /**
   * output file which is test case flow
   * @param {json} api_doc_json - json that follows api doc format which is generated by convert.js
   * @return {valid}
   */
  async outputTestCaseFlow(api_flow_json) {
    const test_cases = await loop.reduce(Object.entries(api_flow_json), async (prev, item) => {
      const [key, value] = item;
      // eslint-disable-next-line no-param-reassign
      prev[key] = await this._generateTestCaseFlow(value);
    }, {});

    fs.writeFileSync(this.temp_test_case_path(), JSON.stringify(test_cases, null, 2));
  }
}

module.exports = Loader;
