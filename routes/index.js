var mongoose = require('mongoose');
var errors = require('./errors');
var request = require('request');
var async = require('async');
var Clima = mongoose.model('Clima');
var Forecast = mongoose.model('Forecast');
var Forecast16dias = mongoose.model('Forecast16dias');
var Visita = mongoose.model('Visita');


var dias = ['Dom','Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']


module.exports = function(app){
  app.get('/forecast',function(req, res, next){
    Forecast.findOne().sort({'created':-1}).exec(function(err, forecast){
      if(err) throw err;
      // transformar las fechas
      forecast.list.forEach(function (e){
        e._doc.fecha = {
          diaSem: dias[new Date(e._doc.dt*1000).getDay()]
          ,dia: new Date(e._doc.dt*1000).getDate()
          ,mes: new Date(e._doc.dt*1000).getMonth() + 1
          ,hora: ('0' + new Date(e._doc.dt*1000).getHours()).slice(-2)
        };
      });
      res.status(200).send(forecast);
    });
  })
  // home page
  app.get('/',function(req, res, next){
    // consulta del dato actual.
    var datos = {};
    async.parallel([
      // consulto el clima mas nuevo
      function(callback){
        Clima.find({'origen':'WU'})
              .sort({'created':-1})
              .limit(1)
              .exec(function(err, clima){
          if(err) throw err;
          //console.log(clima);
          clima[0]._doc.dt = new Date(clima[0]._doc.dt*1000).toLocaleTimeString();
          datos.weather = clima[0]._doc;
          callback();
        });
      },
      function(callback){
        Clima.find({'origen':'OWM'})
              .sort({'created':-1})
              .limit(1)
              .exec(function(err, clima){
          if(err) throw err;
          //console.log(clima);
          clima[0]._doc.dt = new Date(clima[0]._doc.dt*1000).toLocaleTimeString();
          datos.weatherOWM = clima[0]._doc;
          callback();
        });
      },
      // consulto el último pronóstico
      function(callback){
        Forecast16dias.find({'origen':'WU'})
          .sort({'created':-1})
          .limit(1)
          .exec(function(err, forecast){
          if(err) throw err;
          var fc = forecast[0]._doc;
          // transformar las fechas
          fc.list.forEach(function (e){
            e.fecha = {
              diaSem: dias[new Date(e.dt*1000).getDay()]
              ,dia: new Date(e.dt*1000).getDate()
              ,mes: new Date(e.dt*1000).getMonth() + 1
              ,hora: ('0' + new Date(e.dt*1000).getHours()).slice(-2)
            };
            e.temp.min = e.temp.min.toFixed(0);
            e.temp.max = e.temp.max.toFixed(0);
            e.speed = e.speed.toFixed(1);
          });
          datos.forecast = fc;
          callback();
        });
      },
      // consulto cantidad de visitas a la pagina principal.
      function(callback){
        Visita.count({'url':'/'},function(err, c){
          if(err) throw err;
          datos.visitas = c;
          callback();
        });
      }
    ],function(err){
      if(err) throw (err);
      //console.log(datos.forecast.list[0]);
      res.status(200).render('home.jade',{
        pageTitle:'MeteoPehuajo',
        datos: datos
      });
    });
  })
  // error handlers
  errors(app);
}
