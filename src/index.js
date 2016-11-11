
//导出对象。
(function (define, require) {


    //给外部使用的模块管理器
    var mm = new ModuleManager();

    //提供快捷方式，让外部可以直接调用全局方法 define()。
    global.define = mm.define.bind(mm);


    var container = {

        /**
        * 版本号。 (由 grunt 自动插入)
        */
        'version': '{version}',

        'create': function (config) {
            return new ModuleManager(config);
        },

        'run': function (factory) {
            var root = '';
            mm.define(root, factory);
            mm.require(root);
        },

    };

    if (typeof define == 'function' && (define.amd || define.cmd)) { //amd|cmd
        define(function (require) {
            return container;
        });
    }
    else { //browser 普通方式
        global.defineJS = container;
    }


    



})(global.define, mm.require.bind(mm));