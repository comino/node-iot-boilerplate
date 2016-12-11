
/// MODULES var express = require('express');
var express = require("express")
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


// APP
var app = express();

// CONFIG
var config = require('./config/config.js');
app.config = config;

// DATABASE:
var connect_mongodb = require('./db/mongoDB');
app.db_mongo =connect_mongodb(app.config.MONGODB);

// VIEW ENGINE
// TODO: add a view engine and a nice dashboard

// PARSER
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.disable("X-powered-by");
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// ROUTES
//app.all('/v0/*', [require('./middlewares/validateRequest')]);
app.use('/', require('./routers/index'));

// ERROR HANDLERS
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// no stacktraces to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
