
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
            var config = Config.get();

            //给外界使用的模块管理器
            var mm = new ModuleManager({
                'seperator': config.seperator,
                'repeated': config.repeated,
            });

            //提供快捷方式，让外部可以直接调用全局方法 define()。
            global[config.define] = mm.define.bind(mm);

            var root = config.root;
            mm.define(root, factory);
            mm.require(root);
        },
    };

});