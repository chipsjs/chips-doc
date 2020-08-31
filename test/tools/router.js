const _ = require('lodash');

const methods = ['get', 'post', 'put', 'delete'];

class Router {
  constructor() {
    this.router_map = {}; // key is url, value is funciton
  }

  createMehotdsFunction() {
    methods.forEach((method) => {
      Router.prototype[method] = (url, callback) => {
        _.set(this.router_map, [url, method], callback);
      }
    });
  }

  /**
   *
   *
   * @param {string} url - url
   * @param {string} method_type - method
   * @param {object} request_config - request_config
   * @param {object} [request_config.params] - params
   * @param {object} [request_config.body] - body
   * @param {object} [request_config.headers] - headers
   * @returns {object} {status, data}
   * @memberof Router
   */
  fakeRequest(url, method_type, request_config) {
    const response = {
      status: 404
    };
    if (_.has(this.router_map, [url, method_type])) {
      const callback = _.get(this.router_map, [url, method_type]);
      response.data = callback(request_config);
      response.status = 200;
    } else {
      const mock_path_arr = url.split('/');
      const path = {};
      const match_url = Object.keys(this.router_map).find((router_url) => {
        const router_path_arr = router_url.split('/');
        if (mock_path_arr.length !== router_path_arr.length) return false;

        for (let index = 0; index < router_path_arr.length; index += 1) {
          const router_path_item = router_path_arr[index];
          if (mock_path_arr[index] !== router_path_item) {
            if (router_path_arr[index].indexOf(':') === -1) {
              return false;
            }

            path[router_path_item.substring(1)] = mock_path_arr[index];
          }
        }

        return true;
      });

      if (match_url) {
        const callback = _.get(this.router_map, [match_url, method_type]);
        response.data = callback({ ...request_config, path });
        response.status = 200;
      }
    }

    return response;
  }
}

const router = new Router();
router.createMehotdsFunction();
router.get('/api1', (request_config) => {
  const { param1 } = request_config.params;
  if (typeof param1 === 'string' && param1.length < 10 && param1.length > 2) {
    return {
      success: true
    }
  }

  return {
    success: false
  }
});

router.post('/api2', (request_config) => {
  const { param1 } = request_config.body;

  switch (param1) {
    case 'A':
    case 'B':
    case 'C':
      return {
        success: true
      };
    default:
      return {
        success: false
      };
  }
});

router.get('/api3/:param1', (request_config) => {
  const { param1 } = request_config.path;

  switch (param1) {
    case 'A':
    case 'B':
    case 'C':
      return {
        success: true
      };
    default:
      return {
        success: false
      };
  }
});

router.post('/api4', (request_config) => {
  const { success } = request_config.body;

  if (success) {
    return {
      success: true
    }
  }

  return {
    success: false
  }
});

router.post('/api5/:id/', (request_config) => {
  const { id } = request_config.path;

  if (id === '1') {
    return {
      success: true
    }
  }
  return {
    success: false
  }
});

router.post('/api6', (request_config) => {
  const { success } = request_config.body;

  return {
    success
  }
});

router.get('/api7', (request_config) => {
  const { param1 } = request_config.params;
  if (param1 === '') {
    return {
      success: false
    };
  }

  return {
    success: true
  };
});

router.post('/api8', (request_config) => {
  const { param } = request_config.body;
  if (param.a === 'b') {
    return {
      success: true
    };
  }

  return {
    success: false
  };
});

router.post('/api9', (request_config) => {
  const { param } = request_config.body;
  if (param.a === 'a') {
    return {
      success: true
    };
  }

  return {
    success: false
  };
});

router.post('/api10', (request_config) => {
  const { param } = request_config.body;
  if (param.a === 'kkk') {
    return {
      param: {
        a: 'a'
      }
    };
  }

  return {
    param: {
      a: 'b'
    }
  };
});

router.post('/api11', (request_config) => {
  const { param } = request_config.body;
  if (param === 'id:1,name:x') {
    return true;
  }

  return false;
});

router.get('/api12', (request_config) => {
  const { param } = request_config.params;
  if (param === 'id:1,name:x') {
    return true;
  }

  return false;
});

module.exports = router;
