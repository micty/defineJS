

module.exports = function (grunt) {

    grunt.file.defaultEncoding = 'utf8';

    var pkg = grunt.file.readJSON('../src/package.json');
    var dest = '../build/' + pkg.version;


    function format(sample, data) {

        Object.keys(data).forEach(function (key) {
            var value = data[key];
            sample = sample.split('{' + key + '}').join(value);
        });

        return sample;
    }


    grunt.initConfig({
        concat: {
            dist: {
                src: [
                    '../src/partial/begin.js',
                    '../src/core/Meta.js',
                    '../src/core/ModuleManager.js',
                    '../src/excore/Object.js',
                    '../src/index.js',
                    '../src/partial/end.js',
                ],
                
                dest: dest + '/defineJS.debug.js',

                options: {
                    process: function (content, file) {
                        content = format(content, {
                            'version': pkg.version,
                            'date': grunt.template.today('yyyy-mm-dd HH:mm:ss'),
                        });

                        return content;
                    },
                },
            },
        },

        uglify: {
            dist: {
                src: dest + '/defineJS.debug.js',
                dest: dest + '/defineJS.min.js',
                options: {
                    //自定义保留注释的方式
                    preserveComments: function (code, comment) {
                        return comment.value.startsWith('!');
                    },
                },
            },
        },

    });



    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['concat', 'uglify', ]);
};