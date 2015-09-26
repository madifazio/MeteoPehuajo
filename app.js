var mongoose = require('mongoose');
var express = require('express');
var routes = require('./routes');
var middleware = require('./middleware');


mongoose.connect('mongodb://localhost',function(err){
  if (err) throw err;
  console.log('conectado');

  // inicializo la aplicación
  var app = express();
  middleware(app);
  routes(app);

  app.listen(3000,function(){
    console.log('Express escuchando en el puerto 3000');
  })
  mongoose.disconnect();
})
