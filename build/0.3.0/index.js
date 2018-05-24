
var Loader = require('./core/Loader');
var ModuleManager = require('./core/ModuleManager');


var mm = new ModuleManager();           //内部使用的模块管理器。   

global['define'] = mm.define.bind(mm);  //提供快捷方式。

Loader.load([
    '$/',
]);

delete global['define'];






//导出对象。
module.exports = (function (require) {

    var Emitter = require('Emitter');

    var defaults = {
        seperator: '/',
        repeated: false,
        cross: false,
        Emitter: Emitter,

        define: 'define',
        base: '',
        modules: [],
    };


    return {
        'require': require, //提供一个方式，用于加载内部的用 define() 定义的模块。

        'config': function (config) {
            Object.assign(defaults, config);
        },

        'launch': function (factory) {

            //给外部使用的模块管理器
            var mm = new ModuleManager({
                'seperator': defaults.seperator,
                'repeated': defaults.repeated,
                'cross': defaults.cross,
                'Emitter': defaults.Emitter,
            });

            //提供快捷方式，让外部可以直接调用全局方法 define()。
            global[defaults.define] = mm.define.bind(mm);

            Loader.load(defaults.base, defaults.modules);

            mm.define('', factory);
            mm.require('');
        },
    };



})(mm.require.bind(mm));