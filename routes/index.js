var errors = require('./errors');
var request = require('request');

var CITY_ID = '3841679';
var APPID = 'c1b55ebf32c85bf328cf2832811d354';
var URL_BASE = 'http://api.openweathermap.org/data/2.5/';
var LAT = -35.81;
var LON = -61.9;

module.exports = function(app){
  // home page
  app.get('/',function(req, res){
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
        console.log(body);
      }
    });
    */
    /*
    // consulta de estaciones alrededor de un punto.
    url = URL_BASE + 'station/find?lat=' + LAT + '&lon=' + LON + '&cnt=5 + &APPID=' + APPID + '&lang=es' + '&units=metric';
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
    // consulta del dato actual.
    url = URL_BASE + 'weather?id=' + CITY_ID + '&APPID=' + APPID + '&lang=es&units=metric';
    request.post(url, {json: true}, function(err, result, body) {
      if(err) throw(err);
      if (result.statusCode === 200) {
        //console.log(body);
        res.status(200).render('home.jade',{
          pageTitle:'MeteoPehuajo',
          datos: body
        });
      }
    });
  })
  // error handlers
  errors(app);
}
