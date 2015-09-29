var mongoose = require('mongoose');
var express = require('express');
var routes = require('./routes');
var middleware = require('./middleware');
var path = require('path');


mongoose.connect('mongodb://localhost',function(err){
  if (err) throw err;
  console.log('conectado');

  // inicializo la aplicación
  var app = express();
  app.use(express.static(path.join(__dirname, 'public')));

  middleware(app);
  routes(app);

  app.listen(3000,function(){
    console.log('Express escuchando en el puerto 3000');
  })
  mongoose.disconnect();
})
