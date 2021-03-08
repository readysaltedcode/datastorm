module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        },
      },
      files: {
      	src: ['*.js', '!Gruntfile.js']
      },
    },
    less: {
      files: {
        src: './css/less/*.less',
        dest: './css/main.css'
      }
    },
    watch: {
      options: {
        livereload: true
      },
      js: {
        files: ['**/*.js'],
        tasks: ['jshint']
      },
      css: {
        files: ['./css/less/*.less'],
        tasks: ['less']
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('dev', ['less', 'watch']);

};
