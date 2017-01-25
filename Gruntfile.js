module.exports = function(grunt) {
  //require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['grunt.js', 'js/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        // the files to concatenate
        src: ['js/**/*.js'],
        // the location of the resulting JS file
        dest: 'dist/yam_editor.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! YAM Editor */\n',
        compress: true,
        mangle: true
      },
      build: {
        files: {
          'dist/yam_editor.min.js': ['dist/yam_editor.js']
        }
      }
    },
    autoprefixer: {
      dist: {
        files: {
          'css/yam_checkbox.css': 'css-src/yam_checkbox.css',
          'css/yam_colorpicker.css': 'css-src/yam_colorpicker.css',
          'css/yam_range.css': 'css-src/yam_range.css',
          'css/yam_form.css': 'css-src/yam_form.css',
          'css/yam_timeline.css': 'css-src/yam_timeline.css',
          'css/yam_editor.css': 'css-src/yam_editor.css',
          'css/yam_image_editor.css': 'css-src/yam_image_editor.css',
          'css/yam_video.css': 'css-src/yam_video.css',
          'css/yam_host.css': 'css-src/yam_host.css'
        }
      }
    },
    sass: {
      dist: {
        files: {
          'css-src/yam_form.css': 'sass/yam_form.scss',
          'css-src/yam_timeline.css': 'sass/yam_timeline.scss',
          'css-src/yam_editor.css': 'sass/yam_editor.scss',
          'css-src/yam_image_editor.css':'sass/yam_image_editor.scss',
          'css-src/yam_video.css':'sass/yam_video.scss',
          'css-src/yam_host.css':'sass/yam_host.scss'
        }
      }
    },
    babel: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          "js/Test.js": "js6/Test.js"
        }
      }
    },
    browserify: {
      options: {
        browserifyOptions: {
          debug: true
        }
        // transform: ['vueify']
      },
      client: {
        src: ['js6/Main.js'],
        dest: 'js/Main.js',
      }
      // 'js/VideoDownloader.js': ['js6/VideoDownloader.js']
    },
    watch: {
        css: {
            files: [
              'css-src/yam_editor.css',
              'css-src/yam_checkbox.css',
              'css-src/yam_colorpicker.css',
              'css-src/yam_range.css',
              'css-src/yam_form.css',
              'css-src/yam_timeline.css',
              'css-src/yam_video.css',
              'css-src/yam_host.css'
              ],
            tasks: ['autoprefixer']
        },
        sass: {
            files: [
              'sass/yam_colors.scss',
              'sass/yam_editor.scss',
              'sass/yam_form.scss',
              'sass/yam_timeline.scss',
              'sass/yam_image_editor.scss',
              'sass/yam_video.scss',
              'sass/yam_host.scss'
              ],
            tasks: ['sass']
        },
        js6: {
            files: [
              'js6/Test.js'
              ],
            tasks: ['babel']
        },
        brwsrfy: {
            files: [
              'js6/Main.js'
              ],
            tasks: ['browserify']
        }
    },
  });

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-babel');
  
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('dist', ['concat']);
  grunt.registerTask('dist-min', ['dist','uglify']);

  grunt.registerTask('yam_prefix', ['autoprefixer']);

};