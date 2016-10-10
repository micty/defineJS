


(function (define) {

    if (typeof define == 'function' && (define.amd || define.cmd)) { //amd|cmd
        define(function (require) {
            return require('MiniQuery');
        });
    }
    else { //browser 普通方式
        global.MiniQuery = require('MiniQuery');
    }


})(global.define);


})(
    window,  // 在浏览器环境中，全局对象是 this

    top,
    parent,
    window, 
    document,
    location,
    navigator,
    window.localStorage,
    window.sessionStorage,
    window.console,
    history,
    setTimeout,
    setInterval,

    window.JSON,

    Array, 
    Boolean,
    Date,
    Error,
    Function,
    Math,
    Number,
    Object,
    RegExp,
    String
    /*, $ -> undefined */
    /*, undefined -> undefined */
);
