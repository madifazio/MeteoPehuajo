
var mongoose = require('mongoose');
var createdDate = require('../plugins/createdDate');
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});
// define the schema
var schema = mongoose.Schema({
  coord: { lon: Number, lat: Number },
  weather:[ {
    id: Number,
    main: String,
    description: String,
    icon: String
    } ],
  base: String,
  main:{
    temp: Number,
    pressure: Number,
    humidity: Number,
    temp_min: Number,
    temp_max: Number,
    sea_level: Number,
    grnd_level: Number
  },
  wind: { speed: Number, deg: Number },
  clouds: { all: Number },
  dt: String,
  sys:{
    message: Number,
    country: String,
    sunrise: Number,
    sunset: Number },
  id: Number,
  name: String,
  cod: Number
});

// create a query for comments with a blogpost _id matching `id`
schema.statics.findComments = function (id, callback) {
  return this.model('Comment').find({ post: id }, callback);
}

schema.statics.edit = function (req, callback) {
  var id = req.param('id');
  var author = req.session.user;

  // validate current user authored this blogpost
  var query = { _id: id, author: author };

  var update = {};
  update.title = req.param('title');
  update.body = req.param('body');

  this.update(query, update, function (err, numAffected) {
    if (err) return callback(err);

    if (0 === numAffected) {
      return callback(new Error('no post to modify'));
    }

    callback();
  })
}

// add created date property
schema.plugin(createdDate);

// when new blogposts are created, lets tweet
// npm install mongoose-lifecycle
// http://plugins.mongoosejs.com?q=events
var lifecycle = require('mongoose-lifecycle');
schema.plugin(lifecycle);

// compile the model
var Clima = mongoose.model('Clima', schema);

// handle events
Clima.on('afterInsert', function (clima) {
  console.log('Temperatura en %s %s°C', clima.name, clima.main.temp);
  client.post('statuses/update',
    {status: 'Temperatura en ' + clima.name + ', ' + clima.main.temp + '°C'},
    function(error, tweet, response){
    if (!error) {
      console.log(tweet);
    }
  });
})

Clima.on('afterRemove', function (post) {
  this.model('Comment').remove({ post: post._id }).exec(function (err) {
    if (err) {
      console.error('had trouble cleaning up old comments', err.stack);
    }
  })
})

module.exports = Clima;
