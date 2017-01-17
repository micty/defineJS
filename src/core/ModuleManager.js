
/**
* 模块管理器类。
* @class
*/

var Meta = require('./Meta');


function ModuleManager(config) {
    config = config || {
        seperator: '/',
        repeated: false,
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
            'count': 0,         // require 的次数统计
            'data': {},         //额外的自定义数据。
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
                if (name.indexOf(seperator) > -1) {
                    throw new Error('不允许跨级加载: ' + name);
                }
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
    * 给指定名称的模块设置或获取额外的自定义数据。
    * @param {string} id 模块的名称。
    * @param {object} [data] 要设置的自定义数据。
    *   如果不指定，则为获取操作(get)。 否则为设置操作(set)。
    * @return 返回合并后的全部自定义数据对象。
    */
    data: function (id, data) {
        var meta = Meta.get(this);
        var id$module = meta.id$module;
        var all = id$module.data;

        if (!data) {
            return all;
        }

        if (typeof data != 'object') {
            throw new Error('参数 data 非法: 如果要设置模块的自定义数据，请指定为一个 {} 对象。');
        }

        //跟已有的合并
        for (var key in data) {
            all[key] = data[key];
        }

        return all;
    },

    /**
    * 销毁本实例。
    */
    destroy: function () {
        Meta.remove(this);
    },
};


module.exports = ModuleManager;



