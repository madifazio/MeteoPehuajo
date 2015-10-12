var mongoose = require('mongoose');
var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var models = require('../models');
var Visita = mongoose.model('Visita');

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
    //guardo la visita en la base de datos.
    var visita = new Visita({
      headers:{
        user_agent:req.headers['user-agent']
      },
      client:{
        _peername:{
          address: req.client._peername.address,
          family: req.client._peername.family,
          port: req.client._peername.port
        }
      },
      url: req.url
    });
    visita.save(function(err){
      if(err) throw err;
    });

    res.locals.session = req.session;
    next(); // busca la siguiente ruta en express
  })
}
