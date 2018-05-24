
var fs = require('fs');
var path = require('path');
var minimatch = require('minimatch');




module.exports = {

    /**
    * 使用指定的模式去匹配指定的文件列表。
    * 即从文件列表中搜索出符合指定模式的子集合。
    */
    match: function match(patterns, files) {
        var includes = {};
        var excludes = {};

        patterns.forEach(function (pattern) {
            var excluded = pattern.startsWith('!');
            var obj = excluded ? excludes : includes;

            if (excluded) {
                pattern = pattern.slice(1);
            }

            files.forEach(function (file) {
                var matched = minimatch(file, pattern);

                if (matched) {
                    obj[file] = true;
                }

            });
        });

        var matches = Object.keys(includes).filter(function (file) {
            return !(file in excludes);
        });

        return matches;

    },

    /**
    * 把一个目录和模式列表组合成一个新的模式列表。
    * 已重载 combine(dir, patterns);
    * 已重载 combine(dir, file);
    */
    combine: function (dir, patterns) {
        if (!Array.isArray(patterns)) {
            patterns = [patterns];
        }

        patterns = patterns.map(function (item, index) {

            //如 '!foo/bar/index.js'
            if (item.startsWith('!')) { 
                item = '!' + path.join(dir, item.slice(1));
            }
            else {
                item = path.join(dir, item);
            }

            //把 `\` 统一换成 `/`
            item = item.replace(/\\/g, '/'); 


            //以 '/' 结束，是个目录
            if (item.endsWith('/')) { 
                item += '**/*';
            }

            return item;
        });


        return patterns;

    },
};