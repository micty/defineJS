
/**
* 用于工厂函数 
*   factory(require, module, exports) { }
* 中的第二个参数 `module` 的构造器。
*/
module.exports = (function () {

    var mapper = new Map();

    function Module(config) {

        var id = config.id;
        var module = config.module;
        var seperator = config.seperator;
        var parent = config.parent;


        //暴露给外部的属性。
        Object.assign(this, {
            'id': id,
            'name': id.split(seperator).slice(-1)[0],   //短名称。
            'seperator': seperator,
            'exports': config.exports,
            'count': module.count,
            'parent': parent ? parent.mod : null,
        });


        //内部方法使用的字段。
        //安全起见，不使用暴露的那份，防止调用方恶意去改。
        var meta = {
            'id': id,
            'seperator': seperator,
            'emitter': module.emitter,
            'mm': config.mm,
        };

        mapper.set(this, meta);
    }

    //实例方法。
    Module.prototype = {
        constructor: Module,

        /**
        * 加载当前模块指定名称的直接下级模块。
        * @param {string} name 直接下级模块的短名称。
        */
        require: function (name) {
            var meta = mapper.get(this);
            var seperator = meta.seperator;

            if (name.includes(seperator)) {
                throw new Error('不允许跨级加载模块: ' + name);
            }

            var full = meta.id + seperator + name;
            var M = meta.mm.require(full);
            return M;
        },

        /**
        * 在当前模块上绑定事件。
        */
        on: function () {
            var meta = mapper.get(this);
            var emitter = meta.emitter;

            emitter && emitter.on(...arguments);
        },

        /**
        * 在首次 require 指定直接子模块时，绑定该模块上指定的事件。
        */
        bind: function (name, events) {
            var self = this;
            var name$events = {};

            if (typeof name == 'string') {   //单个绑定。
                name$events[name] = events;
            }
            else { // name 为 {}， 多个模块的批量绑定。
                name$events = name;
            }


            Object.keys(name$events).forEach(function (name) {
                var events = name$events[name];

                var fn = (typeof events == 'function') ? events : function (M) {
                    M.on(events);
                };

                self.on('require', name, fn);
            });
            

        },
    };


    return Module;

})();
