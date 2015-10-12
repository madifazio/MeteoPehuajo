var mongoose = require('mongoose');
var createdDate = require('../plugins/createdDate');

// define the schema
var schema = mongoose.Schema({
  headers:{user_agent:String},
  client:{
    _peername:{
      address: String,
      family: String,
      port: Number
    }
  },
  url: String
});

// add created date property
schema.plugin(createdDate);

// compile the model
var Visita = mongoose.model('Visita', schema);

module.exports = Visita;
