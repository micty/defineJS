

module.exports = function (grunt) {

    'use strict';

    var LinearPath = require('../lib/LinearPath');
    var Tasks = require('../lib/Tasks');

    var name = 'node';

    var list = LinearPath.linearize({
        dir: '<%=dir.src%>',
        files: [
            {
                dir: 'core',
                files: [
                    'Meta.js',
                    'ModuleManager.js',
                ]
            },
            {
                dir: 'node',
                files: [
                    'Directory.js',
                    'defineJS.js',
                ],
            },
            
        ]
    });

    /*
    * 运行 grunt node 即可调用本任务
    */
    grunt.registerTask(name, function (level) {

        var home = '<%=dir.build%>' + name;
        var file = 'defineJS.js';
        var dest = home + '/' + file;


        Tasks.run('concat', name, {
            dest: dest,
            src: list,

            options: {
                banner: '\n' +
                    '/*!\n' +
                    '* <%=pkg.description%> for ' + name + '。\n' +
                    '* version: <%=pkg.version%>\n' +
                    '*/\n',
            },
        });



        //!!!!test
        Tasks.run('copy', name, {
            src: dest,
            dest: 'E:/Kingdee/PanoramioPhoto/f/' + file,
        });
    });


};