var mongoose = require('mongoose');
var express = require('express');
var routes = require('./routes');
var middleware = require('./middleware');
var path = require('path');
var CronJob = require('cron').CronJob;
var request = require('request');

var CITY_ID = '3841679';
var APPID = 'c1b55ebf32c85bf328cf2832811d354c';
var URL_BASE = 'http://api.openweathermap.org/data/2.5/';
var LAT = -35.81;
var LON = -61.9;
var dias = ['Dom','Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']




mongoose.connect('mongodb://localhost/MeteoPehuajo',function(err){
  if (err) throw err;
  console.log('conectado a MeteoPehuajo');

  var Clima = mongoose.model('clima',{
    coord: { lon: Number, lat: Number },
    weather:
    [ { id: Number,
    main: String,
    description: String,
    icon: String } ],
    base: String,
    main:
    { temp: Number,
      pressure: Number,
      humidity: Number,
      temp_min: Number,
      temp_max: Number,
      sea_level: Number,
      grnd_level: Number },
    wind: { speed: Number, deg: Number },
    clouds: { all: Number },
    dt: String,
    sys:
    { message: Number,
      country: String,
      sunrise: Number,
      sunset: Number },
    id: Number,
    name: String,
    cod: Number
  });

  new CronJob('0 */15 * * * *', function() {
    console.log('cron tick'+ Date.toString());
    var url = URL_BASE + 'weather?lat=' + LAT + '&lon='+ LON + '&APPID=' + APPID + '&lang=es&units=metric';
    request.post(url, {json: true}, function(err, result, body) {
      if(err) throw(err);
      console.log('respuesta de OWM');
      if (result.statusCode === 200) {
        body.dt = new Date(body.dt*1000).toLocaleTimeString();
        console.log(body);
        var clima = new Clima(body);
          clima.save(function(err, clima){
            if(err) throw err;
            console.log(clima);
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
