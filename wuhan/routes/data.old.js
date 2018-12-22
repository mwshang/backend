
var async = require('async');
var error = require('../constants');
var model = require('../model');
var utils = require('../utils');
var moment = require('moment');
var area = require('../area');

var data = {
  produce: function () {
    var daily = {usedCards: 0, buyCards: 0, newUsers: 0, activeUsers: 0, money: 0};
    var week = {chargeNum: 0, playNum: 0};

    async.waterfall([
      function(cb) {     // 计算每日消耗房卡数量
        model.db.driver.execQuery(
          "SELECT count(id) as num FROM qp_playerHuiFang WHERE (type=2 OR type=8) AND unix_timestamp(recordTime) > (unix_timestamp(current_date()) - 70200) AND unix_timestamp(recordTime) <= (unix_timestamp(current_date()) + 16200);", function (err, data) {
            if (err == null) {
              console.log('used type28', data[0].num);

              if (area.current().id == 'qg' || area.current().id == 'cc') {
                daily.usedCards = data[0].num;
              } else {
                daily.usedCards = data[0].num*4;
              }
            }
            cb(err, daily);
          });
      },
      function(daily, cb) {     // 计算每日消耗房卡数量
        model.db.driver.execQuery(
          "SELECT count(id) as num FROM qp_playerHuiFang WHERE (type=4 OR type=16) AND unix_timestamp(recordTime) > (unix_timestamp(current_date()) - 70200) AND unix_timestamp(recordTime) <= (unix_timestamp(current_date()) + 16200);", function (err, data) {
          if (err == null) {
            console.log('used type416', data[0].num);

            if (area.current().id == 'qg' || area.current().id == 'cc') {
              daily.usedCards += data[0].num*2;
            } else {
              daily.usedCards += data[0].num*8;
            }

            if (area.current().id == 'qg') {
              daily.usedCards = Math.floor(daily.usedCards * 0.9);
            }
          }

          cb(err, daily);
        });
      },
      function(daily, cb) {     // 计算每日消耗房卡数量
        model.db.driver.execQuery(
          "SELECT count(id) as num FROM qp_playerHuiFang WHERE (type=5) AND unix_timestamp(recordTime) > (unix_timestamp(current_date()) - 70200) AND unix_timestamp(recordTime) <= (unix_timestamp(current_date()) + 16200);", function (err, data) {
            if (err == null) {
              console.log('used type416', data[0].num);

              if (area.current().id == 'qz' || area.current().id == 'dh') {
                daily.usedCards += data[0].num * 5;
              }
            }

            cb(err, daily);
          });
      },
      // function(daily, cb) {     // 计算每日充卡数量
      //   model.db.driver.execQuery(
      //     "SELECT sum(gemNum) FROM qp_fangkaRecord WHERE type=1 AND datediff(curdate(), recordTime)=1;", function (err, data) {
      //       if (err == null) {
      //         console.log('buy', data);
      //         daily.buyCards = data[0];
      //       }
      //
      //       cb(err, daily);
      //     });
      // },
      function(daily, cb) {     // 计算每日新增用户
        model.db.driver.execQuery(
          "SELECT count(uid) as num FROM qp_player WHERE datediff(curdate(), registerTime)=1;", function (err, data) {
            if (err == null) {
              console.log('newuser', data[0].num);
              daily.newUsers = data[0].num;
            }

            cb(err, daily);
          });
      },
      function(daily, cb) {     // 计算每日活跃用户
        var sql = "select count(t1.udid) as num from (  \
        select distinct uid1 as udid  \
        from qp_playerHuiFang where unix_timestamp(recordTime) > (unix_timestamp(current_date()) - 70200) AND unix_timestamp(recordTime) <= (unix_timestamp(current_date()) + 16200) \
        UNION \
        select distinct uid2 as udid \
        from qp_playerHuiFang where unix_timestamp(recordTime) > (unix_timestamp(current_date()) - 70200) AND unix_timestamp(recordTime) <= (unix_timestamp(current_date()) + 16200) \
        UNION  \
        select distinct uid3 as udid \
        from qp_playerHuiFang where unix_timestamp(recordTime) > (unix_timestamp(current_date()) - 70200) AND unix_timestamp(recordTime) <= (unix_timestamp(current_date()) + 16200) \
        UNION \
        select distinct uid4 as udid  \
        from qp_playerHuiFang where unix_timestamp(recordTime) > (unix_timestamp(current_date()) - 70200) AND unix_timestamp(recordTime) <= (unix_timestamp(current_date()) + 16200) \
        ) as t1";

        model.db.driver.execQuery(sql, function (err, data) {
            if (err == null) {
              console.log('activeuser', data[0].num);
              daily.activeUsers = data[0].num;

              if (area.current().id == 'qg') {
                daily.activeUsers = Math.floor(daily.activeUsers * 0.9);
              }
            }

            cb(err, daily);
          });
      }
    ], function (err, daily) {
      if (err)
        console.log('昨日统计失败:', err);
      else {
        console.log('昨日统计完成:', daily);

        var newRecord = {};
        newRecord.newUsers = daily.newUsers;
        newRecord.activeUsers = daily.activeUsers;
        newRecord.buyCards = daily.buyCards;
        newRecord.usedCards = daily.usedCards;

        model.dailyData.create(newRecord, function(err, results) {
          if (err != null) {
            console.error('add dailyData failed ', err);
          }
        });
      }
    });

  },

  operatordata : function (req, res) {
    var info = req.body;
    if (utils.checkSession(info.uid, info.session)) {
      var now = moment().unix();
      var threshold = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
      var todayBegin = 0, todayEnd = 0;
      if (now > threshold) {
        todayBegin = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
        todayEnd = moment().hours(23).minutes(59).seconds(59).milliseconds(0).unix();
      } else {
        todayBegin = moment().date(moment().date()-1).hours(4).minutes(30).seconds(0).milliseconds(0).unix();
        todayEnd = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
      }

      var sql = " AND unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd + ";";

      var today = {usedCards: 0, buyCards: 0, newUsers: 0, activeUsers: 0, money: 0};
      var yesterday = {usedCards: 0, buyCards: 0, newUsers: 0, activeUsers: 0, money: 0};

      async.waterfall([
        function(cb) {
          var _sql = "SELECT * FROM qp_dailyData WHERE datediff(curdate(), createdTime)=1";
          // if (now > threshold)
          //   _sql += "0;";
          // else
          //   _sql += "1;";

          model.db.driver.execQuery(_sql, function (err, data) {
              console.log(err, data);
              cb(err, data[0]);
            });
        },
        function(yesterday, cb) {
          model.db.driver.execQuery(
            "SELECT sum(newUsers) as newUsers, sum(usedCards) as usedCards FROM qp_dailyData WHERE datediff(curdate(), createdTime)>=0 AND datediff(curdate(), createdTime)<=6;", function (err, data) {
              console.log(err, data);
              cb(err, yesterday, data[0]);
            });
        },
        function(yesterday, week, cb) {     // 计算每日消耗房卡数量
          model.db.driver.execQuery(
            "SELECT count(id) as num FROM qp_playerHuiFang WHERE (type=2 OR type=8) " + sql, function (err, data) {
              if (err == null) {
                console.log('used type28', data[0].num);
                if (area.current().id == 'qg' || area.current().id == 'cc') {
                  today.usedCards = data[0].num;
                } else
                  today.usedCards = data[0].num*4;
              }
              cb(err, yesterday, week, today);
            });
        },
        function(yesterday, week, today, cb) {     // 计算每日消耗房卡数量
          model.db.driver.execQuery(
            "SELECT count(id) as num FROM qp_playerHuiFang WHERE (type=4 OR type=16)" + sql, function (err, data) {
              if (err == null) {
                console.log('used type416', data[0].num);
                if (area.current().id == 'qg' || area.current().id == 'cc') {
                  today.usedCards += data[0].num*2;
                } else
                  today.usedCards += data[0].num*8;

                if (area.current().id == 'qg') {
                  today.usedCards = Math.floor(today.usedCards * 0.9);
                }
              }

              cb(err, yesterday, week, today);
            });
        },
        function(yesterday, week, today, cb) {     // 计算每日消耗房卡数量
          model.db.driver.execQuery(
            "SELECT count(id) as num FROM qp_playerHuiFang WHERE (type=5)" + sql, function (err, data) {
              if (err == null) {
                console.log('used type416', data[0].num);
                if (area.current().id == 'qz' || area.current().id == 'dh') { // type = 5
                  today.usedCards += data[0].num*5;
                }
              }

              cb(err, yesterday, week, today);
            });
        },
        function(yesterday, week, today, cb) {     // 计算每日新增用户
          var _sql = " unix_timestamp(registerTime) >= " + todayBegin + " AND unix_timestamp(registerTime) < " + todayEnd + ";";

          model.db.driver.execQuery(
            "SELECT count(uid) as num FROM qp_player WHERE " + _sql, function (err, data) {
              if (err == null) {
                console.log('newuser', data[0].num);
                today.newUsers = data[0].num;
              }

              cb(err, yesterday, week, today);
            });
        },
        function(yesterday, week, today, cb) {     // 计算每日活跃用户
          var sql = "select count(t1.udid) as num from (  \
            select distinct uid1 as udid  \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
          sql += " UNION \
            select distinct uid2 as udid \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
          sql += " UNION \
            select distinct uid3 as udid \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
          sql += " UNION \
            select distinct uid4 as udid  \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
          sql += ") as t1";

          model.db.driver.execQuery(sql, function (err, data) {
            if (err == null) {
              console.log('activeuser', data[0].num);
              today.activeUsers = data[0].num;

              if (area.current().id == 'qg') {
                today.activeUsers = Math.floor(today.activeUsers * 0.9);
              }
            }

            cb(err, yesterday, week, today);
          });
        },
        function( yesterday, week,today,cb)  //获取在线人数
        {
            utils.postToGameSrv('/gmGetOnline',{}, function (err, body) {
                console.log(err, body);
                if(body == undefined || body==null)
                {
                    today.onlineNum=-1;
                }
                else
                {
                    today.onlineNum = body.onlineNum;
                }
                cb(err, yesterday, week, today);
            });
        }
      ], function (err, yesterday, week, today) {
        if (err != null) {
          res.status(200).json({code: error.DB_ERROR, msg: err});
        } else {
           console.log(err, today, yesterday, week);
          res.status(200).json({code:200, data:{today: today, yesterday: yesterday, week: week}, session:utils.getSession(info.uid)});
        }
      });
    } else
      res.status(200).json({code:error.SESSION_EXPIRE, msg:'会话过期，请重新登录!'});
  },

  agentdata: function (req, res) { // 代理数据概览
    var info = req.body;
    if (utils.checkSession(info.uid, info.session)) {
      var now = moment().unix();
      var threshold = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
      var todayBegin = 0, todayEnd = 0;
      if (now > threshold) {
        todayBegin = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
        todayEnd = moment().hours(23).minutes(59).seconds(59).milliseconds(0).unix();
      } else {
        todayBegin = moment().date(moment().date()-1).hours(4).minutes(30).seconds(0).milliseconds(0).unix();
        todayEnd = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
      }

      var between_time = " AND unix_timestamp(a.recordTime) >= " + todayBegin + " AND unix_timestamp(a.recordTime) < " + todayEnd + ";";

      var _query = function (users, callback) {
        var queries = [];
        var j = 0;
        for (var r in users) {
          queries.push(function (cb) {
            var uid = users[j++].uid;
            console.log('agent: ', uid);
            var sql = "SELECT COUNT(uid) as agentNum FROM qp_backendUser as a WHERE a.level2Agent=?";
            console.log(sql);
            model.db.driver.execQuery( // 下级代理数
              sql, [uid], function (err, data) {
                console.log('agent num:', err, data);
                if (err != null)
                  cb(error.DB_ERROR, null);
                else {
                  sql = "SELECT COUNT(uid) as playerNum FROM qp_player as a WHERE a.agentCode=?";
                  var _uid = parseInt(uid);
                  console.log(sql, _uid.toString(8));
                  model.db.driver.execQuery( // 绑定用户数
                    sql, [_uid.toString(8)], function (err, data1) {
                      console.log('player num:', err, data1);
                      if (err != null)
                        cb(error.DB_ERROR, null);
                      else {
                        sql = "SELECT COUNT(DISTINCT a.giveUid) as chargePlayerNum FROM qp_fangkaRecord as a LEFT JOIN qp_player as b" +
                          " ON a.giveUid = b.uid WHERE b.agentCode=? " + between_time;
                        model.db.driver.execQuery( // 今日充钻用户数
                          sql, [_uid.toString(8)], function (err, data2) {
                            console.log('today charge player num:', err, data2);
                            if (err != null)
                              cb(error.DB_ERROR, null);
                            else {
                              cb(null, data[0].agentNum, data1[0].playerNum, data2[0].chargePlayerNum /*+ data3[0].chargeAgentNum*/);
                            }
                          });
                      }
                    });
                }
              });
          });
        }

        async.parallel(queries,
          function(err, results1) {
            if (err == null) {
              for (var i=0; i<results1.length; i++) {
                users[i].agentNum = results1[i][0] == null ? 0 : results1[i][0];
                users[i].playerNum = results1[i][1] == null ? 0 : results1[i][1];
                users[i].chargeNum = results1[i][2] == null ? 0 : results1[i][2];
              }
              // users.sort(function(a,b){
              //   return b.agentNum-a.agentNum});
              // console.log(users[i]);

              callback(null, users);
            } else
              callback(err);
          });
      };

      console.log(info);
      _query([info], function (err, data) {
        if (err == null)
          res.status(200).json({code: 200, data: data[0], session: utils.getSession(info.uid)});
        else
          res.status(200).json({code: error.INT_ERROR, msg: err});
      });
    } else
      res.status(200).json({code:error.SESSION_EXPIRE, msg:'会话过期，请重新登录!'});
  }
}

//getCurrentOnLine:function(req,res)
//{
//
//}
module.exports = data;
