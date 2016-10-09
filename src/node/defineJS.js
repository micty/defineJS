

//给外界使用的模块管理器
var mm = new ModuleManager({
    seperator: '/',
    repeated: false,
});

//提供快捷方式。
//在 Node 中，全局对象是 global；其他环境是 this。
global.define = mm.define.bind(mm);


module.exports = {

    require: function (dirs) {

        if (!Array.isArray(dirs)) {
            dirs = [dirs];
        }

        var cwd = process.cwd();
        cwd = cwd.replace(/\\/g, '/') + '/';

        var files = [];

        dirs.forEach(function (dir) {
            dir = cwd + dir;

            var list = Directory.getFiles(dir);
            files = files.concat(list);
        });

        var path = require('path');

        files.forEach(function (file) {
            var ext = path.extname(file).toLowerCase();
            if (ext != '.js') {
                return;
            }

            require(file);
        });
    },


    run: function (factory) {
        var name = '';
        mm.define(name, factory);
        mm.require(name);
    },
};




