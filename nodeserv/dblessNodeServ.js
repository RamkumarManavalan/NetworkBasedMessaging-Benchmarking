var restify = require('restify');

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function postWaitUntil(req, res, next) {
  var rest = require('restler');
  var waituntil = req.params.waituntil;
  var endpoint = null;
  var data = {};
  var curDate = new Date();
  if (curDate >= new Date(waituntil)) {
    endpoint = req.params.endpoint;
    data = req.params.data; 
    data.loopcount = parseInt(req.params.loopcount) + 1;
    data.retrycount = req.params.retrycount;
    //console.log("Playing: "+ endpoint + " " + waituntil + "; Retry Count: "+ req.params.retrycount + " Loop Count: " + req.params.loopcount);
  } else {
    var config = require('config');
    var host = config.get('host');
    var port = config.get('port');
    endpoint = 'http://'+host+':'+port+'/waituntil';
    data.endpoint = req.params.endpoint;
    data.data = req.params.data;
    data.waituntil = waituntil;
    data.loopcount = parseInt(req.params.loopcount) + 1;
    data.retrycount = req.params.retrycount;
    //process.stdout.clearLine();
    //process.stdout.cursorTo(0);
    //console.log("Looping: "+ curDate + " < " + waituntil + "; Loop count: "+ data.loopcount);
  }

  callUntilSuccess(rest, endpoint, data, function(){
  });
/*    rest.post(
      endpoint,
      {data: data}
    ).on('complete', function(data, response) {
      if (response.statusCode == 201) {
        console.log("ERR: " + endpoint + " : " + response.statusCode + " : " + data);
      } else {
        console.log("ERR: " + endpoint + " : " + response.statusCode + " : " + data);
        //data.retrycount = parseInt(data.retrycount) + 1;
      }
    });
*/
  res.send(201, data);
  next();
}

function callUntilSuccess(rest, endpoint, data, cb) {
    var resp = rest.post(
      endpoint,
      {data: data}
    );
    resp.on('fail', function(data, response) {
      console.log("Failed " + response);
    });
    resp.on('error', function(err, response) {
      console.log("Error" + response + " Error: " + err);
    });
    resp.on('complete', function(responsedata, response) {
      if (response.statusCode == 201) {
        console.log("Success: " + endpoint + " : " + response.statusCode + " : " + data);
        cb();
      } else {
        console.log("ERR: " + endpoint + " : " + response.statusCode + " : " + data);
        data.retrycount = parseInt(data.retrycount) + 1;
        var rest = require('restler');
        callUntilSuccess(rest, endpoint, data);
      }
    });
}

function postDelayBy(req, res, next) {
  var data = {};
  data.endpoint = req.params.endpoint;
  data.data = req.params.data;
  var curDate = new Date();
  var t = new Date(curDate);
  t.setSeconds(t.getSeconds() + req.params.delayby);
  data.waituntil = t;
  data.loopcount = 0;
  data.retrycount = 0;
//console.log("Received request at " + curDate + " to delay by " + req.params.delayby);

  var config = require('config');
  var host = config.get('host');
  var port = config.get('port');
  var endpoint = 'http://'+host+':'+port+'/waituntil';
  var rest = require('restler');
  rest.post(
    endpoint,
    {data: data}
  );

  res.send(201, data);
  next();
}

var server = restify.createServer({name:'dblessserv'});
server.use(restify.bodyParser());
server.post({path : '/delayby', version: '0.0.1'}, postDelayBy);
server.post({path : '/waituntil', version: '0.0.1'}, postWaitUntil);

var config = require('config');
var port = config.get('port');
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
