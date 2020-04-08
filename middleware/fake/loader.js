const faker = require('json-schema-faker');
const fs = require('fs');

const Base = require('../../lib/base_class');
const api_doc_json = require('../../api_doc.json');
const api_flow_json = require('../../api_flow.json');
const api_special_json = require('../../api_special_case.json');

// generate_case module
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

const overwriteByPublicParam = async (public_param_obj, api_result) => {
  for (const i in api_result.body) {
    if (!public_param_obj.hasOwnProperty(i)) continue;

    if (!public_param_obj[i]) {
      public_param_obj[i] = api_result.body[i];
    } else {
      api_result.body[i] = public_param_obj[i];
    }
  }

  for (const i in api_result.query) {
    if (!public_param_obj.hasOwnProperty(i)) continue;

    if (!public_param_obj[i]) {
      public_param_obj[i] = api_result.query[i];
    } else {
      api_result.query[i] = public_param_obj[i];
    }
  }
};

const overwriteBySpecialCondition = async (special_condition, api_result) => {
  if (typeof special_condition !== 'object') return;

  Object.keys(special_condition).forEach((i) => {
    if (typeof api_result.query === 'object' && api_result.query.hasOwnProperty(i)) {
      api_result.query[i] = special_condition[i];
    }

    if (typeof api_result.body === 'object' && !api_result.body.hasOwnProperty(i)) {
      api_result.body[i] = special_condition[i];
    }
  })
};

const fakerData = async (input) => new Promise((resolve) => {
  faker.resolve(input).then((result) => {
    resolve(result);
  })
});

const generatePath = async (special_condition, path_condition, api_result) => {
  if (typeof special_condition !== 'object' || typeof path_condition !== 'object') return;

  const path = await fakerData(path_condition);
  Object.keys(special_condition).forEach((i) => {
    if (path.hasOwnProperty(i)) {
      path[i] = special_condition[i];
    }
  });

  Object.keys(path).forEach((i) => {
    const temp_str = `:${i}`;
    api_result.url = api_result.url.replace(temp_str, path[i]);
  });
}

class Loader extends Base.factory() {
  constructor() {
    super();
    this._api_doc_map = new Map();
    this._test_cases = {};
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

  async _parseDoc2Info({
    api_name = '', real_api_name = '', public_param_obj = {}, special_condition = {}
  }) {
    const api_info = this._getApiDoc(real_api_name);

    const result = {
      api_name,
      real_api_name,
      method_type: api_info.method_type,
      url: api_info.url
    };

    if (typeof api_info.request.body !== 'undefined') {
      result.body = await fakerData(api_info.request.body);
    }

    if (typeof api_info.request.query !== 'undefined') {
      result.query = await fakerData(api_info.request.query);
    }

    await overwriteByPublicParam(public_param_obj, result);
    await overwriteBySpecialCondition(special_condition, result);
    await generatePath(special_condition, api_info.request.path, result);

    result.response = api_info.response;

    return result;
  }

  // 解析apidoc里的jsonschema + apiflow中的特定规则生成test_case;
  async _generateTestCaseFlow(api_flow) {
    const test_case_arr = [];
    const public_param_obj = {};

    // if (Array.isArray(api_flow.public_param)) {
    //   for(let key of Object.keys(api_flow.public_param)) {
    //     public_param_obj[key] = null;
    //   }
    // }

    for (const [key, value] of Objects.entries(api_flow.flow)) {
      const api_name = value;
      let real_api_name = api_name;
      const pos = api_name.indexOf('_');
      if (pos !== -1) {
        real_api_name = api_name.substr(0, pos);
      }

      const api_result = await this._parseDoc2Info({
        api_name,
        real_api_name,
        public_param_obj,
        special_condition: api_flow[api_name]
      });

      test_case_arr.push(api_result);
    }

    return test_case_arr;
  }

  loadApiDoc() {
    Object.keys(api_doc_json).forEach((i) => {
      if (docCheck(i, api_doc_json[i])) {
        this._api_doc_map.set(i, api_doc_json[i]);
      }
    });
  }

  _existInApiDoc(key) {
    if (!this._api_doc_map.has(key)) {
      throw new TypeError(`Loader::_generateTestCaseFlow: generate test case fail! The most likely reason is that ${key} does not exist in api_doc.js or its format is error`);
    }

    return true;
  }

  _getApiDoc(key) {
    if (this._existInApiDoc(key)) {
      return this._api_doc_map.get(key);
    }
  }

  async outputSpecialCase() {
    const special_json = {};

    Object.keys(api_special_json).forEach((i) => {
      if (this._existInApiDoc(i)) {
        const key = i;
        const api_doc = this._api_doc_map.get(i);
        const value = {};
        value.method_type = api_doc.method_type;
        value.url = api_doc.url;
        if (Array.isArray(api_special_json[i]) === true) {
          api_special_json[i].forEach((j) => {
            // todo,校验数据格式
          });
        }
        value.cases = api_special_json[i];

        special_json[key] = value;
      }
    });

    if (Object.keys(special_json).length !== 0) {
      fs.writeFileSync(this.special_test_case_path(), JSON.stringify(special_json, null, 4));
    }
  }

  async outputTestCaseFlow() {
    for (const i of Object.keys(api_flow_json)) {
      this._test_cases[i] = await this._generateTestCaseFlow(api_flow_json[i]);
    }

    fs.writeFileSync(this.temp_test_case_path(), JSON.stringify(this._test_cases, null, 4));
  }
}

module.exports = Loader;