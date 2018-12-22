/**
 * Created by bruce.yang on 2017/2/22.
 */

var http = require('http');
var fs = require("fs");
var path = require('path');
var exec = require('child_process').exec;
var qs = require('querystring');
var area = require('./area');


var postToGameSrv = function(path, data, cb) {
  var content = qs.stringify(data);
  console.log(content);

  var options = {
    host: area.current().gamesrv,
    port: area.current().port,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      "Content-Length": content.length
    }
  };

  var req = http.request(options, function (res) {
    console.log('STATUS: ' + res.statusCode);
//      console.log('HEADERS: ' + JSON.stringify(res.headers));
    var BODY = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      BODY += chunk;
      console.log('BODY: ' + chunk);
    }).on('end', function() {
      var body = JSON.parse(BODY);
      if (res.statusCode == 200 && body.code == 200)
        cb(null, body);
      else {
        cb(body);
      }
    });
  });

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
    cb(e);
  });

  // write data to request body
  req.write(content);
  req.end();
};

var main = function() {
  var arguments = process.argv.splice(2);
  if (arguments.length == 0)
    console.log('Usage: node resaver [seconds]');
  else {
    try {
      var delay = parseInt(arguments[0]);
    } catch (e) {
      console.log('Usage: node resaver [seconds]');
      return;
    }

    // send http to save data
    postToGameSrv('/gmUpdateHuiFang', {time: delay}, function (err, body) {
      console.log('gmUpdateHuiFang:', err, body);

      if (err == null) {
        // countdown
        process.stdout.write('Countdown');
        var cd = delay;
        var timer = setInterval(function () {
          cd -= 1;

          // draw cursor
          process.stdout.write('.');

          // stop timer
          if (cd <= 0) {
            clearTimeout(timer);
            process.stdout.write('\n');
            console.log('OK!!!');
          }
        }, 1000);
      }
    });
  }
};


main();