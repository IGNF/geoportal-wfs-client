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
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-browserify');

    // Default task(s).
    grunt.registerTask('default', ['browserify']);
};
