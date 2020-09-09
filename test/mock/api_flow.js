/* eslint-disable no-template-curly-in-string */
const helper = require('../tools/helper');

module.exports = {
  flow_1: {
    flow: ['get /api1']
  },
  flow_2: {
    flow: ['get /api1'],
    extensions: {
      'get /api1': [
        {
          middleware: 'httpclient',
          params: {
            request: {
              param1: 'A'
            }
          }
        }
      ]
    }
  },
  flow_3: {
    flow: ['post /api2']
  },
  flow_4: {
    flow: ['post /api2'],
    extensions: {
      'post /api2': [{
        middleware: 'httpclient',
        params: {
          request: {
            param1: 'D'
          }
        }
      }]
    }
  },
  flow_5: {
    flow: ['get /api3/:param1']
  },
  flow_6: {
    flow: ['get /api3/:param1'],
    extensions: {
      'get /api4': [{
        middleware: 'httpclient',
        params: {
          request: {
            param1: 'D'
          }
        }
      }]
    }
  },
  flow_7: {
    flow: ['post /api2@1', 'post /api2@2'],
    extensions: {
      'post /api2@2': [{
        middleware: 'httpclient',
        params: {
          request: {
            param1: 'D'
          }
        }
      }]
    }
  },
  flow_8: {
    flow: ['post /api2', 'get /api1']
  },
  flow_9: {
    flow: ['post /api2', 'post /api4'],
    context: {
      params: ['success']
    }
  },
  flow_10: {
    flow: ['post /api5/:id/']
  },
  flow_11: {
    flow: ['post /api6']
  },
  flow_12: {
    flow: ['post /api2', 'get /api1'],
    extensions: {
      'post /api2': [
        {
          middleware: 'controller',
          params: {
            ignore: {
              task_id: 'get /api1',
              condition: {
                success: true
              }
            }
          }
        }
      ]
    }
  },
  flow_13: {
    flow: ['get /api1@1', 'get /api1@2']
  },
  flow_14: {
    flow: ['post /api2', 'get /api1'],
    extensions: {
      'post /api2': [
        {
          middleware: 'controller',
          params: {
            ignore: {
              task_id: 'get /api1',
              condition: {
                success: false
              }
            }
          }
        }
      ]
    }
  },
  flow_15: {
    flow: ['post /api2', 'get /api1'],
    extensions: {
      'post /api2': [
        {
          middleware: 'controller',
          params: {
            useless_key: {
              task_id: 'get /api1',
              condition: {
                success: true
              }
            }
          }
        }
      ]
    }
  },
  flow_16: {
    flow: ['post /api2', 'get /api1'],
    extensions: {
      'post /api2': [
        {
          middleware: 'unknown',
          params: {
            ignore: {
              task_id: 'get /api1',
              condition: {
                success: false
              }
            }
          }
        }
      ]
    }
  },
  flow_17: {
    flow: ['get /api7']
  },
  flow_18: {
    flow: ['get /api3/:param1'],
    extensions: {
      'get /api3/:param1': [
        {
          middleware: 'httpclient',
          params: {
            request: {
              param1: 'C'
            }
          }
        }
      ]
    }
  },
  flow_19: {
    flow: ['A', 'B', 'C', 'D'],
    extensions: {
      A: [
        {
          middleware: 'httpclient',
          params: {
            request: {
              param1: 'context'
            }
          }
        }
      ],
      B: [
        {
          middleware: 'controller',
          params: {
            ignore: {
              task_id: 'D',
              condition: {
                'user.b.success': true
              }
            }
          }
        }
      ],
      D: [
        {
          middleware: 'httpclient',
          params: {
            request: {
              param1: 'kkk'
            }
          }
        }
      ]
    }
  },
  flow_20: {
    flow: ['get /api1'],
    extensions: {
      'get /api1': [
        {
          middleware: 'getswagger',
          params: {
            version: 'v2'
          }
        }
      ]
    }
  },
  flow_21: {
    flow: ['post /api8'],
    context: {
      params: {
        id: 'b'
      },
      scope: {
        id: ['param.a']
      }
    }
  },
  flow_22: {
    flow: ['post /api8'],
    extensions: {
      'post /api8': [
        {
          middleware: 'httpclient',
          params: {
            request: {
              'param.a': 'c'
            }
          }
        }
      ]
    },
    context: {
      params: {
        id: 'b'
      },
      scope: {
        id: ['param.a']
      }
    }
  },
  flow_23: {
    flow: ['post /api8'],
    context: {
      params: {
        'param.a': 'b'
      }
    }
  },
  flow_24: {
    flow: ['post /api8', 'post /api9'],
    context: {
      params: ['param.a']
    }
  },
  flow_25: {
    flow: ['post /api10', 'post /api9'],
    context: {
      params: ['param.a']
    }
  },
  flow_26: {
    flow: ['post /api11'],
    extensions: {
      'post /api11': [
        {
          middleware: 'httpclient',
          params: {
            request: {
              param: 'id:${id},name:${name}'
            }
          }
        }
      ]
    },
    context: {
      params: {
        id: '1',
        name: 'x'
      }
    }
  },
  flow_27: {
    flow: ['get /api12'],
    extensions: {
      'get /api12': [
        {
          middleware: 'httpclient',
          params: {
            request: {
              param: 'id:${id},name:${name}'
            }
          }
        }
      ]
    },
    context: {
      params: {
        id: '1',
        name: 'x'
      }
    }
  },
  flow_28: {
    flow: ['post /api13'],
    extensions: {
      'post /api13': [
        {
          middleware: 'httpclient',
          params: {
            request: {
              ids: ['${a}', '${b}']
            }
          }
        }
      ]
    },
    context: {
      params: {
        a: '0',
        b: '1'
      }
    }
  },
  onlymock_post: {
    flow: ['post /api/onlymock'],
    extensions: {
      'post /api/onlymock': [
        {
          middleware: 'getswagger',
          params: {
            onlymock: ['a']
          }
        }
      ]
    }
  },
  onlymock_query: {
    flow: ['get /api/onlymock'],
    extensions: {
      'get /api/onlymock': [
        {
          middleware: 'getswagger',
          params: {
            onlymock: ['a']
          }
        }
      ]
    }
  },
  controller_after_function_response: {
    flow: ['get /api1'],
    extensions: {
      'get /api1': [
        {
          middleware: 'secretfunction',
          params: {
            after: (ctx, res) => {
              const a = res.success;
              if (a) {
                helper.callFunction();
              }
            }
          }
        }
      ]
    },
    context: {
      params: ['success']
    }
  },
  controller_before_function: {
    flow: ['get /api1'],
    extensions: {
      'get /api1': [
        {
          middleware: 'secretfunction',
          params: {
            before: (ctx) => {
              const { a } = ctx.params;
              if (a) {
                helper.callFunction();
              }
            }
          }
        }
      ]
    },
    context: {
      params: {
        a: true
      }
    }
  },
  controller_after_function_context: {
    flow: ['get /api1'],
    extensions: {
      'get /api1': [
        {
          middleware: 'secretfunction',
          params: {
            after: (ctx, res) => {
              const { success } = ctx.params;
              if (success) {
                helper.callFunction();
              }
            }
          }
        }
      ]
    },
    context: {
      params: {
        success: true
      }
    }
  },
  controller_dest_task: {
    flow: ['post /api2', 'post /api4', 'get /api1', 'get /api7'],
    extensions: {
      'post /api2': [
        {
          middleware: 'controller',
          params: {
            dest: {
              task_id: 'get /api1',
              condition: {
                success: true
              }
            }
          }
        }
      ]
    }
  },
  controller_dest_flow: {
    flow: ['post /api2', 'post /api4', 'get /api1'],
    extensions: {
      'post /api2': [
        {
          middleware: 'controller',
          params: {
            dest: {
              flow_id: 'controller_dest_flow_2',
              condition: {
                success: true
              }
            }
          }
        }
      ]
    },
    context: {
      params: ['success']
    }
  },
  controller_dest_flow_2: {
    flow: ['post /api14'],
    context: {
      params: {
        success: false
      }
    }
  }
}
