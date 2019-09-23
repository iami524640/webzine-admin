var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//CORS 팩키지 모듈 임포트
var cors = require('cors');

//시퀄라이저 ORM 객체 불러오기
var sequelize = require('./models/index.js').sequelize;

//라우팅 파일 불러오기
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articleRouter = require('./routes/article.js');
var boardRouter = require('./routes/board.js');

var app = express();

//모든요청에 대한 헤더정보 반영
// app.all('/*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });

// app.all('/*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:4000");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });

//CORS 지원처리
app.use(cors());

//시퀄라이즈 ORM객체를 MYSQL에 연결하고 동기화처리
sequelize.sync();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//정적인 웹요소(html,css,js파일들)를 expess웹서버를 통해
//서비스할수 있게 설정해둠(디폴트)
app.use(express.static(path.join(__dirname, 'public')));


//라우팅정보를 익스프레스 웹서버에서 사용할수있게 설정
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/articles', articleRouter);
app.use('/boards', boardRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
