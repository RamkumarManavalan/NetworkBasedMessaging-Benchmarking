var restify = require('restify');

function postUser(req, res, next) {
  var user = {};
  user.name = req.params.name;//req.body['name'];// req.params.name;
  user.age = req.params.age;
  user.loopcount = parseInt(req.params.loopcount);
  user.retrycount = parseInt(req.params.retrycount);
  var dbutils = require('./modules/dbutils.js');
  dbutils.insert("mongodb://localhost:27017/dblessDB", "user", user, function(err, msg) {
    if (err) {
      res.send(404, msg);
      next();
    } else {
      console.log("Persisted: " + user);
      res.send(201, user);
      next()
    }
  });
}

var server = restify.createServer({name:'userserv'});
server.use(restify.bodyParser());
server.post({path : '/users', version: '0.0.1'}, postUser);

server.listen(7080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
