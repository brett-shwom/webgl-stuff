var gulp = require('gulp');
var fs = require('fs')
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path')



var EXPRESS_PORT = 9000;
var EXPRESS_ROOT = __dirname + '/src';
var LIVERELOAD_PORT = 35729;

// Let's make things more readable by
// encapsulating each part's setup
// in its own method
function startExpress() {

    var express = require('express');
    var app = express();
    app.use(require('connect-livereload')());
    app.use(express.static(EXPRESS_ROOT));
    app.listen(EXPRESS_PORT);
}

// We'll need a reference to the tinylr
// object to send notifications of file changes
// further down
var lr;

function startLivereload() {

    lr = require('tiny-lr')();
    lr.listen(LIVERELOAD_PORT);
}

// Notifies livereload of changes detected
// by `gulp.watch()`
function notifyLivereload(event) {

    // `gulp.watch()` events provide an absolute path
    // so we need to make it relative to the server root
    var fileName = require('path').relative(EXPRESS_ROOT, event.path);

    lr.changed({
        body: {
            files: [fileName]
        }
    });
}

function generateListOfImagesInGallery() {
    gulp.src(__dirname + '/src/gallery-images/*')
        .pipe(srcFilenamesToFile('src/images.js'))
        .pipe(gulp.dest(__dirname + '/'))
}



function srcFilenamesToFile(outputFilename) {
    var paths = []; // where we will push the path names with the <a href="/import">@import</a>

    var write = function(file, enc, cb) {
        if (file.path != "undefined") {

            paths.push('gallery-images/' + path.basename(file.path))
        }
        cb();
    }

    var flush = function(cb) { // flush occurs at the end of the concating from write()
        gutil.log(gutil.colors.cyan('outputing file names to ' + __dirname + '/' + outputFilename)); // log it

        var newFile = new gutil.File({ // create a new file
            base: __dirname,
            cwd: __dirname,
            path: __dirname + '/' + outputFilename,
            contents: new Buffer("Images = " + JSON.stringify(paths)) // set the contents to the paths we created
        });

        this.push(newFile); // push the new file to gulp's stream
        cb();
    };

    return through.obj(write, flush); // return it
}

// Default task that will be run
// when no parameter is provided
// to gulp
gulp.task('default', function() {

    startExpress();
    startLivereload();
    generateListOfImagesInGallery()

    gulp.watch('src/**/*', notifyLivereload);
    gulp.watch('src/gallery-images/*', generateListOfImagesInGallery)
});
