
var async = require('async');
var error = require('../constants');
var model = require('../model');
var utils = require('../utils');
var user = require('./user');
var moment = require('moment');

// 宁波对接接口
var nbAdapter = {
  error: {
    OK: {errno: 0, errmsg:''},
    PlayerNotExist: {errno: 1, errmsg:'玩家不存在'},
    ParamError: {errno: 2, errmsg:'参数错误'},
    SignError: {errno: 3, errmsg:'签名错误'},
    GameServerError: {errno: 4, errmsg:'游戏服务器出错'},
    OtherError: {errno: 5, errmsg:'其他错误'},
  },

  signKey: 'bm4drzhof1ikn_tg',
  gameId: {
    10000: 'xuezhan'
  },

  // 下单充值
  recharge : function (req, res) {
    console.log('recharge', req.body);
    var params = req.body;
    console.log(params);

    if (utils.verifySign(params, nbAdapter.signKey)) {
      model.player.find({uid: params.playerid}, 1, function(err, results) {
        if (err != null) {
          res.status(200).json({errno: nbAdapter.error.GameServerError.errno, errmsg: nbAdapter.error.GameServerError.errmsg});
        } else {
          if (results.length == 0) {
            res.status(200).json({errno: nbAdapter.error.PlayerNotExist.errno, errmsg: nbAdapter.error.PlayerNotExist.errmsg});
          } else {
            model.payRecord.find({orderNo: params.orderid}, 1, ['id', 'Z'], function (err, results) {
              if (err != null) {
                res.status(200).json({errno: nbAdapter.error.GameServerError.errno, errmsg: nbAdapter.error.GameServerError.errmsg});
                return;
              } else if (results.length == 0) {
                var goods = params.goodsid.split('.');
                var price = goods[goods.length - 2];
                var count = goods[goods.length - 1];

                var time = moment().format('YYYYMMDDHHmmss');
                var payRecord = {
                  playerId: params.playerid, productName: '购买钻石', productNum: count, payChannel: 'nb',
                  orderAmount: parseFloat(price), orderNo: params.orderid, traceNo: params.orderid, status: 1
                };
                model.payRecord.create(payRecord, function (err, results) {
                  if (err != null) {
                    console.log('store payRecord', err);
                    res.status(200).json({errno: nbAdapter.error.GameServerError.errno, errmsg: nbAdapter.error.GameServerError.errmsg});
                  } else {
                    model.payRecord.find({orderNo: params.orderid}, 1, ['id', 'Z'], function (err, results) {
                      if (err == null && results.length > 0) {
                        payRecord = results[0];
                        var userinfo = {uid: 100000, pid: payRecord.playerId, gem: count, payId: payRecord.id};
                        user._donateCards(userinfo.uid, userinfo.pid, userinfo.gem, 0, userinfo.payId, function (err, result) {
                          if (err != null) {
                            console.log(params.OrderNo, 'pay success but donate card fail', err);
                            utils.operateLog(payRecord.playerId, '支付成功,发钻失败 ' + payRecord.OrderNo + '|' + err.code);
                          } else {
                            // user.donateBonus(userinfo, result.id, payRecord.orderAmount);
                          }
                          res.status(200).json({errno: nbAdapter.error.OK.errno, errmsg: nbAdapter.error.OK.errmsg});
                        });
                      } else {
                        res.status(200).json({errno: nbAdapter.error.OK.errno, errmsg: nbAdapter.error.OK.errmsg});
                      }
                    });
                  }
                });
              }
            });
          }
        }
      });
    } else
      res.status(200).json({errno:nbAdapter.error.SignError.errno, errmsg: nbAdapter.error.SignError.errmsg});
  },

  // 查询玩家信息
  queryplayer: function (req, res) {
    console.log('queryplayer', req.body);
    var params = req.body;
    console.log(params);

    if (utils.verifySign(params, nbAdapter.signKey)) {
      model.player.find({uid: params.playerid}, 1, function(err, results) {
        // console.log(err, results);
        if (err != null) {
          res.status(200).json({errno: nbAdapter.error.GameServerError.errno, errmsg: nbAdapter.error.GameServerError.errmsg});
        } else {
          if (results.length == 0) {
            res.status(200).json({errno: nbAdapter.error.PlayerNotExist.errno, errmsg: nbAdapter.error.PlayerNotExist.errmsg});
          } else {
            var player = results[0];
            var value = {};
            value['accountvalue'] = ''+player.scoreNum;
            value['nickname'] = player.nickName;
            value['card'] = ''+player.gemNum;
            res.status(200).json({errno: nbAdapter.error.OK.errno, errmsg: nbAdapter.error.OK.errmsg, value: value});
          }
        }
      });
    } else
      res.status(200).json({errno:nbAdapter.error.SignError.errno, errmsg: nbAdapter.error.SignError.errmsg});
  },

  // 绑定邀请码
  bindinvitation: function (req, res) {
    console.log('bindinvitation', req.body);
    var params = req.body;
    console.log(params);

    if (utils.verifySign(params, nbAdapter.signKey)) {
      model.player.find({uid: params.playerid}, 1, function(err, results) {
        if (err != null) {
          res.status(200).json({errno: nbAdapter.error.GameServerError.errno, errmsg: nbAdapter.error.GameServerError.errmsg});
        } else {
          if (results.length == 0) {
            res.status(200).json({errno: nbAdapter.error.PlayerNotExist.errno, errmsg: nbAdapter.error.PlayerNotExist.errmsg});
          } else {
            var player = results[0];

            if (player.agentCode != null && player.agentCode.length > 1) {
              res.status(200).json({errno: nbAdapter.error.OK.errno, errmsg: nbAdapter.error.OK.errmsg});
              return;
            }

            // model.user.find({agentId: params.code}, 1, function(err, results) {
            //   if (err == null && results.length > 1) {
            //     console.log('agentId', results[0].agentId);

                player.save({agentCode: params.code}, function (err) {
                  if (err == null) {
                    utils.operateLog(params.playerid, '玩家绑定代理邀请码: ' + params.code);

                    // 赠送钻石
                    model.settings.find({key: 'bindAgentReward'}, 1, function(err, results) {
                      if (err == null && results.length > 0) {
                        console.log(results[0].value);

                        var num = results[0].value.split('|')[0];
                        num = parseInt(num);
                        user._donateCards('100000', params.playerid, num, num, 0, function(err, result) {
                          if (err != null)
                            utils.operateLog(params.playerid, '玩家绑定邀请码赠送钻石'+num+'失败!');
                        });
                      }
                    });

                    res.status(200).json({errno: nbAdapter.error.OK.errno, errmsg: nbAdapter.error.OK.errmsg});
                  } else {
                    res.status(200).json({errno: nbAdapter.error.GameServerError.errno, errmsg: nbAdapter.error.GameServerError.errmsg});
                  }
                });
              // } else {
              //   res.status(200).json({errno: nbAdapter.error.ParamError.errno, errmsg: nbAdapter.error.ParamError.errmsg});
              // }
            //
            // });
          }
        }
      });
    } else
      res.status(200).json({errno:nbAdapter.error.SignError.errno, errmsg: nbAdapter.error.SignError.errmsg});
  },

  // 封号 解封
  lockplayer: function (req, res) {
    console.log('queryplayer', req.body);
    var params = req.body;
    console.log(params);

    if (utils.verifySign(params, nbAdapter.signKey)) {
      model.player.find({uid: params.playerid}, 1, function(err, results) {
        // console.log(err, results);
        if (err != null) {
          res.status(200).json({errno: nbAdapter.error.GameServerError.errno, errmsg: nbAdapter.error.GameServerError.errmsg});
        } else {
          if (results.length == 0) {
            res.status(200).json({errno: nbAdapter.error.PlayerNotExist.errno, errmsg: nbAdapter.error.PlayerNotExist.errmsg});
          } else {
            var player = results[0];
            player.save({locked: params.type == 0 ? 1 : 0}, function (err) {
              if (err == null) {
                res.status(200).json({errno: nbAdapter.error.OK.errno, errmsg: nbAdapter.error.OK.errmsg});
              } else {
                res.status(200).json({errno: nbAdapter.error.GameServerError.errno, errmsg: nbAdapter.error.GameServerError.errmsg});
              }
            });
          }
        }
      });
    } else
      res.status(200).json({errno:nbAdapter.error.SignError.errno, errmsg: nbAdapter.error.SignError.errmsg});
  },

  // 查询一小时内在线用户数
  queryonlinenumber: function (req, res) {
    console.log('queryonlinenumber', req.body);
    var params = req.body;
    console.log(params);

    var maxOnline = 0, online = 0, onlineData = [];
    // if (utils.verifySign(params, params.sign)) {
    model.db.driver.execQuery(
      "SELECT max(activeUsers) as maxOnline FROM qp_10minData WHERE datediff(curdate(), createdTime)=0;", function (err, data) {
        if (err == null) {
          console.log('maxOnline', data[0].maxOnline);
          if (data[0].maxOnline != null)
            maxOnline = parseInt(data[0].maxOnline);

          model.db.driver.execQuery(
            "SELECT time_format(createdTime, '%H:%i') as time , `activeUsers` as count FROM qp_10minData ORDER BY id desc limit 6;", function (err, data) {
              if (err == null) {
                console.log('onlineData', data);
                onlineData = data;
                online = data[0].count;

                res.status(200).json({errno: nbAdapter.error.OK.errno, errmsg: nbAdapter.error.OK.errmsg, online: online, maxOnline: maxOnline, onlineData: onlineData});
              } else {
                console.log(err);
                res.status(200).json({errno: nbAdapter.error.GameServerError.errno, errmsg: nbAdapter.error.GameServerError.errmsg});
              }
            });
        } else {
          console.log(err);
          res.status(200).json({errno: nbAdapter.error.GameServerError.errno, errmsg: nbAdapter.error.GameServerError.errmsg});
        }
      });
    // } else
    //   res.status(200).json({errno:nbAdapter.error.SignError.errno, errmsg: nbAdapter.error.SignError.errmsg});
  },

  // 游戏统计
  gamestatistic: function (req, res) {
    console.log('gamestatistic', req.body);
    var params = req.body;
    console.log(params);
    if (utils.verifySign(params, nbAdapter.signKey)) {

      var sql = "select DATE_FORMAT(createdTime,'%Y-%m-%d') as date, openTables as open, activeUsers as active, new Users as register," +
        "usedCards as consume, (consume/active) as dau, leftCards as surplus from qp_dailyData where createdTime >= '"+params.starttime+"' and createdTime <= '" + params.stoptime + "' order by id asc;";
      model.db.driver.execQuery(sql, function (err, data) {
          if (err == null) {
            res.status(200).json({errno: nbAdapter.error.OK.errno, errmsg: nbAdapter.error.OK.errmsg, data: data});
          } else {
            res.status(200).json({errno: nbAdapter.error.GameServerError.errno, errmsg: nbAdapter.error.GameServerError.errmsg});
          }
        });
    } else
      res.status(200).json({errno:nbAdapter.error.SignError.errno, errmsg: nbAdapter.error.SignError.errmsg});
  },
}

module.exports = nbAdapter;
