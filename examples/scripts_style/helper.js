/* eslint-disable no-console */
const { FlowManager } = require('chips-doc');
const template_flows = require('./data/flows')
const swaggers = require('./data/swagger.json');

class Helper {
  static outputResult(reports, log_level) {
    const { report, fail_report } = reports;
    let result;
    console.log('==================');
    switch (log_level) {
      case 'debug':
        result = reports;
        break;
      case 'info':
        result = report.map((item) => {
          if (item.isRequest) {
            return {
              url: item.url,
              method: item.method,
              params: item.params,
              data: item.data
            }
          }

          return {
            url: item.url,
            status: item.response.status,
            reponse: item.response.data
          }
        })
        break;
      case 'error':
        result = null;
        break;
      default: break;
    }
    if (result) {
      result.forEach((item) => {
        console.log(JSON.stringify(item));
      })
    }

    console.log('==================');
    if (fail_report) {
      console.error('===fail_report===');
      console.error(JSON.stringify(fail_report));
      console.error('===fail_report===');
    }
  }

  static async runFlow(ctx, callback) {
    ctx.user_id = 'scripts';
    ctx.log_level = 'info';
    ctx.user_headers = {
      'user-agent': 'August/Luna-1.0.6 (Android; SDK 28; PBDM00)',
      'content-type': 'application/json',
    };

    const { reports, flows_context } = await FlowManager.run({
      user_id: ctx.user_id,
      template_flows,
      swaggers,
      flow_name: ctx.flow_name,
      headers: ctx.user_headers,
      flows_context: ctx.context || {}
    });

    ctx.context = flows_context;

    Helper.outputResult(reports[0], ctx.log_level);
    callback(reports);
  }
}

module.exports = Helper;
