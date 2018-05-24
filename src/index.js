
var Loader = require('./core/Loader');
var ModuleManager = require('./core/ModuleManager');

//内部使用的模块管理器。   
var mm = new ModuleManager();           

//先暂时提供快捷方式，从而可以定义内部模块。
global['define'] = mm.define.bind(mm);  


//加载 `$` 目录的所有模块。
Loader.load(__dirname, [
    '$/',
]);

//再删除内部的快捷方式。
delete global['define'];





//导出对象。
module.exports = (function (require) {

    var Emitter = require('Emitter');

    var defaults = {
        seperator: '/',     //上下级模块的分隔符。 如 `User/Login`。
        repeated: false,    //不允许重复定义相同名称的模块。
        cross: false,       //是否允许跨级调用模块。 如果为 false，则不允许加载不属于自己的直接子级模块。
        Emitter: Emitter,   //事件驱动器类。

        define: 'define',   //对外提供定义模块的方法名。
        base: '',           //外部的基目录。 外部使用时，总时传入固定变量 `__dirname`。
        modules: [],        //外部要加载的模块的目录名列表。
    };


    return {
        /**
        * 提供一个方式，用于加载内部用 define() 定义的模块。
        * 主要是加载一些工具模块，如 `$` 目录下的模块。
        */
        'require': require, 

        /**
        * 配置默认项。
        */
        'config': function (config) {
            Object.assign(defaults, config);
        },

        /**
        * 启动程序，并执行传入的工厂函数。
        */
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

