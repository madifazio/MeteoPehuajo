var mongoose = require('mongoose');
var express = require('express');
var models = require('./models');
var routes = require('./routes');
var middleware = require('./middleware');
var path = require('path');
var CronJob = require('cron').CronJob;
var request = require('request');
var Clima = mongoose.model('Clima');

var CITY_ID = '3841679';
var APPID = 'c1b55ebf32c85bf328cf2832811d354c';
var URL_BASE = 'http://api.openweathermap.org/data/2.5/';
var LAT = -35.81;
var LON = -61.9;

mongoose.connect('mongodb://localhost/MeteoPehuajo',function(err){
  if (err) throw err;
  console.log('conectado a MeteoPehuajo');

  new CronJob('0 */15 * * * *', function() {
    console.log('cron tick');
    console.log(new Date());
    var url = URL_BASE + 'weather?lat=' + LAT + '&lon='+ LON + '&APPID=' + APPID + '&lang=es&units=metric';
    request.post(url, {json: true}, function(err, result, body) {
      if(err) throw(err);
      if (result.statusCode === 200) {
        console.log(body);
        var clima = new Clima(body);
        clima.save(function(err){
          if(err) throw err;
        });
      }else{
        console.log(body);
      }
    });
  }, null, true);

  // inicializo la aplicación
  var app = express();
  app.use(express.static(path.join(__dirname, 'public')));

  middleware(app);
  routes(app);

  app.listen(3000,function(){
    console.log('Express escuchando en el puerto 3000');
  })
})
