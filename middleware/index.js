var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

module.exports = function(app){
  // diferentes middlewares, antes de cargar la página.
  app.use(morgan('dev'));
  app.use(cookieParser());
  app.use(session({
    secret: 'Haciendo una página',
    resave: true,
    saveUninitialized: true
  }));
  app.use(bodyParser.urlencoded({
    extended:true
  }));
  app.use(bodyParser.json());
  app.use(function(req, res, next){
    res.locals.session = req.session;
    next(); // busca la siguiente ruta en express
  })
}
