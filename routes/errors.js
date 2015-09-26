module.exports = function(app){
  // 404s
  app.use(function(req,res,next){
    res.status(404);
    if(req.accepts('html')){
      return res.send('<h2>Pagina no encontrada</h2>')
    }
    if(req.accepts('json')){
      return res.json({error: 'Pagina no encontrada'});
    }
    // respuesta tipica por defecto
    res.type('txt');
    res.send('Pagina no encontrada');
  })
  // 500
  app.use(function(err, req, res, next){
    console.error('error en %s\n', req.url, err);
    res.send(500, 'Oops, algo salió mal');
  })
}
