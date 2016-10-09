
/**
* 模块管理器类
* @class
*/
var ModuleManager = (function (Meta) {

    function ModuleManager(config) {
        config = config || {
            seperator: '/',
        };

        var meta = {
            'id$module': {},
            'seperator': config.seperator,
            'repeated': config.repeated,    //是否允许重复定义
        };

        Meta.set(this, meta);
    }

    //实例方法
    ModuleManager.prototype = /**@lends ModuleManager#*/ {
        constructor: ModuleManager,

        /**
        * 定义指定名称的模块。
        * @param {string} id 模块的名称。
        * @param {Object|function} factory 模块的导出函数或对象。
        */
        define: function define(id, factory) {
            var meta = Meta.get(this);

            var id$module = meta.id$module;
            var repeated = meta.repeated;

            if (!repeated && id$module[id]) {
                throw new Error('配置设定了不允许定义重复的模块: 已存在名为 "' + id + '" 的模块');
            }


            id$module[id] = {
                'factory': factory, //工厂函数或导出对象
                'exports': null,    //这个值在 require 后可能会给改写
                'required': false,  //指示是否已经 require 过
                'exposed': false,   //默认对外不可见
                'count': 0,         // require 的次数统计
            };
        },

        /**
        * 加载指定的模块。
        * @param {string} id 模块的名称。
        * @param {boolean} noCross 是否禁用跨级调用。 
        *   当指定为 true 时，则禁用跨级调用。
        * @return 返回指定的模块的导出对象。
        */
        require: function (id, noCross) {
            if (typeof id != 'string') {
                throw new Error('参数 id 的类型必须为 string');
            }

            var meta = Meta.get(this);
            var seperator = meta.seperator;

            if (noCross && id.indexOf(seperator) > -1) {
                throw new Error('参数明确指定了不允许跨级加载: ' + id);
            }

       
            var id$module = meta.id$module;
            
            var module = id$module[id];
            if (!module) { //不存在该模块
                return;
            }

            module.count++;

            if (module.required) { //已经 require 过了
                return module.exports;
            }


            //首次 require
            module.required = true; //更改标志，指示已经 require 过一次
            
            var factory = module.factory;

            if (typeof factory != 'function') { //非工厂函数，则直接导出
                module.exports = factory;
                return factory;
            }

            //factory 是个工厂函数
            var self = this;
            var exports = {};

            //用于给 factory 加载公共模块的方法。
            var require = function (id) {
                return self.require(id, true);
            };

            var mod = { //传递一些额外的信息给 factory 函数，可能会用得到。
                'id': id,
                'exports': exports,

                //加载下级
                'require': function (name) {
                    name = id + seperator + name;
                    return self.require(name);
                },
            };

            exports = factory(require, mod, exports);

            if (exports === undefined) {    //没有通过 return 来返回值，
                exports = mod.exports;      //则要导出的值只能在 mod.exports 里
            }

            module.exports = exports;
            return exports;
        },
        
        /**
        * 设置或获取对外暴露的模块。
        * 已重载 get(id)、set(id, exposed)、set({}) 三种方法。
        * @param {string|Object} id 模块的名称。
            当指定为一个 {} 时，则表示批量设置。
            当指定为一个字符串时，则单个设置。
        * @param {boolean} [exposed] 模块是否对外暴露。
            当参数 id 为字符串时，且不指定该参数时，表示获取操作，
            即获取指定 id 的模块是否对外暴露。
        * @return {boolean}
        */
        expose: function (id, exposed) {
            var meta = Meta.get(this);
            var id$module = meta.id$module;

            //内部方法: get 操作
            function get(id) {
                var module = id$module[id];
                if (!module) {
                    return;
                }

                return module.exposed;
            }

            //内部方法: set 操作
            function set(id, exposed) {
                var module = id$module[id];
                if (module) {
                    module.exposed = !!exposed;
                }
            }

            //set 操作
            if (typeof id == 'object') { //重载 expose({...}); 批量 set
                var id$exposed = id;
                for (var id in id$exposed) {
                    var exposed = id$exposed[id];
                    set(id, exposed);
                }

                return;
            }

            var len = arguments.length;

            if (len == 2) { //重载 expose('', true|false); 单个 set
                set(id, exposed);
                return;
            }

            if (len == 1) { //重载 expose(id);
                return get(id); 
            }
        },

        /**
        * 销毁本实例。
        */
        destroy: function () {
            Meta.remove(this);
        },
    };

    return ModuleManager;

})(Meta);



