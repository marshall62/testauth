var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helpers = require('express-helpers')
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var expressSession = require('express-session');
var routes = require('./routes/index');
var questions = require('./routes/questions');
var tests = require('./routes/tests');
var login = require('./routes/logins');

const MAX_USER_IDLE_TIME_MS = 60 * 60 * 1000;  // 60 minutes
// const MAX_USER_IDLE_TIME_MS = 5 * 1000;  // 5 seconds for testing


var app = express();


// app.use(express.static('public'));
app.use('/static', express.static(path.join(__dirname, 'public')))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// these two support express-session sessions
// saveUnitialized makes sure a new session is saved to the store
// rolling: resets the timer countdown on each request.
// maxAage:  set to 1 hour.
//  resave: forces session to be saved even when unmodified.
app.use(expressSession({resave: true, saveUninitialized: false, secret: 'M4thSpr1ng2016', rolling: true, resave:true, cookie: {maxAge: MAX_USER_IDLE_TIME_MS }}));


app.use('/', routes);
app.use('/tests', tests);
app.use('/questions', questions);
app.use('/login', login);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


helpers(app);  // this provides the express view helpers to the ejs files so I can call things like link_to

module.exports = app;

