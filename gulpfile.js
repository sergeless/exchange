//Создаем переменную на gulp
const gulp = require('gulp');

//Создаем переменную для gulp-concat
const concat = require('gulp-concat');

//Создаем переменную для autoprefixer
const autoprefixer = require('gulp-autoprefixer');

//Создаем переменную для минификации кода css
const cleanCSS = require('gulp-clean-css');

//Создаем переменную для минификации кода js
const uglify = require('gulp-uglify');

//Создаем переменную для удаления файлов из каталога
const del = require('del');

//Создаем переменную для browsersync
const browserSync = require('browser-sync').create();

//Создаем переменную для sourcemap - возможности нормально отлаживать готовый код. Он отслеживает откуда куда собирался код из исходников и записывал в свою "карту" изменений. После этого в отладчике браузера будет показано, где в каком файле с исходниками находилось
const sourcemaps = require('gulp-sourcemaps');

//Создаем переменную для ветвления в gulp
const gulpif = require('gulp-if');

//Создаем переменную для модуля который делает правильное объединение медиа запросов
const gcmq = require('gulp-group-css-media-queries');

//Создаем переменную для sass препроцессора
const sass = require('gulp-sass');

//Создаем переменную-флаг, который будет отвечать за режим разработки. Возвращает true или false
isProd = (process.argv.indexOf('--prod') !== -1);

isDev = !isProd;

//Создаем переменную-флаг, который будет отвечать использовать browser-sync или нет
isSync = (process.argv.indexOf('--sync') !== -1);
/*
    По новому стандарту принято
    isSync = process.argv.inсludes('--sync')
*/


//Ещё один вариант это использовать глобавльную переменную Node.js process


//Функция для преобразования стилей
function styles() {
    /*
        gulp.src - мы указываем источник откуда будут барться файлы для преобразования
        Мы выходим на один уровень выше переходим в каталог src -> css -> 
        ** - все вложеные каталоги
        *.css - любой файл с расширением css
    */
    return gulp.src('./src/sass/**/*.sass', './src/sass/**/*.scss')
        //Проверяем какая версия флага isDev, и в зависимости от его значения либо запускаем sourcemaps либо нет
        //Инициализируес sourcemaps
        .pipe(gulpif(isProd, sourcemaps.init()))
        // pipe - специальная функция которая и будет проделывать определенные действия с файлами
        //Пропускаем через препроцессор sass, с отслеживанием ошибок
        .pipe(sass().on('error', sass.logError))
        //пропускаем через модуль concat
        .pipe(gulpif(isProd, concat('all.min.css')))

    .pipe(gulpif(isDev, concat('all.css')))
        //Пропускаем через правильную оптимизацию media запросов
        .pipe(gcmq())
        //пропускаем через autoprefixer
        .pipe(autoprefixer({
            cascade: false
        }))
        //пропускаем через сжатие кода
        //у gulp-clean-css очень много специфических настроек, проще использовать предустановленные настройки (level). level 2 является самым продвинутым, он умеет оптимизировать код, объединяя правила из разных файлов в одно и также медиазапросы
        .pipe(gulpif(isProd, cleanCSS({ level: 2 })))
        .pipe(gulpif(isProd, sourcemaps.write()))
        //gulp.dest - каталог куда будет перемещаться готовые после преобразований файл
        .pipe(gulp.dest('./build/css'))
        //запускаем поток browser-sync который будет обновлять страницу, после изменений
        //Проверяем перед этим установлена при запуске gulp параметр --sync
        .pipe(gulpif(isSync, browserSync.stream()));
}

//Функция для преобразования js скриптов
function scripts() {
    // return gulp.src('./src/js/**/*.js')
    return gulp.src(['./src/js/swiper.min.js', './src/js/main.js'])
        .pipe(concat('main.js'))
        //Если по умолчанию он просто минифицирует код js, при параметре toplevel:true, код становить просто не читаемым. Обратного преобразования нет
        // .pipe(uglify({
        //     // toplevel: true
        // }))
        .pipe(gulp.dest('./build/js'))
        //запускаем поток browser-sync который будет обновлять страницу, после изменений
        .pipe(gulpif(isSync, browserSync.stream()));
}

function html() {
    return gulp.src('./src/*.html')
        .pipe(gulp.dest('./build/'))
        .pipe(gulpif(isSync, browserSync.stream()));
}

//Создаем функцию watch, которая будет следить за изменениями в нужных файлах
function watch() {
    //Инициализируем browser-sync, заставляя его запустить веб-сервер на 3000 порту
    //baseDir откуда брать файлы html, css, js
    //tunnel создает временный локальный домен по которому можно подкулючиться и мониторить работу
    if (isSync) {
        browserSync.init({
            server: {
                baseDir: "./build/",
            },
            // tunnel: true
        });
    }
    //метод watch принимает два параметра путь к файлу и функцию обработки кода
    gulp.watch('./src/sass/**/*.sass', styles);
    gulp.watch('./src/js/**/*.js', scripts);
    //При изменение фалов html запускать обновление browser-sync
    gulp.watch('./src/*.html', html);
    // gulp.watch('./src/*.html', browserSync.reload);
}

//Создаем функцию которая будет удалять файлы из нужного каталога
function clean() {
    return del(['build/*']);
}

//Регистрируем таска для преобразования стилей
gulp.task('styles', styles);

//Регистрируем таска для преобразования js скриптов
gulp.task('scripts', scripts);

gulp.task('html', html);

//Регистрируем таск для watch
gulp.task('watch', watch);

//Регистрируем таск который будет сначало очищать папку build, а потом уже отрабатывать таски преобразования
//gulp.series - выполняет таски последовательно, а gulp.parallel - выполняет таски паралельно. Т.е. у нас получиться, что сначала очистится папка, а потом уже выполняться преобразования
//Если зарегистрированы таски, то их можно передавать в ковычках, если же это просто название функции, то передается без ковычек
gulp.task('build', gulp.series(clean,
    gulp.parallel('html', 'styles', 'scripts')
));

//Зарегистрируем таск, который сначала выполнить таск build, а потом запустит watch
// gulp.task('dev', gulp.series('build', 'watch'));