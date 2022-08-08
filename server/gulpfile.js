const fs = require('fs');
const gulp = require('gulp');
const { series, parallel } = require('gulp');
const proc = require('child_process');


const execute = require ("./gulp/execute")
const generatePackageJson = require ("./gulp/generatePackageJson")

const compileServer = cb => execute(cb, `node node_modules/typescript/bin/tsc --project ./tsconfig.compile.json`);

const copyDockerToDist = () => gulp.src('./docker/*')
    .pipe(gulp.dest('./build/dist'))

exports.default = series(
    parallel(
        generatePackageJson,
        compileServer,
        copyDockerToDist
    )
);
