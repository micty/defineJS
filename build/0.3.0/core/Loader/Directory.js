

var fs = require('fs');


module.exports = {

    /**
    * 递归的获取指定目录下及子目录下的所有文件列表。
    */
    getFiles: function (dir) {
        //确保以 '/' 结束，统一约定，不易出错
        if (!dir.endsWith('/')) {
            dir += '/';
        }

        var list = fs.readdirSync(dir);
        var files = [];

        list.forEach(function (item, index) {
            item = dir + item;

            var stat = fs.statSync(item);
            var isFile = !stat.isDirectory();

            //是一个文件。
            if (isFile) {
                files.push(item);
                return;
            }

            //是一个目录，递归。
            var list = module.exports.getFiles(item);

            files = files.concat(list);
        });


        return files;
    },

};