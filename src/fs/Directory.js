
var fs = require('fs');


/**
* 目录工具。
*/
define('Directory', function (require, module, exports) {

    /**
    * 递归的获取指定目录下及子目录下的所有文件列表。
    */
    function getFiles(dir) {

        if (dir.slice(-1) != '/') { //确保以 '/' 结束，统一约定，不易出错
            dir += '/';
        }

        var list = fs.readdirSync(dir);
        var files = [];

        list.forEach(function (item, index) {

            item = dir + item;

            var stat = fs.statSync(item);

            if (stat.isDirectory()) {
                var list = getFiles(item); //递归
                files = files.concat(list);
            }
            else {
                files.push(item);
            }

        });

        return files;
    }

    return {
        'getFiles': getFiles,
    };
});