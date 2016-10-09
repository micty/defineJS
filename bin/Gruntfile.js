

module.exports = function (grunt) {


    'use strict';

    var Tasks = require('./lib/Tasks');
    var pkg = grunt.file.readJSON('package.json');

    Tasks.setConfig({
        'pkg': pkg,
        'dir': {
            root: '../',
            src: '../src/',
            build: '../build/',
        },
    });

   

    Tasks.load(grunt);
    Tasks.register();


    //运行 `grunt node` 即可构建针对 node 环境的库。
    require('./tasks/node.js')(grunt);
};