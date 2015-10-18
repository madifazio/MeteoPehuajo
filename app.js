var mongoose = require('mongoose');
var express = require('express');
var models = require('./models');
var routes = require('./routes');
var middleware = require('./middleware');
var path = require('path');
var CronJob = require('cron').CronJob;
var request = require('request');
var Clima = mongoose.model('Clima');
var Forecast = mongoose.model('Forecast');
var Forecast16dias = mongoose.model('Forecast16dias');

var CITY_ID = '3841679';
var WU_KEYID = '3d9de40bc89e46e8';
var APPID = 'c1b55ebf32c85bf328cf2832811d354c';
var URL_BASE_OWM = 'http://api.openweathermap.org/data/2.5/';
var URL_BASE_WU = 'http://api.wunderground.com/api/';
var LAT = -35.81;
var LON = -61.9;

mongoose.connect('mongodb://localhost/MeteoPehuajo',function(err){
  if (err) throw err;
  console.log('conectado a MeteoPehuajo');

  new CronJob('0 */10 * * * *', function() {
    console.log('cron tick');
    console.log(new Date());
    // Condición actual según OWM
    var url = URL_BASE_OWM + 'weather?lat=' + LAT + '&lon='+ LON + '&APPID=' + APPID + '&lang=es&units=metric';
    request.post(url, {json: true}, function(err, result, body) {
      if(err) throw(err);
      if (result.statusCode === 200) {
        //console.log(body);
        body.origen = 'OWM';
        var clima = new Clima(body);
        clima.save(function(err){
          if(err) throw err;
        });
      }else{
        console.log(body);
      }
    });
    // Forecast 5 dias cada 3horas según open weather map
    url = URL_BASE_OWM + 'forecast?id=' + CITY_ID + '&APPID=' + APPID + '&lang=es&units=metric';
    request.post(url, {json: true}, function(err, result, body) {
      if(err) throw(err);
      if (result.statusCode === 200) {
        //console.log(body);
        var forecast = new Forecast(body);
        forecast.save(function(err){
          if(err) throw err;
        });
      }else{
        console.log(body);
      }
    });
    // Forecast 7 dias según open weather map
    url = URL_BASE_OWM + 'forecast/daily?id=' + CITY_ID + '&cnt=7' + '&APPID=' + APPID + '&lang=es&units=metric';
    request.post(url, {json: true}, function(err, result, body) {
      if(err) throw(err);
      if (result.statusCode === 200) {
        //console.log(body);
        body.origen = 'OWM';
        var forecast16 = new Forecast16dias(body);
        forecast16.save(function(err){
          if(err) throw err;
        });
      }else{
        console.log(body);
      }
    });
    // Condición actual según WU
    url = URL_BASE_WU + WU_KEYID + '/conditions/lang:SP/q/Argentina/Pehuajo.json';
    request.post(url, {json: true}, function(err, result, body) {
      if(err) throw(err);
      if (result.statusCode === 200) {
        //console.log(body);
        var presion = parseFloat(body.current_observation.pressure_mb);
        var humedad = parseFloat(body.current_observation.relative_humidity.replace('%',''));
        var lluvia1h = parseFloat(body.current_observation.precip_1hr_metric);
        var clima = new Clima({
          origen:'WU',
          dt:body.current_observation.local_epoch,
          coord:{
            lon:parseFloat(body.current_observation.display_location.longitude),
            lat:parseFloat(body.current_observation.display_location.latitude)
          },
          weather:[ {
            description: body.current_observation.weather,
            icon: body.current_observation.icon
            } ],

          main:{
            temp: body.current_observation.temp_c,
            sens: parseFloat(body.current_observation.feelslike_c),
            pressure: isNaN(presion) ? 0 : presion,
            humidity: isNaN(humedad) ? 0 : humedad
          },
          rain:{
            '1h':isNaN(lluvia1h) ? 0 : lluvia1h
          },
          wind:{
            speed: body.current_observation.wind_kph,
            deg: body.current_observation.wind_degrees
          },
          name:body.current_observation.display_location.city
        });
        clima.save(function(err){
          if(err) throw err;
        });
      }else{
        console.log(body);
      }
    });
    // Forecast 7 dias según Weather Underground
    //http://api.wunderground.com/api/3d9de40bc89e46e8/forecast10day/lang:SP/q/Argentina/Pehuajo.json
    url = URL_BASE_WU + WU_KEYID + '/forecast10day/lang:SP/q/Argentina/Pehuajo.json';
    request.post(url, {json: true}, function(err, result, body) {
      if(err) throw(err);
      if (result.statusCode === 200) {
        console.log(body);
        // convertir la respuesta de WU al esquema MeteoPehuajo
        var forecast = new Object();
        forecast.origen = 'WU';
        forecast.cnt = 10;
        forecast.city = new Object();
        forecast.city.name = 'Pehuajó';
        forecast.list = new Array();
        body.forecast.simpleforecast.forecastday.forEach(function(e){
          forecast.list.push({
            dt: parseInt(e.date.epoch),
            temp:{
              max: !isNaN(parseInt(e.high.celsius)) ? parseInt(e.high.celsius) : 0,
              min: parseInt(e.low.celsius)
            },
            humidity: e.avehumidity,
            weather:{
              description: e.conditions,
              icon: e.icon,
            },
            speed: e.maxwind.kph,
            deg: e.maxwind.degrees,
          })
        });
        var forecast16 = new Forecast16dias(forecast);
        forecast16.save(function(err){
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
