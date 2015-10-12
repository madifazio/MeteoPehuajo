
var mongoose = require('mongoose');
var createdDate = require('../plugins/createdDate');

// define the schema
var schema = mongoose.Schema({
  cod: String,
  message: Number,
  cnt: Number,
  city:{
    id: Number,
    name: String,
    coord: { lon: Number, lat: Number },
    country: String,
    population: Number,
    sys: { population: Number }
  },
  list:[{
    dt: Number,
    main: {
        temp:Number,
        temp_min:Number,
        temp_max:Number,
        pressure:Number,
        sea_level:Number,
        grnd_level:Number,
        humidity:Number,
        temp_kf:Number
      },
    weather: [{
      id:Number,
      main:String,
      description:String,
      icon:String
    }],
    clouds: {
      all:Number
    },
    wind: {
      speed:Number,
      deg:Number
    },
    sys: {
      pod:String
    },
    dt_txt: String
  }]
});

// add created date property
schema.plugin(createdDate);

// compile the model
var Forecast = mongoose.model('Forecast', schema);

module.exports = Forecast;
