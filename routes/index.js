var errors = require('./errors');
var request = require('request');
var async = require('async');

var CITY_ID = '3841679';
var APPID = 'c1b55ebf32c85bf328cf2832811d354';
var URL_BASE = 'http://api.openweathermap.org/data/2.5/';
var LAT = -35.81;
var LON = -61.9;
var dias = ['Dom','Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

module.exports = function(app){
  // home page
  app.get('/',function(req, res){
    // consulta del dato actual.
    var datos = {};
    async.parallel([
      function(callback){
        var url = URL_BASE + 'weather?id=' + CITY_ID + '&APPID=' + APPID + '&lang=es&units=metric';
        request.post(url, {json: true}, function(err, result, body) {
          if(err) throw(err);
          if (result.statusCode === 200) {
            console.log(body);
            body.dt = new Date(body.dt*1000).toLocaleTimeString();
            datos.weather = body;
            callback();
          }
        });
      },
      function(callback){
        url = URL_BASE + 'forecast?id=' + CITY_ID + '&APPID=' + APPID + '&lang=es&units=metric';
        request.post(url, {json: true}, function(err, result, body) {
          if(err) throw(err);
          if (result.statusCode === 200) {
            // transformar las fechas
            body.list.forEach(function (e){
              e.fecha = {
                diaSem: dias[new Date(e.dt*1000).getDay()]
                ,dia: new Date(e.dt*1000).getDate()
                ,mes: new Date(e.dt*1000).getMonth()
                ,hora: new Date(e.dt*1000).getHours()
              };
            });
            datos.forecast = body;
            //console.log(datos.forecast);
            callback();
          }
        });
      }
    ],function(err){
      if(err) throw (err);
      console.log(datos.forecast.list[0]);
      res.status(200).render('home.jade',{
        pageTitle:'MeteoPehuajo',
        datos: datos
      });
    });
  })
  // error handlers
  errors(app);
  /*
  // consulta de datos históricos
  var from_date = new Date();
  console.log(from_date);
  from_date.setDate(from_date.getDate() - 10)
  console.log(from_date);
  from_date = (from_date.getTime() / 1000).toFixed(0);
  console.log(from_date);

  var url = URL_BASE + 'history/city?id='+ CITY_ID + '&APPID='+ APPID
    + '&type=hour&start=' + from_date +'&cnt=3';
  console.log(url);
  request.post(url, {json:true}, function(err, result, body){
    console.log(body);
    if(err) throw(err);
    if (result.statusCode === 200) {
      console.log(body);
    }
  });
  */
  /*
  // consulta del pronostico a 5 dias cada 3 horas..
  url = URL_BASE + 'forecast?id=' + CITY_ID + '&APPID=' + APPID + '&lang=es&units=metric';
  request.post(url, {json: true}, function(err, result, body) {
    if(err) throw(err);
    if (result.statusCode === 200) {
      body.list.forEach(function(e){
        console.log(e.rain);
      })
      console.log(body);
    }
  });
  */
  /*
  // consulta de estaciones alrededor de un punto.
  url = URL_BASE + 'station/find?lat=' + LAT + '&lon=' + LON + '&cnt=10 + &APPID=' + APPID + '&lang=es' + '&units=metric';
  request.post(url, {json: true}, function(err, result, body) {
    if(err) throw(err);
    if (result.statusCode === 200) {
      body.forEach(function(e){
        console.log(e.station.name);
        console.log(e.distance);
        console.log(e.station.coord);
      });
    }
  });
  */
}
