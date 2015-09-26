var mongoose = require('mongoose');
var express = require('express');

mongoose.connect('mongodb://localhost',function(err){
  if (err) throw err;
  console.log('conectado');

  var app = express();
  app.get('/',function(req,res){
    res.status(200).send('Hola mundo, como va?');
  })
  app.listen(3000,function(){
    console.log('Express escuchando en el puerto 3000');
  })
  mongoose.disconnect();
})
