require = require("esm")(module/*, options*/);
console.time('playing-content-services import');
module.exports = require('./src/index').default;
module.exports.DocTypes = require('./src/constants').DocTypes;
module.exports.entities = require('./src/entities').default;
module.exports.hooks = require('./src/hooks');
module.exports.models = require('./src/models').default;
console.timeEnd('playing-content-services import');
