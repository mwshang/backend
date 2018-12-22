var async = require('async');
//
// async.parallel([
//     function(callback){
//       callback(null, 'one', {a:1, b:2});
//     },
//     function(callback){
//       callback(null, 'two', {a:0, b:1});
//     }
//   ],
//   function(err, results){
//     console.log(err);
//     console.log(results[0][1]);
//     console.log(results[1][1]);
//   });
//
// var IMVoice = require('./imvoice').IMVoice;
//
// console.log('清理聊天室');
// new IMVoice().BatchDelRooms();

var area = require('./area');
var model = require('./model');
var user = require('./routes/user');
var player = require('./routes/player');
var orm = require("orm");

orm.connect(area.current().db, function(err, db) {
  if (err)
    console.error('Connection error: ' + err);
  else {
    // connected
    model.init(db);

    //for (var i=1; i<=100; i++) {
    //  var newRecord = {};
    //  var id = 0;
    //  if (i<10)
    //    id = '00' + i;
    //  else if (i < 100)
    //    id = '0' + i;
    //  else
    //    id = i;
    //  console.log(id);
    //  newRecord.userName = '公司' + id;
    //  newRecord.nickName = '公司' + id;
    //  newRecord.deviceID = 'sss' + id;
    //  newRecord.userSex = 1;
    //  newRecord.regType = 1;
    //  newRecord.password = '12345';
    //  newRecord.vipLevel = 20;
    //  newRecord.headUrl = 'xxxxx.png';
    //  newRecord.coinNum = 1;
    //  newRecord.gemNum = 1;
    //  newRecord.scoreNum = 1;
    //  newRecord.charm = 1;
    //  newRecord.firstPaid = 1;
    //  newRecord.phoneNumber = id;
    //  newRecord.loginCount = 0;
    //  newRecord.playedTime = 0;
    //  newRecord.clientType = 0;
    //  newRecord.GM = 0;
    //  newRecord.agentCode = '';
    //  newRecord.rootAgent = 0;
    //
    //  model.player.create(newRecord, function(err, results) {
    //    console.log(err, results);
    //  });
    //}

    var sql = "SELECT count(*) as num FROM `qp_backenduser` where `isAgent` < 3";
    model.db.driver.execQuery(
        sql, function (err, data) {
          console.log(err, data);
          if (err == null){

            var queries = [];
            var j=0;
            for (var i = 0; i<100; i++) {
              queries.push(function (cb1) {
                async.waterfall([
                  function(cb) {
                    var sql = "SELECT * FROM `qp_backenduser` where `isAgent` < 3 order by id desc limit 1 offset " + j;
                    j++;
                    model.db.driver.execQuery(
                        sql, function (err, data) {
                          console.log(err, data[0]);
                          if (err == null && data.length > 0) {
                            var user = data[0];
                              if (user.level2Agent == 0)
                              cb('No parent agent');
                            else
                              cb(null, user);
                              //cb('stop here');
                          }
                        });
                  },
                  function(user, cb) {
                    if (user.level1Agent > 0)
                      cb(null, user);
                    else {
                      var sql = "SELECT level2Agent FROM `qp_backenduser` where uid=?";
                      model.db.driver.execQuery(
                          sql, [user.level2Agent], function (err, data) {
                            console.log(err, data[0]);
                            if (err == null && data.length > 0 && data[0].level2Agent > 0) {
                              var sql = "update qp_backenduser set level1Agent=? where uid=?";
                              model.db.driver.execQuery(
                                  sql, [data[0].level2Agent, user.uid], function (err) {
                                    console.log(err);
                                    if (err == null) {
                                      user.level1Agent = data[0].level2Agent;
                                      cb(null, user);
                                    } else
                                      cb(err);
                                  });
                            } else
                              cb('no level1Agent');
                          });
                    }
                  },
                  function(user, cb) {
                    if (user.extl3Agent > 0)
                      cb(null, user);
                    else {
                      var sql = "SELECT level2Agent FROM `qp_backenduser` where uid=?";
                      model.db.driver.execQuery(
                          sql, [user.level1Agent], function (err, data) {
                            console.log(err, data[0]);
                            if (err == null && data.length > 0 && data[0].level2Agent > 0) {
                              var sql = "update qp_backenduser set extl3Agent=? where uid=?";
                              model.db.driver.execQuery(
                                  sql, [data[0].level2Agent, user.uid], function (err) {
                                    console.log(err);
                                    if (err == null) {
                                      user.extl3Agent = data[0].level2Agent;
                                      cb(null, user);
                                    } else
                                      cb(err);
                                  });
                            } else
                              cb('no extl3Agent');
                          });
                    }
                  },
                  function(user, cb) {
                    if (user.extl4Agent > 0)
                      cb(null, user);
                    else {
                      var sql = "SELECT level2Agent FROM `qp_backenduser` where uid=?";
                      model.db.driver.execQuery(
                          sql, [user.extl3Agent], function (err, data) {
                            console.log(err, data[0]);
                            if (err == null && data.length > 0 && data[0].level2Agent > 0) {
                              var sql = "update qp_backenduser set extl4Agent=? where uid=?";
                              model.db.driver.execQuery(
                                  sql, [data[0].level2Agent, user.uid], function (err) {
                                    console.log(err);
                                    if (err == null) {
                                      user.extl4Agent = data[0].level2Agent;
                                      cb(null, user);
                                    } else
                                      cb(err);
                                  });
                            } else
                              cb('no extl4Agent');
                          });
                    }
                  },
                  function(user, cb) {
                    if (user.extl5Agent > 0)
                      cb(null, user);
                    else {
                      var sql = "SELECT level2Agent FROM `qp_backenduser` where uid=?";
                      model.db.driver.execQuery(
                          sql, [user.extl4Agent], function (err, data) {
                            console.log(err, data[0]);
                            if (err == null && data.length > 0 && data[0].level2Agent > 0) {
                              var sql = "update qp_backenduser set extl5Agent=? where uid=?";
                              model.db.driver.execQuery(
                                  sql, [data[0].level2Agent, user.uid], function (err) {
                                    console.log(err);
                                    if (err == null) {
                                      user.extl5Agent = data[0].level2Agent;
                                      cb(null, user);
                                    } else
                                      cb(err);
                                  });
                            } else
                              cb('no extl5Agent');
                          });
                    }
                  },
                  function(user, cb) {
                    if (user.extl6Agent > 0)
                      cb(null, user);
                    else {
                      var sql = "SELECT level2Agent FROM `qp_backenduser` where uid=?";
                      model.db.driver.execQuery(
                          sql, [user.extl5Agent], function (err, data) {
                            console.log(err, data[0]);
                            if (err == null && data.length > 0 && data[0].level2Agent > 0) {
                              var sql = "update qp_backenduser set extl6Agent=? where uid=?";
                              model.db.driver.execQuery(
                                  sql, [data[0].level2Agent, user.uid], function (err) {
                                    console.log(err);
                                    if (err == null) {
                                      user.extl6Agent = data[0].level2Agent;
                                      cb(null, user);
                                    } else
                                      cb(err);
                                  });
                            } else
                              cb('no extl6Agent');
                          });
                    }
                  },
                  function(user, cb) {
                    if (user.extl7Agent > 0)
                      cb(null, user);
                    else {
                      var sql = "SELECT level2Agent FROM `qp_backenduser` where uid=?";
                      model.db.driver.execQuery(
                          sql, [user.extl6Agent], function (err, data) {
                            console.log(err, data[0]);
                            if (err == null && data.length > 0 && data[0].level2Agent > 0) {
                              var sql = "update qp_backenduser set extl7Agent=? where uid=?";
                              model.db.driver.execQuery(
                                  sql, [data[0].level2Agent, user.uid], function (err) {
                                    console.log(err);
                                    if (err == null) {
                                      user.extl7Agent = data[0].level2Agent;
                                      cb(null, user);
                                    } else
                                      cb(err);
                                  });
                            } else
                              cb('no extl7Agent');
                          });
                    }
                  },
                  function(user, cb) {
                    if (user.extl8Agent > 0)
                      cb(null, user);
                    else {
                      var sql = "SELECT level2Agent FROM `qp_backenduser` where uid=?";
                      model.db.driver.execQuery(
                          sql, [user.extl7Agent], function (err, data) {
                            console.log(err, data[0]);
                            if (err == null && data.length > 0 && data[0].level2Agent > 0) {
                              var sql = "update qp_backenduser set extl8Agent=? where uid=?";
                              model.db.driver.execQuery(
                                  sql, [data[0].level2Agent, user.uid], function (err) {
                                    console.log(err);
                                    if (err == null) {
                                      user.extl8Agent = data[0].level2Agent;
                                      cb(null, user);
                                    } else
                                      cb(err);
                                  });
                            } else
                              cb('no extl8Agent');
                          });
                    }
                  },
                  function(user, cb) {
                    if (user.extl9Agent > 0)
                      cb(null, user);
                    else {
                      var sql = "SELECT level2Agent FROM `qp_backenduser` where uid=?";
                      model.db.driver.execQuery(
                          sql, [user.extl8Agent], function (err, data) {
                            console.log(err, data[0]);
                            if (err == null && data.length > 0 && data[0].level2Agent > 0) {
                              var sql = "update qp_backenduser set extl9Agent=? where uid=?";
                              model.db.driver.execQuery(
                                  sql, [data[0].level2Agent, user.uid], function (err) {
                                    console.log(err);
                                    if (err == null) {
                                      user.extl9Agent = data[0].level2Agent;
                                      cb(null, user);
                                    } else
                                      cb(err);
                                  });
                            } else
                              cb('no extl9Agent');
                          });
                    }
                  },
                ], function(err, user) {
                  console.log(err, user);
                  cb1(null);
                });
              });
            }

            async.parallel(queries,
              function(err) {
                console.log(err);
              });
            }
        });
  }
});
