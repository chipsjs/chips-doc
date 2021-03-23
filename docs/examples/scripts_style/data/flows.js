/* eslint-disable no-template-curly-in-string */

const template_flows = {
  login: {
    flow: ['post /session', 'post /validation/:idtype'],
    extensions: {
      'post /session': [
        {
          middleware: 'controller',
          params: {
            dest: {
              task_id: 'no',
              condition: {
                hasVerified: true
              }
            }
          }
        },
      ],
      'post /validation/:type': [
        {
          middleware: 'httpclient',
          params: {
            request: {
              type: 'phone',
              value: '+86${phone}'
            }
          }
        }
      ]
    },
    context: {
      params: ['phone', 'accessToken', 'password'],
      scope: {
        accessToken: ['post /session.accessToken']
      }
    }
  },
};

module.exports = template_flows;
