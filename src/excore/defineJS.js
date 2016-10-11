
/**
* 命名空间
* @namespace
*/
define('DefineJS', function (require, module, exports) {

    var Config = require('Config');

    return {
        config: function (data) {
            Config.set(data);
        },

        run: function (factory) {
           
        },
    };

});