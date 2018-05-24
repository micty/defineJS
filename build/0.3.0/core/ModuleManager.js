

var Module = require('./ModuleManager/Module.js');



/**
* CMD 模块管理器类。
* @class
*/
module.exports = (function (Module) {

    var mapper = new Map();

    //默认配置。
    var defaults = {
        seperator: '/',
        repeated: false,
        cross: false,
        Emitter: null,
    };


    //构造器。
    function ModuleManager(config) {

        config = Object.assign({}, defaults, config);

        var self = this;
        var Emitter = config.Emitter;
        var emitter = Emitter ? new Emitter(this) : null;

        //用于 factory(require, module, exports){ } 中的第一个参数 `require`，加载公共模块。
        var require = config.require || function (id) {
            return self.require(id, true);
        };

        var meta = {
            'this': this,                   //
            'id$module': {},                //
            'seperator': config.seperator,  //父子模块命名中的分隔符，如 `User/Login/API`。
            'repeated': config.repeated,    //是否允许重复定义模块。
            'cross': config.cross,          //是否允许跨级加载模块。
            'Emitter': Emitter,             //事件管理器构造器。
            'emitter': emitter,             //用于加载全部模块时触发相应的事件管理器实例。
            'require': require,             //自定义加载公共模块的方法。
        };


        mapper.set(this, meta);


        //提供快捷方式去加载并 new 一个指定模块构造器的实例。
        require.new = function (id) {
            var M = require(id);

            if (typeof M != 'function') {
                throw new Error('模块 ' + id + ' 的导出对象不是一个构造函数。');
            }

            var args = [...arguments].slice(1); // id 之后的所有参数。
            var instance = new M(...args);

            return instance;
        };



        //监听子级模块的首次加载事件。
        this.on('require', function (id, mod, exports) {

            //触发本级模块的事件。
            var module = meta.id$module[id];
            var emitter = module.emitter;

            emitter && emitter.fire('require', [exports]);

            //说明是直接导出对象。
            if (!mod) {
                return;
            }

            var name = mod.name;    //短名称。

            //顶级模块。
            if (name == id) {
                return;
            }

            //子级模块。
            //取它的父模块的事件管理器。
            var module = meta.id$module[mod.parent.id];
            var emitter = module.emitter;

            emitter && emitter.fire('require', name, [exports]);

        });
    }


    //实例方法
    ModuleManager.prototype = /**@lends ModuleManager#*/ {
        constructor: ModuleManager,

        /**
        * 定义指定名称的模块。
        * @param {string} id 模块的名称。
        * @param {Object|function} factory 模块的导出函数或对象。
        */
        define: function (id, factory) {
            var meta = mapper.get(this);
            var id$module = meta.id$module;

            if (!meta.repeated && id$module[id]) {
                throw new Error('配置设定了不允许定义重复的模块: 已存在名为 "' + id + '" 的模块');
            }


            var Emitter = meta.Emitter;
            var emitter = Emitter ? new Emitter(this) : null;

            id$module[id] = {
                'factory': factory, //工厂函数或导出对象
                'exports': null,    //这个值在 require 后可能会给改写
                'required': false,  //指示是否已经 require 过
                'count': 0,         //require 的次数统计
                'mod': null,        //用来存放 require 时产生的中间结果
                'emitter': emitter, //
            };
        },

        /**
        * 加载指定的模块。
        * @param {string} id 模块的名称。
        * @param {boolean} noCross 是否禁用跨级调用。 
        *   当指定为 true 时，则禁用跨级调用。 否则，默认允许跨级调用。
        * @return 返回指定的模块的导出对象。
        */
        require: function (id, noCross) {
            if (typeof id != 'string') {
                throw new Error('参数 id 的类型必须为 string: ' + (typeof id));
            }

            var meta = mapper.get(this);
            var seperator = meta.seperator;

            if (noCross && id.includes(seperator)) {
                throw new Error('参数明确指定了不允许跨级加载模块: ' + id);
            }


            var id$module = meta.id$module;
            var module = id$module[id];

            if (!module) { //不存在该模块
                return;
            }

            module.count++;

            //已经加载过了。
            if (module.required) {
                return module.exports;
            }


            //首次加载。
            var emitter = meta.emitter;
            var factory = module.factory;

            module.required = true; //更改标志，指示已经 require 过一次。

            if (typeof factory != 'function') { //非工厂函数，则直接导出
                module.exports = factory;
                emitter && emitter.fire('require', [id, null, factory]);

                return factory;
            }


            //factory 是个工厂函数
            var exports = {};
            var parent = null;
            var names = id.split(seperator);

            if (names.length > 1) {
                var parentId = names.slice(0, -1).join(seperator);

                parent = id$module[parentId];
            }


            var mod = module.mod = new Module({
                'id': id,
                'seperator': seperator,
                'exports': exports,
                'module': module,
                'parent': parent,
                'mm': this,
            });


            //调用工厂函数获得导出对象。
            exports = factory(meta.require, mod, exports);

            if (exports === undefined) {    //没有通过 return 来返回值，
                exports = mod.exports;      //则要导出的值只能在 mod.exports 里。
            }

            module.exports = exports;
            emitter && emitter.fire('require', [id, mod, exports]);

            return exports;
        },

        /**
        * 迭代每个模块，执行指定的回调函数。
        * 回调函数会接收到两个参数: id 和 module。
        */
        each: function (fn) {
            var meta = mapper.get(this);
            var id$module = meta.id$module;

            fn && Object.keys(id$module).map(function (id) {
                var module = id$module[id];

                fn(id, module);
            });

        },

        /**
        * 绑定事件。
        * 需要在构造时传入 Emitter 类的构造函数。
        */
        on: function (name, fn) {
            var meta = mapper.get(this);
            var emitter = meta.emitter;
            emitter && emitter.on(...arguments);
        },

        /**
        * 销毁本实例。
        */
        destroy: function () {
            this.each(function (id, module) {
                var emitter = module.emitter;
                emitter && emitter.destroy();
            });


            var meta = mapper.get(this);
            var emitter = meta.emitter;

            emitter && emitter.destroy();
            mapper.delete(this);

        },
    };


    return ModuleManager;



})(Module);


