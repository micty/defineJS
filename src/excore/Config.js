
/**
* 配置管理工具。
* @namespace
*/
define('Config', function (require, module) {
    var $Object = require('Object');
    var defaults = {};


    return {
        'set': function (data) {
            $Object.extend(defaults, data);
        },

        'get': function () {
            return $Object.extend({}, defaults);
        },
    };

});