var errors = require('./errors');

module.exports = function(app){
  // home page
  app.get('/',function(req, res){
    res.status(200).render('home.jade',{
      pageTitle:'MeteoPehuajo'
    });
  })
  // error handlers
  errors(app);
}
