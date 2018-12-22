
var async = require('async');
var error = require('../constants');
var model = require('../model');
var utils = require('../utils');
var area = require('../area');

var gameop = {
  notice : function (req, res) {
    var info = req.body;
    if (utils.checkSession(info.uid, info.session)) {
      model.notice1.find({type: info.type}, [ "createdtime", "Z" ], 10, function(err, results) {
        // console.log(err, results);
        if (err != null) {
          res.status(200).json({code: error.DB_ERROR, msg: err});
        } else {
          res.status(200).json({code:200, data:results, session:utils.getSession(info.uid)});
        }
      });
    } else
      res.status(200).json({code:error.SESSION_EXPIRE, msg:'会话过期，请重新登录!'});
  },
  closeRoom : function (req, res) {
    var info = req.body;
    if (utils.checkSession(info.uid, info.session)) {
      if (info.type == 1) { // close table
        utils.postToGameSrv('/qp_closeTable', {uid: info.uid, tableId: info.tableId, serverType: info.serverType}, function (err, body) {
          console.log('qp_closeTable resp:', err, body);
          if (err != null || body == null) {
            res.status(200).json({code: error.GAME_ERROR, msg: err});
          } else {
            res.status(200).json({code: 200, data: (body.code == 200 ? 1 : 0), session: utils.getSession(info.uid)});
          }
        });
      } else if (info. type == 2) {
        utils.postToGameSrv('/qp_arenaClose', {uid: info.uid, arenaId: info.arenaId}, function (err, body) {
          console.log('arenaClose resp:', err, body);
          if (err != null || body == null) {
            res.status(200).json({code: error.GAME_ERROR, msg: err});
          } else {
            res.status(200).json({code: 200, data: (body.code == 200 ? 1 : 0), session: utils.getSession(info.uid)});
          }
        });
      }
    } else
      res.status(200).json({code:error.SESSION_EXPIRE, msg:'会话过期，请重新登录!'});
  },
  getServerTypes : function (req, res) {
    res.status(200).json({code:200, data:area.current().srvTypes});
  }
}

module.exports = gameop;
