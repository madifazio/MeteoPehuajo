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
  app.get('/clima',function(req, res, next){
    getClimaActual(req, res, function(err, datos){
      if(err) throw (err);
      //console.log(datos.forecast.list[0]);
      console.log('actualizacion');
      //res.status(200).send(datos);
      res.status(200).render('home.jade',{
        pageTitle:'MeteoPehuajo',
        datos: datos
      });
    });
  });
  // home page
  app.get('/', function(req, res, next){
    getClimaActual(req, res, function(err, datos){
      if(err) throw (err);
      res.status(200).render('home.jade',{
        pageTitle:'MeteoPehuajo',
        datos: datos
      });
    });
  });
  // error handlers
  errors(app);
}
function getClimaActual(req, res, callback1){
  async.parallel({
    // consulto el clima mas nuevo según WU
    climaWU:function(callback){
      Clima.find({'origen':'WU'})
            .sort({'created':-1})
            .limit(1)
            .exec(function(err, clima){
        if(err) callback(err);
        //console.log(clima);
        clima[0]._doc.dt = new Date(clima[0]._doc.dt*1000).toLocaleTimeString();
        callback(null, clima[0]._doc);
      });
    },
    // consulto el clima actual según OWM
    climaOWM: function(callback){
      Clima.find({'origen':'OWM'})
            .sort({'created':-1})
            .limit(1)
            .exec(function(err, clima){
        if(err) callback(err);
        //console.log(clima);
        clima[0]._doc.dt = new Date(clima[0]._doc.dt*1000).toLocaleTimeString();
        callback(null, clima[0]._doc);
      });
    },
    // consulto lluvia agrupada.
    lluviaOWM: function(callback){
      Clima.aggregate([
        {
          // filtro datos de OWM y que tengan valores mayores a 0
          $match:{
            'origen':'OWM',
            'rain.3h':{$gt:0}
          }
        },
        {
          // me quedo solo con los campos de interes.
          $project:{
            dt:1,
            'rain.3h':1
          }
        },
        {
          // agrupo por fecha de observación y me quedo con un solo valor del grupo.
          $group:{
            _id:'$dt',
            //cantidad:{$sum:1},
            lluvia:{$first:'$rain.3h'}
          }
        },
        {
          // ordeno por fecha
          $sort:{
            _id:-1
          }
        },
        {
          // ahora agrupo por el valor medido, puesto que se repite en varias mediciones.
          // debido a que OWM acumula cada 3 horas.
          $group:{
            _id:'$lluvia',
            //cantidad:{$sum:1},
            dt:{$first:'$_id'}
          }
        },
        {
          // ordeno por fecha, no hace falta, pero queda como ejemplo
          $sort:{
            dt:-1
          }
        },
      ],function(err, clima){
        if(err) callback(err);
        var hoy = new Date();
        hoy.setHours(0);
        hoy.setMinutes(0);
        hoy.setSeconds(0);
        var mes = new Date(hoy.getFullYear(),hoy.getMonth(),1,0,0,0);
        var anio = new Date(hoy.getFullYear(),0,1,0,0,0);
        lluviaOWM = {};
        lluviaOWM.hoy = 0;
        lluviaOWM.mes = 0;
        lluviaOWM.anio = 0;
        clima.forEach(function(e, index, array){
          e.dt = new Date(parseInt(e.dt) * 1000);
          if(e.dt >= hoy) lluviaOWM.hoy += e._id;
          if(e.dt >= mes) lluviaOWM.mes += e._id;
          if(e.dt >= anio)lluviaOWM.anio += e._id;
        });

        /*datos.lluviaOWM = clima.map(function(e){
          e.dt = new Date(parseInt(e.dt) * 1000);
          return e;
        });*/
        callback(null, lluviaOWM);
      });
    },
    // consulto el último pronóstico
    forecast: function(callback){
      Forecast16dias.find({'origen':'WU'})
        .sort({'created':-1})
        .limit(1)
        .exec(function(err, forecast){
        if(err) callback(err);
        var fc = forecast[0]._doc;
        // transformar las fechas
        fc.list.forEach(function (e){
          date = new Date(e.dt*1000);
          e.fecha = {
            diaSem: dias[date.getDay()]
            ,dia: date.getDate()
            ,mes: date.getMonth() + 1
            ,hora: ('0' + date.getHours()).slice(-2)
          };
          e.temp.min = e.temp.min.toFixed(0);
          e.temp.max = e.temp.max.toFixed(0);
          e.speed = e.speed.toFixed(1);
        });
        callback(null, fc);
      });
    },
    // consulto cantidad de visitas a la pagina principal.
    visitas: function(callback){
      Visita.count({'url':'/'},function(err, c){
        if(err) callback(err);
        callback(null, c);
      });
    }
    },
    callback1
  );
}
