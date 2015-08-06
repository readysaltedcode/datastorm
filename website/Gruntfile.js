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
    mustache: {
      files : {
        src: './templates/pages',
        dest: './templates/templates.json',
        options: {
          prefix: ' ',
          postfix: ' ',
          verbose: true
        }
      }
    },
    mustache_render: {
      options: {
        // Task global options go here
      },
      your_target: {
        options: {
          // Target specific options go here
        },
        files : [
          {
            data: './templates/templates.json',
            template: './templates/layout.mustache',
            dest: './index.html'
          }
        ]
      },
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
      },
      mustache: {
        files: ['./templates/pages/*.mustache'],
        tasks: ['mustache', 'json']
      },
      mustache_render: {
        files: ['./templates/templates.json', './templates/*.mustache'],
        tasks: ['mustache_render']
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-mustache-render');
  grunt.loadNpmTasks('grunt-mustache');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('dev', ['less', 'mustache', 'mustache_render', 'watch']);

};
