
var mongoose = require('mongoose');
var createdDate = require('../plugins/createdDate');

// define the schema
var schema = mongoose.Schema({
  origen: String,
  cod: String,
  message: Number,
  cnt: Number,
  city:{
    id: Number, // codigo de la ciudad
    name: String,
    coord: { lon: Number, lat: Number },
    country: String,
  },
  list:[{
    dt: Number,
    temp:{
      day:Number, // temperatura del día
      min:Number, // minima
      max:Number, // máxima
      night:Number,
      eve:Number,
      morn:Number
    },
    pressure:Number,
    humidity:Number,
    weather: [{
      id:Number, // id del clima (OWM)
      main:String,
      description:String,
      icon:String
    }],
    speed:Number, // velocidad del viento
    deg:Number, // dirección del viento
    clouds:Number // porcentaje de nubosidad.
  }]
});

// add created date property
schema.plugin(createdDate);

// compile the model
var Forecast16dias = mongoose.model('Forecast16dias', schema);

module.exports = Forecast16dias;
