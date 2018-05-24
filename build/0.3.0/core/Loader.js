
var fs = require('fs');
var Directory = require('./Directory');
var Patterns = require('./Patterns');



/**
* 获取指定模式下的所有文件列表。
* 已重载 getFiles(dir, patterns);
* 已重载 getFiles(patterns);
*/
function getFiles(dir, patterns) {
    //重载 getFiles(patterns);
    if (Array.isArray(dir)) {
        patterns = dir;
        dir = '';
    }

 
    var files = [];

    patterns = Patterns.combine(dir, patterns);

    patterns.forEach(function (item, index) {
        if (item.startsWith('!')) { // 以 '!' 开头的，如 '!../htdocs/test.js'
            return;
        }

        var index = item.indexOf('**/');
        if (index < 0) {
            index = item.indexOf('*');
        }


        //不存在 '**/' 或 '*'，则是一个普通的文件。
        if (index < 0) { 
            files.push(item);
            return;
        }


        //截取 `**/` 或 `*` 之前的部分当作目录。
        var dir = item.slice(0, index);
        if (!fs.existsSync(dir)) {
            return;
        }

        var list = Directory.getFiles(dir);
        files = files.concat(list);
    });


    files = Patterns.match(patterns, files);

    return files;

}





module.exports = {

    load: function (dir, patterns) {
        var files = getFiles(dir, patterns);

        files.map(function (file) {
            require(file);
        });
    },

};