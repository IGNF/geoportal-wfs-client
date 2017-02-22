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
                    }
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

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-jsdoc');

    // Default task(s).
    grunt.registerTask('default', ['browserify']);
};
