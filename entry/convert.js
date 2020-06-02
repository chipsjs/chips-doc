// init convert, it is not necessary now;

// const Log = require('../middleware/log');
// const Setting = require('../middleware/setting');
// const Convert = require('../middleware/convert/spec_convert');

// const { paths } = require('../api_spec').api_all_spec;

// async function execute() {
//   try {
//     Setting.initialize();
//     Log.initialize(Setting.getInstance().log_level());
//   } catch (e) {
//     console.log(e.message);
//   }

//   try {
//     Convert.initialize({ log_module: Log.getInstance() });
// // it will output in cola-doc/spec/0.0.1_api_doc.json
//     Convert.getInstance().run(paths['0.0.1'], 'spec/001');
//     Convert.getInstance().run(paths['2.0.0'], 'spec/200');
//     Convert.getInstance().run(paths['2.1.0'], 'spec/210');
//     Convert.getInstance().run(paths['3.0.0'], 'spec/300');
//   } catch (e) {
//     Log.getInstance().error(e.message);
//   }
// }

// execute();
