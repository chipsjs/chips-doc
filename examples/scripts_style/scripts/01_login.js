const Helper = require('../helper');

const ctx = {
  flow_name: 'login',
  context: {
    phone: '173xxxxxx62',
    password: 'Xxxx'
  },
};

Helper.runFlow(ctx);
