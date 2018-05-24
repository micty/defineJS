

/**
* 多任务处理工具类。
* @namesapce
* @name Tasks
*/
define('Tasks', function (require, module,  exports) {

    var Emitter = require('Emitter');
    var mapper = new Map();


    function Tasks(list) {
        var meta = {
            'emitter': new Emitter(this),
            'list': list,
        };

        mapper.set(this, meta);
    }


    Tasks.prototype = {
        constructor: Tasks,


        parallel: function () {
            var meta = mapper.get(this);
            var list = meta.list;
            var emitter = meta.emitter;
            var len = list.length;

            if (len == 0) {
                emitter.fire('all', []);
                return;
            }

            var values = new Array(len);
            var dones = new Array(len);
            var count = len;

            list.forEach(function (item, index) {

                //done(index) 是异步调用，要多一层闭包。
                (function (index) { 
                    
                    emitter.fire('each', [item, index, function (value) {

                        values[index] = value; //需要收集的值，由调用者传入。
                        dones[index] = true;
                        count--;

                        //单纯记录计数不够安全，因为调用者可能会恶意多次调用 done()。
                        if (count > 0) { //性能优化
                            return;
                        }

                        //安全起见，检查每项的完成状态
                        for (var i = 0; i < len; i++) {
                            if (!dones[i]) {
                                return;
                            }
                        }

                        //至此，全部项都已完成。
                        emitter.fire('all', [values]);

                    }]);

                })(index);
            });



        },

        serial: function () {
            var meta = mapper.get(this);
            var list = meta.list;
            var emitter = meta.emitter;
            var len = list.length;

            if (len == 0) {
                emitter.fire('all', []);
                return;
            }


            var values = new Array(len);


            function process(index) {
                var item = list[index];

                emitter.fire('each', [item, index, function (value) {
                    values[index] = value; //需要收集的值，由调用者传入。
                    index++;

                    if (index < len) {
                        process(index);
                    }
                    else {
                        emitter.fire('all', [values]);
                    }
                }]);
            }

            process(0);

        },

        on: function () {
            var meta = mapper.get(this);
            var emitter = meta.emitter;
            var args = Array.from(arguments);
            emitter.on(args);
        },

    };



    Object.assign(Tasks, {


    });


    return Tasks;




});
