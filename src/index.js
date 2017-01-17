

function load(files) {
    files.forEach(function (file) {
        require(file);
    });
}


var ModuleManager = require('./core/ModuleManager');
var mm = new ModuleManager();               //内部使用的模块管理器。

global['define'] = mm.define.bind(mm);      //提供快捷方式。


load([
    './excore/Object.js',
    './fs/Directory.js',
    './fs/Patterns.js',
]);

delete global['define'];



//导出对象。
module.exports = (function (require) {

    var $Object = require('Object');
    var Patterns = require('Patterns');


    var defaults = {
        define: 'define',
        seperator: '/',
        repeated: false,
        root: '',
    };


    return {

        'config': function (data) {
            $Object.extend(defaults, data);
        },

        'run': function (factory) {

            //给外部使用的模块管理器
            var mm = new ModuleManager({
                'seperator': defaults.seperator,
                'repeated': defaults.repeated,
            });

            //提供快捷方式，让外部可以直接调用全局方法 define()。
            global[defaults.define] = mm.define.bind(mm);

            var files = Patterns.getFiles(defaults.base, defaults.modules);
            load(files);


            var root = defaults.root;
            mm.define(root, factory);
            mm.require(root);
        },
    };



})(mm.require.bind(mm));