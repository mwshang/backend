/**
 * Created by bruceyang on 1/5/17.
 */

var uuid = require('uuid');
var MD5 = require('md5');
var model = require('./model');
var area = require('./area');
var http = require('http');
var qs = require('querystring');

module.exports = {
    sessions : [],
    users:{},
    //缓存user
    cacheUser: function(uid,info)
    {
       this.users[uid]=info;
    },
    //清理user
    clearUser: function(uid)
    {
        delete this.users[uid];
    },
    //获取user
    getUser:function(uid)
    {
        if(!this.users[uid]);
            console.error("没有这个玩家:uid:"+uid);

        return this.users[uid];
    },
  getSession : function(uid) {
    var session = uuid.v4()+'/'+uid+'/'+new Date().getTime();
    this.sessions.push(session);

    return session;
  },

  checkSession: function(uid, session) {
    console.log(session, this.sessions.length);
    var index = this.sessions.indexOf(session);
    console.log(index);
    if (index < 0) {
        this.clearUser(uid);
      return false;
    } else {
      var parts = session.split('/');
      if (parts[1] != uid) {
        this.sessions.splice(index, 1);
        this.clearUser(uid);
        return false;
      } else {
        var now = new Date().getTime();
        if (now - parseInt(parts[2]) >= 60000*10) {
          this.sessions.splice(index, 1);
          this.clearUser(uid);
          return false;
        }
      }
    }

    console.log('session valid');
    return true;
  },

  operateLog: function (uid, log) {
    model.operation.create({uid: uid, operation: log}, function(err) {
      if (err != null) {
        console.log('operationLog:', err, uid, log);
      }
    });
  },
  
  postToGameSrv: function(path, data, cb) {
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
                console.log('BODY: ' + BODY);
                if (BODY.indexOf("Cannot") != -1 || BODY.indexOf("<html>") != -1)
                {
                    cb(null, null);
                }
                else
                {
                    var body = JSON.parse(BODY);
                    if (res.statusCode == 200 && body.code == 200)
                        cb(null, body);
                    else {
                        cb(body);
                    }
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
    },

    objKeySort : function(obj) {
      var newKeys = Object.keys(obj).sort();
      var newObj = {};

      for (var i = 0; i < newKeys.length; i++) {
        newObj[newKeys[i]] = obj[newKeys[i]];
      }
      return newObj;
    },

    calcSign : function (params, key) {
      var _params = this.objKeySort(params);

      var mac = '';
      var keys = Object.keys(_params);
      for(var i in keys){
        if (typeof(_params[keys[i]]) == 'object')
          _params[keys[i]] = JSON.stringify(_params[keys[i]]);

        if (keys[i] != 'sign')
          mac += _params[keys[i]];
      }
      console.log(mac+key);
      return MD5(mac+key);
    },
  
    verifySign: function (params, key) {
      return this.calcSign(params, key) == params['sign'];
    },

    getKey: function () {
      return '6412f6a71ebc3747e2097352fb3bb635';
    }
};