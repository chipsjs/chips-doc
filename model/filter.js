// class Filter {
//     constructor() {
//         this._api_set = new Set();
//     }
//
//     static getInstance() {
//         if(!this._instance) {
//             this._instance = new Filter();
//         }
//
//         return this._instance;
//     }
//
//     async init() {
//
//     }
//
//     async isUseless(api) {
//         return !this._api_set.has(api);
//     }
// }
//
// module.exports = Filter;