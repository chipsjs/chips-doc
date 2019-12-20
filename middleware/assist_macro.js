const Filter = require("../model/filter");
const Loader = require("../model/loader");
const Parser = require("../model/parser");

const exportApi = async(api) =>  {
    if(await Filter.getInstance().isUseless(api)) return;

    let api_obj = await Parser.getInstance().parseDoc2Info();// ?
    await Loader.getInstance().load(api_obj);
};

module.exports = exportApi;