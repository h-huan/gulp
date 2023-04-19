/*
 * @Author: h-huan
 * @Date: 2023-03-23 11:29:27
 * @LastEditors: h-huan
 * @LastEditTime: 2023-03-24 09:27:41
 * @Description: 
 */

'use strict';
import pkg from 'gulp';
const { src, dest, watch, symlink, task, start, series, lastRun, parallel } = pkg;
// const {src, dest, watch, symlink, task, series, lastRun, parallel} = require('gulp');
import htmlmin from 'gulp-htmlmin';  // 压缩html、
import fileinclude from 'gulp-file-include'; // html包含
import dartSass from 'sass';          // sass 
import gulpSass from 'gulp-sass';      // sass 
import sourcemaps from 'gulp-sourcemaps';   	// 源地图映射
import changed from 'gulp-changed';   // 只操作有过修改的文件
import rename from 'gulp-rename';	// 文件重命名
import uglify from 'gulp-uglify';  // JS文件压缩
import imagemin from 'gulp-imagemin';
// import pngquant from 'imagemin-pngquant';	// imagemin 深度压缩
// import livereload from 'gulp-livereload';			// 网页自动刷新（服务器控制客户端同步刷新）
import webserver from 'gulp-webserver';		// 本地服务器
import concat from "gulp-concat"; 			// 文件合并
import clean from 'gulp-clean';				// 文件清理

const sass = gulpSass(dartSass);

const srcRoot = "./"; // 源目录文件夹
const distRoot = 'dist/';  //输出文件文件
const componentsPath = 'components/';  // 组件路径   
const paths = {
  src: {
    css: srcRoot + 'styles/',
    js: srcRoot + 'js/',
    images: srcRoot + 'images/',
    page: srcRoot + "page/",
  },
  dest: {
    css: distRoot + 'styles/',
    js: distRoot + 'js/',
    images: distRoot + 'images/',
    page: distRoot,
  }
};

/*
开发环境( Ddevelop Task )
--------------------------------------------------------------
*/
// HTML处理
task('html', function () {
  return src(paths.src.page + '**/*.html')
    .pipe(changed(paths.dest.page))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.dest.page));
});

// html包含文件
task('fileinclude', function () {
  return src(['!' + componentsPath + '*.html', paths.src.page + '**/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: componentsPath + '_include',//引用文件路径
      basepath: '@file'
    }))
    .pipe(htmlmin({
      removeComments: true,               // 清除HTML注释
      collapseWhitespace: true,           // 压缩空格
      collapseBooleanAttributes: true,    // 省略布尔属性的值 <input checked="true"/> => <input checked>
      removeEmptyAttributes: true,        // 删除所有空格作属性值 <input id=""> => <input>
      removeScriptTypeAttributes: true,   // 删除<script>的type="text/javascript"
      removeStyleLinkTypeAttributes: true,// 删除<style>和<link>的type="text/css"
      minifyJS: true,                     // 压缩页面JS
      minifyCSS: true                     // 压缩页面CSS
    }))
    // .pipe(replace(/\.html"\/>/g, '.ftl" />'))
    .pipe(rename({ extname: '.html' }))
    .pipe(dest(paths.dest.page))
    .pipe(reload({
      stream: true
    }));
});

// 样式处理
task('sass', function () {
  return src(paths.src.css + '*.scss')
    .pipe(sass({ style: 'compact', sourcemap: true })
      .on('error', async function (err) {
        await console.error('Error!', err.message);
      }))
    .pipe(sourcemaps.write('maps')) // 地图输出路径（存放位置）
    .pipe(dest(paths.dest.css));
});
// JS文件压缩&重命名
task('script', function () {
  return src([paths.src.js + '*.js', '!' + paths.src.js + '/*.min.js']) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
    .pipe(changed(paths.dest.js)) // 对应匹配的文件
    .pipe(sourcemaps.init()) // 执行sourcemaps
    .pipe(rename({ suffix: '.min' })) // 重命名
    .pipe(uglify())
    .pipe(sourcemaps.write('maps')) // 地图输出路径（存放位置）
    .pipe(dest(paths.dest.js)); // 输出路径
});

