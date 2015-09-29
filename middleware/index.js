var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');


module.exports = function(app){
  // diferentes middlewares, antes de cargar la página.
  app.use(favicon('./public/favicon.ico'));
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
    var date = new Date();
    console.log(date.toString().substring(0,25)+ ' Nueva conexión: ',req.client._peername.address);

    res.locals.session = req.session;
    next(); // busca la siguiente ruta en express
  })
}
