module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                src: './index.js',
                dest: './dist/geoportal-wfs-client.js',
                options: {
                    browserifyOptions: {
                        standalone: 'GeoportalWfsClient'
                    },
                    /* NodeJS specific libraries */
                    exclude: ['http-proxy-agent','https-proxy-agent']
                }
            }
        },
        uglify: {
            main: {
                files: {
                    './dist/geoportal-wfs-client.min.js': ['./dist/geoportal-wfs-client.js']
                }
            }
        },
        jsdoc : {
			dist : {
				src: ['src/*.js'],
				options: {
					"destination": "doc",
					"configure" : "jsdoc.conf.json"
				}
			}
		}
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('build', ['browserify','uglify']);
    grunt.registerTask('default', ['build']);
};
