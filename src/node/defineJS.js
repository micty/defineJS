
/**
* 针对 node 端的导出对象。
*/
module.exports = (function (MM) {

    //预定义一些 node 的内置模块，给内部使用。 这个要在最前面。
    [
       'fs',
       'path',
       'os',
       'child_process',
    ].forEach(function (name) {
        define(name, function () {
            return require(name);
        });
    });


    var Config = MM.require('Config');
    var DefineJS = MM.require('DefineJS');
    var $Object = MM.require('Object');
    var Directory = MM.require('Directory');


    //记录已 require 过的文件。
    var file$required = {};
    var cwd = process.cwd().replace(/\\/g, '/') + '/';


    //获取所有指定目录及子目录的所有 js 文件。
    function getFiles(dirs) {
        if (!Array.isArray(dirs)) {
            dirs = [dirs];
        }

        var files = [];

        dirs.forEach(function (dir) {
            dir = cwd + dir;
            var list = Directory.getFiles(dir);
            files = files.concat(list);
        });

        var path = require('path');

        files = files.filter(function (file) {
            var ext = path.extname(file).toLowerCase();
            return ext == '.js';
        });

        return files;
    }


    //加载指定目录下的所有 js 文件。
    function load(dirs) {
        var files = getFiles(dirs);

        files.forEach(function (file) {
            if (file$required[file]) {
                return;
            }
            require(file);
            file$required[file] = true;
        });
    }


    return $Object.extend({}, DefineJS, {

        'run': function (factory) {

            var defaults = MM.require('defaults');
            var config = Config.get(defaults);


            //给外界使用的模块管理器
            var mm = new ModuleManager({
                'seperator': config.seperator,
                'repeated': config.repeated,
            });

            //提供快捷方式，让外部可以直接调用全局方法 define()。
            global[config.define] = mm.define.bind(mm);
            load(config.modules);

            var root = config.root;
            mm.define(root, factory);
            mm.require(root);
        },

    });
    
})(mm);