// imagemin 图片压缩
task('images', function () {
  return src(paths.src.images + '**/*') // 指明源文件路径，如需匹配指定格式的文件，可以写成 .{png,jpg,gif,svg}
    .pipe(changed(paths.dest.images))
    .pipe(imagemin({
      progressive: true, // 无损压缩JPG图片
      svgoPlugins: [{ removeViewBox: false }], // 不要移除svg的viewbox属性
      // use: [pngquant()] // 深度压缩PNG
    }))
    .pipe(dest(paths.dest.images)); // 输出路径
});

// 文件合并
task('concat', function () {
  return src(paths.src.script + '*.min.js')  // 要合并的文件
    .pipe(concat('libs.js')) // 合并成libs.js
    .pipe(rename({ suffix: '.min' })) // 重命名
    .pipe(dest(paths.dest.script)); // 输出路径
});

// 删除文件打包文件
// task('cleanDistRoot', function () {
//   return src([distRoot], { read: false })
//     .pipe(clean());
// });
// 本地服务器
task('webserver', function () {
  src(paths.dest.page) // 服务器目录（.代表根目录）
    .pipe(webserver({    // 运行gulp-webserver
      port: 8008,//端口号
      host: "127.0.0.1",//主机名
      livereload: true, // 启用LiveReload
      open: true // 服务器启动时自动打开网页
    }));
});

// 监听任务
task('watch', function () {
  // 监听 scss
  watch(paths.src.css + '*.scss', parallel('sass'));
  // 监听 images
  watch(paths.src.images + '**/*', parallel('images'));
  // 监听 js
  watch([paths.src.js + '*.js', '!' + paths.src.js + '/*.min.js'], parallel('script'));
  // 监听 html
  // watch(paths.src.page + '**/*.html', parallel('html'))
  watch(paths.src.page + '**/*.html', parallel('fileinclude'))
});

/*
发布环境( Release Task )
--------------------------------------------------------------
*/
// 清理文件
task('clean', function () {
  return src([paths.dest.css + '/maps', paths.dest.js + '/maps', distRoot], { read: false }) // 清理maps文件
    .pipe(clean());
});

// 样式处理
task('sassRelease', function () {
  return sass(paths.src.css, { style: 'compressed' }) // 指明源文件路径、并进行文件匹配（编译风格：压缩）
    .on('error', function (err) {
      console.error('Error!', err.message); // 显示错误信息
    })
    .pipe(dest(paths.dest.css));
});
// 脚本压缩&重命名
task('scriptRelease', function () {
  return src([paths.src.js + '/*.js', '!' + paths.src.js + '/*.min.js']) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
    .pipe(rename({ suffix: '.min' })) // 重命名
    .pipe(uglify())
    .pipe(dest(paths.dest.js));
});
// 打包发布
task('release', parallel('clean'), function () {
  // return start('sassRelease', 'scriptRelease', 'images');
  return parallel('sassRelease', 'scriptRelease', 'images');
});

/*
默认任务 ( default Task )
--------------------------------------------------------------
*/

task('default', parallel('webserver', 'watch'));
// task('default', parallel('sass'));

/*
帮助提示( Help )
--------------------------------------------------------------
*/
task('help', function () {
  console.log('----------------- 开发环境 -----------------');
  console.log('gulp default		开发环境（默认任务）');
  console.log('gulp html		HTML处理');
  console.log('gulp fileinclude		HTML包含文件');
  console.log('gulp sass		样式处理');
  console.log('gulp script		JS文件压缩&重命名');
  console.log('gulp images		图片压缩');
  console.log('gulp concat		文件合并');
  console.log('---------------- 发布环境 -----------------');
  console.log('gulp release		打包发布');
  console.log('gulp clean		清理文件');
  console.log('gulp sassRelease		样式处理');
  console.log('gulp scriptRelease	脚本压缩&重命名');
  console.log('---------------------------------------------');
});