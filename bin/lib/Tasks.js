

/**
* 提供一些集成的任务配置管理方法。
*/
module.exports = (function (grunt, $) {

    'use strict';


    var list = [];
    var name$config = {};


    /**
    * 添加一个指定名称、目标和配置到任务列表中。
    * @param {string} name 任务名称。
    * @param {string} [target] 任务目标。
    * @param {Object} config 任务的配置对象。
    */
    function add(name, target, config) {

        if (typeof target != 'string') { // add(name, config)
            config = target;
            target = undefined;
        }


        if (target) {
            var obj = name$config[name];
            if (!obj) {
                obj = name$config[name] = {};
            }
            obj[target] = config;
        }
        else {
            name$config[name] = config;
        }

        grunt.initConfig(name$config);



        if (target) { //设置正确的任务名称
            name = name + ':' + target;
        }

        list.push(name);


    }




    function setConfig(name, target, config) {

        if (typeof name == 'object') { //setConfig(config)

            config = name;
            $.Object.extend(name$config, config);
            grunt.initConfig(name$config);
            return;
        }

        if (typeof target == 'object') {//setConfig(name, config)

            config = target;
            var obj = name$config[name];
            if (!obj) {
                name$config[name] = config;
            }
            else {
                $.Object.extend(obj, config);
            }

            grunt.initConfig(name$config);
            return;
        }


        var obj = name$config[name];

        if (!obj) { //尚未存在该名称的节点
            obj = name$config[name] = {};
        }

        obj[target] = config;
        grunt.initConfig(name$config);
    }



    function register(name, tasks) {
        
        if (name instanceof Array) { //register(tasks)
            tasks = name;
            name = 'default';
        }

        grunt.registerTask(name || 'default', tasks || list);
    }





    function load(names) {

        if (names instanceof Array) {
            for (var i = 0; i < names.length; i++) {
                grunt.loadNpmTasks(names[i]);
            }
        }
        else if (typeof names == 'string') {
            grunt.loadNpmTasks(names);
        }
        else {
            //自动分析 package.json 文件，并加载所找到的 grunt 模块
            require('load-grunt-tasks')(names || grunt);
        }
    }

    function loadContrib(names) {

        if (names instanceof Array) {

            var a = $.Array.keep(names, function (item, index) {
                return 'grunt-contrib-' + item;
            });

            load(a);
        }
        else {
            load('grunt-contrib-' + names);
        }
    }


    function use(name) {


        if (name instanceof Array) { // use( [...] );
            name.forEach(function (item, index) {
                use(item);
            });

            return;
        }


        var obj = require('../tasks/' + name + '.js');



        if (!obj || typeof obj != 'object') {
            console.log('../tasks/' + name + '.js 的返回值不是一个有效的 Object ');
            return;
        }

       
        if (obj.target) {
            add(obj.name, obj.target, obj.config);
        }
        else {
            add(obj.name, obj.config);
        }


    }


    function useConfig(filename) {

        if (filename instanceof Array) { // useConfig( [...] );

            return $.Array.keep(filename, function (item, index) {

                return useConfig(item); //递归
            });
        }


        var filepath = '../tasks/' + filename + '.js';
        var obj = require(filepath);

        if (!obj || typeof obj != 'object') {
            console.log(filepath + ' 的返回值不是一个有效的 Object');
            return;
        }

        var name = obj.name;
        if (!name) {
            console.log(filepath + ' 的返回值不是一个有效的配置对象');
            return;
        }

        var target = obj.target;
        var config = obj.config;

        if (target) {
            setConfig(name, target, config);
        }
        else {
            setConfig(name, config);
        }


        //特殊处理。 处理 name 为 'watch' 并且指定了 ext 字段的配置。
        if (name == 'watch' && obj.ext) {
            watch(obj.ext, config.tasks);
        }

        //返回任务名称，给调用者作他用
        return target ? (name + ':' + target) : name;

    }



    function run(name, target, config) {

        var len = arguments.length;

        if (len == 1) { // run('') 或 run([])
            var list = useConfig(name);
            grunt.task.run(list);
            return;
        }

        if (len == 2) { //run(name, config);
            config = target;
            add(name, config);
            grunt.task.run(name);
            return;
        }

        //run(name, target, config);
        add(name, target, config);
        grunt.task.run(name + ':' + target);


        

    }


    /**
    * 监控指定类型的文件，并执行给定的任务列表。
    * 该方法会监听 grunt 的 watch 事件，采用防反跳技术来避免多次触发事件。
    * @param {string} 文件后缀名，以 '.' 开头。
    *   如 '.less' 表示后缀名为 less 的文件。
    * @param {Array} tasks 待执行的任务列表名称。
    *   如果任务列表名称中含有 ':'，则会正确识别并替换成 '/'，然后加载相应的配置文件。
    */
    function watch(ext, tasks) {

        tasks = $.Array.keep(tasks, function (item, index) {
            item = item.split(':').join('/'); //把 : 换成 /
            useConfig(item); //顺便依次加载相应的配置到总的 config 中
            return item;
        });


        //采用防反跳技术来避免多次触发事件
        var timeoutId = null;
        var list = [];
        
        grunt.event.on('watch', function (action, file) {

            var s = file.slice(0 - ext.length).toLowerCase();
            if (s != ext) { //只处理指定后缀名的文件
                return;
            }

            clearTimeout(timeoutId);

            list.push(file);

            timeoutId = setTimeout(function () {

                // 动态修改给定的任务中的 src 属性
                $.Array.each(tasks, function (item, index) {

                    var name = item.split('/').join('.');
                    grunt.config(name + '.src', list);
                });

                list = [];

            }, 200);

        });
    }





    return {
        add: add,
        setConfig: setConfig,
        register: register,
        load: load,
        loadContrib: loadContrib,
        use: use,
        useConfig: useConfig,
        watch: watch,
        run: run
    };


})(require('grunt'), require('./MiniQuery'));

