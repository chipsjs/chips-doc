const { assert } = require('chai');
const fs = require('fs');
const _ = require('lodash');

const Convert = require('../middleware/convert/spec_convert');

describe('convert spec to generate api doc', () => {
  let specJson = {};
  let specResult = {};

  before('init convert task', () => {
    Convert.initialize({ log_module: console });
  })

  describe('normal spec', () => {
    before('set source data', () => {
      specJson = {
        'GET /test': {
          name: 'check  whether an email or phone exists',
          summary: 'check email or phone for duplicates',
          method: 'get',
          request: {
            query: {
              email: '[optional] string: user email',
              phone: '[required] string: user phone number,standard format is E164'
            }
          },
          response: {
            body: {
              exists: 'boolean',
              msg: 'string: detail message'
            },
          },
          note: 'it will return true or false to check if user is register and return detail msg after exists == false. request query are optional '
              + 'between email and phone, but will return 4xx err_code if query body is not one of these'
        }
      };
    });

    before('convert normal spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/normal');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].get);

      const {
        description, summary: outputSummary,
      } = specResult[api_name].get;
      const {
        summary: inputSummary,
        note,
        request: { query: inputQuery },
        response: { body: inputResponse }
      } = specJson['GET /test'];

      assert.strictEqual(outputSummary, inputSummary);
      assert.strictEqual(description, note);
      const outputResponseBody = _.get(specResult[api_name], ['get', 'responses', '200', 'content', 'application/json', 'schema']);
      const outputParameters = _.get(specResult[api_name], ['get', 'parameters']);
      assert.strictEqual(outputParameters.length, 2);
      assert.strictEqual(outputParameters[0].name, 'email');
      assert.strictEqual(outputParameters[0].in, 'query');
      assert.strictEqual(outputParameters[0].required, false);
      assert.nestedPropertyVal(outputParameters[0], 'schema.description', inputQuery.email);
      assert.nestedPropertyVal(outputParameters[0], 'schema.type', 'string');
      assert.strictEqual(outputParameters[1].name, 'phone');
      assert.strictEqual(outputParameters[1].in, 'query');
      assert.strictEqual(outputParameters[1].required, true);
      assert.nestedPropertyVal(outputParameters[1], 'schema.description', inputQuery.phone);
      assert.nestedPropertyVal(outputParameters[1], 'schema.type', 'string');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.type', 'string');
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.description', inputResponse.msg);
    });

    // after('clean file', () => {
    //   fs.unlinkSync('test/temp/normal_api_doc.json');
    // })
  });

  describe('special spec | has required object in query', () => {
    before('set source data', () => {
      specJson = {
        'GET /test': {
          name: 'check  whether an email or phone exists',
          summary: 'check email or phone for duplicates',
          method: 'get',
          request: {
            query: {
              required: {
                email: '[optional] string: user email',
                phone: '[required] string: user phone number,standard format is E164'
              }
            }
          },
          response: {
            body: {
              exists: 'boolean',
              msg: 'string: detail message'
            },
          },
          note: 'it will return true or false to check if user is register and return detail msg after exists == false. request query are optional '
              + 'between email and phone, but will return 4xx err_code if query body is not one of these'
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].get);

      const {
        description, summary: outputSummary,
      } = specResult[api_name].get;
      const {
        summary: inputSummary,
        note,
        response: { body: inputResponse }
      } = specJson['GET /test'];

      assert.strictEqual(outputSummary, inputSummary);
      assert.strictEqual(description, note);
      const outputParameters = _.get(specResult[api_name], ['get', 'parameters']);
      const inputQuery = _.get(specJson, ['GET /test', 'request', 'query', 'required']);
      assert.strictEqual(outputParameters.length, 2);
      assert.strictEqual(outputParameters[0].name, 'email');
      assert.strictEqual(outputParameters[0].in, 'query');
      assert.strictEqual(outputParameters[0].required, true);
      assert.nestedPropertyVal(outputParameters[0], 'schema.description', inputQuery.email);
      assert.nestedPropertyVal(outputParameters[0], 'schema.type', 'string');
      assert.strictEqual(outputParameters[1].name, 'phone');
      assert.strictEqual(outputParameters[1].in, 'query');
      assert.strictEqual(outputParameters[1].required, true);
      assert.nestedPropertyVal(outputParameters[1], 'schema.description', inputQuery.phone);
      assert.nestedPropertyVal(outputParameters[1], 'schema.type', 'string');
      const outputResponseBody = _.get(specResult[api_name], ['get', 'responses', '200', 'content', 'application/json', 'schema']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.type', 'string');
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.description', inputResponse.msg);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('special spec | has required object in body', () => {
    before('set source data', () => {
      specJson = {
        'POST /test': {
          name: 'check  whether an email or phone exists',
          summary: 'check email or phone for duplicates',
          method: 'post',
          request: {
            body: {
              required: {
                email: 'string: user email',
              }
            }
          },
          response: {
            body: {
              exists: 'boolean',
            },
          },
          note: 'it will return true or false to check if user is register and return detail msg after exists == false. request query are optional '
              + 'between email and phone, but will return 4xx err_code if query body is not one of these'
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);

      const {
        description, summary: outputSummary,
      } = specResult[api_name].post;
      const {
        summary: inputSummary,
        note,
        response: { body: inputResponse }
      } = specJson['POST /test'];

      assert.strictEqual(outputSummary, inputSummary);
      assert.strictEqual(description, note);

      const outputRequestBody = _.get(specResult, [api_name, 'post', 'requestBody', 'content', 'application/json', 'schema']);
      assert.strictEqual(outputRequestBody.type, 'object');
      assert.nestedPropertyVal(outputRequestBody, 'properties.email.type', 'string');
      assert.deepEqual(outputRequestBody.required, ['email']);
      const inputBody = _.get(specJson, ['POST /test', 'request', 'body', 'required']);
      assert.nestedPropertyVal(outputRequestBody, 'properties.email.description', inputBody.email);

      const outputResponseBody = _.get(specResult[api_name], ['post', 'responses', '200', 'content', 'application/json', 'schema']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('special spec | method type instead of method and method is uppercase', () => {
    before('set source data', () => {
      specJson = {
        'GET /test': {
          name: 'check whether an email or phone exists',
          summary: 'check email or phone for duplicates',
          method_type: 'GET',
          request: {
            query: {
              email: '[optional] string: user email',
              phone: '[required] string: user phone number,standard format is E164'
            }
          },
          response: {
            body: {
              exists: 'boolean',
              msg: 'string: detail message'
            },
          }
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].get);

      const {
        description, summary: outputSummary,
      } = specResult[api_name].get;
      const {
        summary: inputSummary,
        note,
        request: { query: inputQuery },
        response: { body: inputResponse }
      } = specJson['GET /test'];

      assert.strictEqual(outputSummary, inputSummary);
      assert.strictEqual(description, note);

      const outputParameters = _.get(specResult[api_name], ['get', 'parameters']);
      assert.strictEqual(outputParameters.length, 2);
      assert.strictEqual(outputParameters[0].name, 'email');
      assert.strictEqual(outputParameters[0].in, 'query');
      assert.strictEqual(outputParameters[0].required, false);
      assert.nestedPropertyVal(outputParameters[0], 'schema.description', inputQuery.email);
      assert.nestedPropertyVal(outputParameters[0], 'schema.type', 'string');
      assert.strictEqual(outputParameters[1].name, 'phone');
      assert.strictEqual(outputParameters[1].in, 'query');
      assert.strictEqual(outputParameters[1].required, true);
      assert.nestedPropertyVal(outputParameters[1], 'schema.description', inputQuery.phone);
      assert.nestedPropertyVal(outputParameters[1], 'schema.type', 'string');

      const outputResponseBody = _.get(specResult[api_name], ['get', 'responses', '200', 'content', 'application/json', 'schema']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('special spec | has special type, such as int/Boolean instead of number/boolean', () => {
    before('set source data', () => {
      specJson = {
        'POST /test': {
          method_type: 'POST',
          request: {
            body: {
              year: 'int'
            }
          },
          response: {
            body: {
              exists: 'Boolean',
            },
          }
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);

      const {
        request: { body: inputBody },
        response: { body: inputResponse }
      } = specJson['POST /test'];

      const outputRequestBody = _.get(specResult, [api_name, 'post', 'requestBody', 'content', 'application/json', 'schema']);
      assert.strictEqual(outputRequestBody.type, 'object');
      assert.nestedPropertyVal(outputRequestBody, 'properties.year.type', 'integer');
      assert.nestedPropertyVal(outputRequestBody, 'properties.year.description', inputBody.year);

      const outputResponseBody = _.get(specResult, [api_name, 'post', 'responses', '200', 'content', 'application/json', 'schema']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('special spec | has special type, such as object prefix in description', () => {
    before('set source data', () => {
      specJson = {
        'POST /test': {
          method_type: 'Post',
          request: {
            body: {
              year: 'object start_year'
            }
          },
          response: {
            body: {
              exists: 'Boolean',
            },
          }
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);

      const {
        request: { body: inputBody },
        response: { body: inputResponse }
      } = specJson['POST /test'];

      const outputRequestBody = _.get(specResult, [api_name, 'post', 'requestBody', 'content', 'application/json', 'schema']);
      assert.strictEqual(outputRequestBody.type, 'object');
      assert.nestedPropertyVal(outputRequestBody, 'properties.year.type', 'object');
      assert.nestedPropertyVal(outputRequestBody, 'properties.year.description', inputBody.year);

      const outputResponseBody = _.get(specResult, [api_name, 'post', 'responses', '200', 'content', 'application/json', 'schema']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('special spec | has special type, such as array prefix in description', () => {
    before('set source data', () => {
      specJson = {
        'POST /test': {
          method_type: 'Post',
          request: {
            body: {
              year: 'array start_year'
            }
          },
          response: {
            body: {
              exists: 'Boolean',
            },
          }
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);

      const {
        request: { body: inputBody },
        response: { body: inputResponse }
      } = specJson['POST /test'];

      const outputRequestBody = _.get(specResult, [api_name, 'post', 'requestBody', 'content', 'application/json', 'schema']);
      assert.strictEqual(outputRequestBody.type, 'object');
      assert.nestedPropertyVal(outputRequestBody, 'properties.year.type', 'array');
      assert.nestedPropertyVal(outputRequestBody, 'properties.year.description', inputBody.year);

      const outputResponseBody = _.get(specResult, [api_name, 'post', 'responses', '200', 'content', 'application/json', 'schema']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('special spec | has object in object', () => {
    before('set source data', () => {
      specJson = {
        'POST /test': {
          method_type: 'POST',
          request: {
            body: {
              birth: {
                year: 'object birth_year'
              }
            }
          },
          response: {
            body: {
              exists: 'Boolean',
            },
          }
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);

      const {
        request: { body: inputBody },
        response: { body: inputResponse }
      } = specJson['POST /test'];

      const outputRequestBody = _.get(specResult, [api_name, 'post', 'requestBody', 'content', 'application/json', 'schema']);
      assert.strictEqual(outputRequestBody.type, 'object');
      assert.nestedPropertyVal(outputRequestBody, 'properties.birth.type', 'object');
      assert.nestedPropertyVal(outputRequestBody, 'properties.birth.properties.year.type', 'object');
      assert.nestedPropertyVal(outputRequestBody, 'properties.birth.properties.year.description', inputBody.birth.year);

      const outputResponseBody = _.get(specResult, [api_name, 'post', 'responses', '200', 'content', 'application/json', 'schema']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('special spec | unknown type 1', () => {
    before('set source data', () => {
      specJson = {
        'POST /test': {
          method_type: 'post',
          request: {
            body: {
              year: 'birdary year'
            }
          },
          response: {
          }
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);

      const {
        request: { body: inputBody },
      } = specJson['POST /test'];

      const outputRequestBody = _.get(specResult, [api_name, 'post', 'requestBody', 'content', 'application/json', 'schema']);
      assert.strictEqual(outputRequestBody.type, 'object');
      assert.notNestedProperty(outputRequestBody, 'properties.year.type');
      assert.nestedPropertyVal(outputRequestBody, 'properties.year.description', inputBody.year);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('special spec | unknown type 2', () => {
    before('set source data', () => {
      specJson = {
        'POST /test': {
          method_type: 'post',
          request: {
            body: {
              year: []
            }
          },
          response: {
          }
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);

      const outputRequestBody = _.get(specResult, [api_name, 'post', 'requestBody', 'content', 'application/json', 'schema']);
      assert.strictEqual(outputRequestBody.type, 'object');
      assert.nestedPropertyVal(outputRequestBody, 'properties.year.type', 'array');
      assert.notNestedProperty(outputRequestBody, 'properties.year.items.type');
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('special spec | api name have too many space', () => {
    before('set source data', () => {
      specJson = {
        'GET    /test': {
          name: 'check whether an email or phone exists',
          method: 'get',
          request: {
          },
          response: {
            body: {
              exists: 'boolean',
            },
          },
        }
      };
    });

    before('convert spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].get);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('multi spec', () => {
    before('set source data', () => {
      specJson = {
        'GET /test1': {
          name: 'check  whether an email or phone exists',
          summary: 'check email or phone for duplicates',
          method: 'get',
          request: {
            query: {
              optional: {
                email: 'string: user email',
                phone: 'string: user phone number,standard format is E164'
              }
            }
          },
          response: {
            body: {
              exists: 'boolean',
              msg: 'string: detail message'
            },
          },
        },
        'GET /test2': {
          name: 'check  whether an email or phone exists',
          summary: 'check email or phone for duplicates',
          method: 'get',
          request: {
            query: {
              required: {
                email: 'string: user email',
                phone: 'string: user phone number,standard format is E164'
              }
            }
          },
          response: {
            body: {
              exists: 'boolean',
              msg: 'string: detail message'
            },
          },
          note: 'it will return true or false to check if user is register and return detail msg after exists == false. request query are optional '
              + 'between email and phone, but will return 4xx err_code if query body is not one of these'
        }
      };
    });

    before('convert multi spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/multi');
    });

    it('should generate correct api doc', () => {
      {
        const api_name = '/test1';
        assert.exists(specResult[api_name]);
        assert.exists(specResult[api_name].get);

        const {
          description, summary: outputSummary,
        } = specResult[api_name].get;
        const {
          summary: inputSummary,
          note,
          request: { query: inputQuery },
          response: { body: inputResponse }
        } = specJson['GET /test1'];

        assert.strictEqual(outputSummary, inputSummary);
        assert.strictEqual(description, note);

        const outputParameters = _.get(specResult[api_name], ['get', 'parameters']);
        assert.strictEqual(outputParameters.length, 2);
        assert.strictEqual(outputParameters[0].name, 'email');
        assert.strictEqual(outputParameters[0].in, 'query');
        assert.strictEqual(outputParameters[0].required, false);
        assert.nestedPropertyVal(outputParameters[0], 'schema.description', inputQuery.optional.email);
        assert.nestedPropertyVal(outputParameters[0], 'schema.type', 'string');
        assert.strictEqual(outputParameters[1].name, 'phone');
        assert.strictEqual(outputParameters[1].in, 'query');
        assert.strictEqual(outputParameters[1].required, false);
        assert.nestedPropertyVal(outputParameters[1], 'schema.description', inputQuery.optional.phone);
        assert.nestedPropertyVal(outputParameters[1], 'schema.type', 'string');

        const outputResponseBody = _.get(specResult[api_name], ['get', 'responses', '200', 'content', 'application/json', 'schema']);
        assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
        assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
        assert.nestedPropertyVal(outputResponseBody, 'properties.msg.type', 'string');
        assert.nestedPropertyVal(outputResponseBody, 'properties.msg.description', inputResponse.msg);
      }

      {
        const api_name = '/test2';
        assert.exists(specResult[api_name]);
        assert.exists(specResult[api_name].get);

        const {
          description, summary: outputSummary,
        } = specResult[api_name].get;
        const {
          summary: inputSummary,
          note,
          request: { query: inputQuery },
          response: { body: inputResponse }
        } = specJson['GET /test2'];

        assert.strictEqual(outputSummary, inputSummary);
        assert.strictEqual(description, note);

        const outputParameters = _.get(specResult[api_name], ['get', 'parameters']);
        assert.strictEqual(outputParameters.length, 2);
        assert.strictEqual(outputParameters[0].name, 'email');
        assert.strictEqual(outputParameters[0].in, 'query');
        assert.strictEqual(outputParameters[0].required, true);
        assert.nestedPropertyVal(outputParameters[0], 'schema.description', inputQuery.required.email);
        assert.nestedPropertyVal(outputParameters[0], 'schema.type', 'string');
        assert.strictEqual(outputParameters[1].name, 'phone');
        assert.strictEqual(outputParameters[1].in, 'query');
        assert.strictEqual(outputParameters[1].required, true);
        assert.nestedPropertyVal(outputParameters[1], 'schema.description', inputQuery.required.phone);
        assert.nestedPropertyVal(outputParameters[1], 'schema.type', 'string');

        const outputResponseBody = _.get(specResult[api_name], ['get', 'responses', '200', 'content', 'application/json', 'schema']);
        assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
        assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
        assert.nestedPropertyVal(outputResponseBody, 'properties.msg.type', 'string');
        assert.nestedPropertyVal(outputResponseBody, 'properties.msg.description', inputResponse.msg);
      }
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/multi_api_doc.json');
    })
  });

  describe('special spec | request && response undefined', () => {
    before('set source data', () => {
      specJson = {
        'GET /test': {
          method: 'get',
        }
      };
    });

    before('convert normal spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].get);
      const description = _.get(specResult, [api_name, 'get', 'responses', '200', 'description']);
      assert.strictEqual(description, '');
      const schema = _.get(specResult, [api_name, 'get', 'responses', '200', 'content', 'application/json', 'schema']);
      assert.exists(schema);
    });

    // TODO, need done
    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('normal spec | path', () => {
    before('set source data', () => {
      specJson = {
        'POST /test/:userID': {
          method_type: 'Post',
        }
      };
    });

    before('convert normal spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/normal_path');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test/:userID';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);
      assert.nestedPropertyVal(specResult[api_name], 'parameters.length', 1);
      assert.nestedPropertyVal(specResult[api_name], 'parameters[0].in', 'path');
      assert.nestedPropertyVal(specResult[api_name], 'parameters[0].name', 'userID');
      assert.nestedPropertyVal(specResult[api_name], 'parameters[0].required', true);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/normal_path_api_doc.json');
    })
  });

  describe('special spec | api name no exist method type', () => {
    before('set source data', () => {
      specJson = {
        '/test': {
          method: 'post',
          request: {
          }
        }
      }
    });

    before('convert normal spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    });
  });

  describe('special spec | anyOf', () => {
    before('set source data', () => {
      specJson = {
        '/test': {
          method: 'get',
          response: {
            body: {
              anyOf: {
                A: '111',
                B: '222',
              }
            }
          }
        }
      }
    });

    before('convert normal spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].get);
      const schema = _.get(specResult, [api_name, 'get', 'responses', '200', 'content', 'application/json', 'schema']);
      const { A, B } = _.get(specJson, [api_name, 'response', 'body', 'anyOf']);
      assert.nestedPropertyVal(schema, 'properties.A.description', A);
      assert.nestedPropertyVal(schema, 'properties.B.description', B);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    });
  });

  describe('special spec | oneof', () => {
    before('set source data', () => {
      specJson = {
        '/test': {
          method: 'get',
          response: {
            body: {
              oneof: {
                A: '111',
                B: '222',
              }
            }
          }
        }
      }
    });

    before('convert normal spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].get);
      const schema = _.get(specResult, [api_name, 'get', 'responses', '200', 'content', 'application/json', 'schema']);
      const { A, B } = _.get(specJson, [api_name, 'response', 'body', 'oneof']);
      assert.nestedPropertyVal(schema, 'properties.A.description', A);
      assert.nestedPropertyVal(schema, 'properties.B.description', B);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    });
  });
});
