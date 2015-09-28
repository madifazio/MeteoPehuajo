var errors = require('./errors');
var request = require('request');



module.exports = function(app){
  // home page
  app.get('/',function(req, res){
    request.post(
      'http://api.openweathermap.org/data/2.5/weather?q=Pehuajo&APPID=c1b55ebf32c85bf328cf2832811d354c&lang=es'
      , {json: true}
      , function(err, result, body) {
          if(err) throw(err);
          if (!err && result.statusCode === 200) {
            console.log(body);
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
