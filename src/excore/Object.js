
/**
* Object 对象工具。
* @namespace
*/
define('Object', function (require, module, exports) {
   
    function extend(target, obj) {
        for (var key in obj) {
            target[key] = obj[key];
        }
    }


    return {
        /**
        * 用指定的值去扩展指定的目标对象，返回目标对象。
        */
        extend: function (target, obj1, obj2) {

            //针对最常用的情况作优化
            if (obj1 && typeof obj1 == 'object') {
                extend(target, obj1);
            }

            if (obj2 && typeof obj2 == 'object') {
                extend(target, obj2);
            }

            var startIndex = 3;
            var len = arguments.length;
            if (startIndex >= len) { //已处理完所有参数
                return target;
            }

            //更多的情况
            for (var i = startIndex; i < len; i++) {
                extend(target, arguments[i]);
            }

            return target;
        },

       
    };

});