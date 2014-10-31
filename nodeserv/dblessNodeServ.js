

function composeEndpoint() {
    var config = require('config');
    var host = config.get('host');
    var port = config.get('port');
    return 'http://'+host+':'+port+'/waituntil';
}

function postWaitUntil(req, res, next) {
  var rest = require('restler');
  var waituntil = req.params.waituntil;
  var data = {};
  data.payload = req.params.payload; 
  data.payload.loopcount = parseInt(data.payload.loopcount) + 1;
  var curDate = new Date();
  if (curDate >= new Date(waituntil)) {
    callUntilSuccess(rest, req.params.endpoint, data.payload, function(){});
    //console.log("Playing: "+ endpoint + " " + waituntil + "; Retry Count: "+ req.params.retrycount + " Loop Count: " + req.params.loopcount);
  } else {
    data.endpoint = req.params.endpoint;
    data.waituntil = waituntil;
    callUntilSuccess(rest, composeEndpoint(), data, function(){});
    //console.log("Looping: "+ curDate + " < " + waituntil + "; Loop count: "+ data.loopcount);
  }
  res.send(201, data);
  next();
}

function callUntilSuccess(rest, endpoint, data, cb) {
    resp = rest.postJson(
      endpoint,
      data
    ).on('complete', function(responsedata, response) {
      if (response.statusCode == 201) {
        cb();
      } else {
        data.retrycount = parseInt(data.retrycount) + 1;
        var rest = require('restler');
        callUntilSuccess(rest, endpoint, data);
      }
    }).on('error', function(err, response) {
      console.log('error '+err);
      cb();
    });
}

function postDelayBy(req, res, next) {
  var data = {};
  data.endpoint = req.params.endpoint;
  data.payload = req.params.payload;
  data.payload.loopcount = 0;
  data.payload.retrycount = 0;
  var curDate = new Date();
  var t = new Date(curDate);
  t.setSeconds(t.getSeconds() + req.params.delayby);
  data.waituntil = t;
  var endpoint = composeEndpoint();
  var rest = require('restler');
  rest.post(endpoint, {data: data});
  res.send(201, data);
  next();
}

var restify = require('restify');
var server = restify.createServer({name:'dblessserv'});
server.use(restify.bodyParser());
server.post({path : '/delayby', version: '0.0.1'}, postDelayBy);
server.post({path : '/waituntil', version: '0.0.1'}, postWaitUntil);

var config = require('config');
var port = config.get('port');
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
