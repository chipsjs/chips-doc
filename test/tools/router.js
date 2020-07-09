const _ = require('lodash');

const methods = ['get', 'post', 'put', 'delete'];
const router_map = {}; // key is url, value is funciton

class Router {
  static createMehotdsFunction() {
    methods.forEach((method) => {
      Router.prototype[method] = (url, callback) => {
        const temp_arr = url.split('/').map((path) => {
          if (path.indexOf(':') !== -1) {
            return '*';
          }
          return path;
        });

        const new_url = temp_arr.join('/');

        _.set(router_map, [new_url, method], callback);
      }
    });
  }

  static mock(url, method_type, request_config) {
    const response = {
      status: 404
    };
    if (_.has(router_map, [url, method_type])) {
      const callback = _.get(router_map, [url, method_type]);
      response.data = callback(request_config);
      response.status = 200;
    } else {
      const mock_path_arr = url.split('/');
      const result = Object.entries(router_map).find(([router_url]) => {
        const router_path_arr = router_url.split('/');
        if (mock_path_arr.length !== router_path_arr) return false;

        for (let index = 0; index < router_path_arr.length; index += 1) {
          if ((mock_path_arr[index] !== router_path_arr[index]) && (router_path_arr[index] !== '*')) {
            return false;
          }
        }

        return true;
      });

      if (result) {
        const [, callback] = result;
        // TODO, quick way to use path, optimize in the future
        _.set(request_config, ['path'], mock_path_arr);
        response.data = callback(request_config);
        response.status = 200;
      }
    }

    return response;
  }
}

Router.createMehotdsFunction();
const router = new Router();

router.get('/api1', (request_config) => {
  const { param1 } = request_config.params;
  if (typeof param1 === 'string' && param1.length < 10 && param1.length > 2) {
    return {
      success: false
    }
  }

  return {
    success: false
  }
});

router.post('/api2', (request_config) => {
  const { param1 } = request_config.data;

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
  const param1 = request_config.path[1];

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

router.post('/api4', async (request_config) => {
  const { success } = request_config.data;

  if (success) {
    return {
      success: true
    }
  }

  return {
    success: false
  }
});

router.post('/api5/:id/', async (request_config) => {
  const id = request_config.path[1];

  if (id === '1') {
    return {
      success: true
    }
  }
  return {
    success: false
  }
});

router.post('/api6', async (request_config) => {
  const { success } = request_config.params;

  return {
    success
  }
});

router.get('/api7', async (request_config) => {
  const { param1 } = request_config.params;
  if (param1 === '') {
    return {
      success: true
    };
  }

  return {
    success: false
  };
});

module.exports = Router;
