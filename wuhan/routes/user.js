var async = require('async');
var error = require('../constants');
var model = require('../model');
var utils = require('../utils');
var orm = require('orm');

var moment = require('moment');
// var smsClient = require('../smscode');
var OAuth = require('wechat-oauth');
var wxPub = require('../wxpub');

var user = {
// 代理登录后台
    login: function (req, res) {
        var userinfo = req.body;
        console.log(userinfo);
        var condition = {};

        condition['uid'] = userinfo.name;
        if (userinfo.pwd != undefined && userinfo.pwd.length > 0)
            condition.password = userinfo.pwd;

        console.log(condition);

        async.waterfall([
            function (cb) { // first find from player table check existence
                model.user.find(condition, 1, function (err, results) {
                    console.log(err, results);
                    if (err != null) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        if (results.length == 0) {
                            condition['name'] = userinfo.name;
                            model.user.find(condition, 1, function (err, results) {
                                console.log(err, results);
                                if (err != null) {
                                    cb({code: error.DB_ERROR, msg: err});
                                } else {
                                    if (results.length == 0) {
                                        cb({code: error.INT_ERROR, msg: '账号或密码错误，请重新输入.'});
                                    } else {
                                        if (userinfo.code != undefined && userinfo.code.length > 0) {
                                            if (user.wxCodePool[results[0].uid] != undefined && user.wxCodePool[results[0].uid] == userinfo.code) {
                                                cb(null, results[0]);
                                            } else {
                                                cb({code: error.INT_ERROR, msg: '公众号授权超时，请重新点公众号菜单登录.'});
                                            }
                                        } else {
                                            cb(null, results[0]);
                                        }
                                    }
                                }
                            });
                        } else {
                            if (userinfo.code != undefined && userinfo.code.length > 0) {
                                if (user.wxCodePool[results[0].uid] != undefined && user.wxCodePool[results[0].uid] == userinfo.code) {
                                    cb(null, results[0]);
                                } else {
                                    cb({code: error.INT_ERROR, msg: '公众号授权超时，请重新点公众号菜单登录.'});
                                }
                            } else {
                                cb(null, results[0]);
                            }
                        }
                    }
                });
            },
            function (user, cb) { // 检查是否有邀请码
                if (user.agentId.length == 0) {
                    var uid = parseInt(user.uid);
                    user.agentId = '' + uid.toString(8);
                    user.save({agentId: user.agentId}, function (err, results) {
                        cb(null, user);
                    });
                } else {
                    cb(null, user);
                }
            },
            function (user, cb) { // 获取房卡数量
                console.log('get gem num');
                var record = {};
                record.uid = user.uid;
                model.player.find(record, function (err, results) {
                    if (err != null) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        if (results.length > 0) {
                            if (results[0].vipLevel >= 20) {
                                if (results[0].vipLevel < 90 && userinfo.type == 1) { // type 1 登录运营后台  0 登录代理后台
                                    cb({code: error.INT_ERROR, msg: '代理账号无权登录运营后台.'});
                                } else {
                                    user.gemNum = results[0].gemNum;
                                    user.locked = (results[0].vipLevel == 0 ? 1 : 0);
                                    cb(null, user);
                                }
                            } else {
                                cb({code: error.INT_ERROR, msg: '您的后台权限已被收回,请联系客服.'});
                            }
                        } else {
                            cb({code: error.INT_ERROR, msg: '服务器内部错误.'});
                        }
                    }
                });
            }
// function(user, cb) { // 获取可提佣金数量
//   console.log('get bonus available');
//   var record = {};
//   record.uid = user.uid;
//   model.user.find(record, function(err, results) {
//     if (err != null) {
//       cb({code: error.DB_ERROR, msg: err});
//     } else {
//       if (results.length > 0) {
//         user.bonusTotal = results[0].bonusTotal;
//         user.bonusOut = results[0].bonusOut;
//         user.bonusAvail = results[0].bonusTotal - results[0].bonusOut;
//         cb(null, user);
//       } else {
//         cb({code: error.INT_ERROR, msg: '服务器内部错误.'});
//       }
//     }
//   });
// }
        ], function (err, result) {
            if (err)
                res.status(200).json(err);
            else {
                // utils.cacheUser(result.uid,result);
                res.status(200).json({code: 200, data: result, session: utils.getSession(result.uid)});
                utils.operateLog(result.uid, '登录');
            }
        });


    },

// 代理注册
    register: function (req, res) {
        var userinfo = req.body;
        console.log(userinfo);

        async.waterfall([
            function (cb) { // first find from player table check existence
                console.log('check player uid');
                model.player.find({uid: userinfo.uid}, 1, function (err, results) {
                    if (err != null) {
                        console.log('check player uid 1');
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        if (results.length == 0) {
                            console.log('check player uid 2');
                            cb({code: error.INT_ERROR, msg: '游戏ID不存在.'});
                        } else {
                            console.log(results[0].uid);
                            if (results[0].vipLevel < 20)
                                cb({code: error.INT_ERROR, msg: '您没有权限注册,请联系客服.'});
                            else
                                cb(null, results[0]);
                        }
                    }
                });
            },
            function (player, cb) {  // first find uid from user table check existence
                console.log('check uid exist');
                model.user.find({uid: player.uid}, 1, function (err, results) {
                    if (err != null) {
                        cb({code: error.DB_ERROR, msg: err.message});
                    } else {
                        if (results.length > 0) {
                            cb({code: error.INT_ERROR, msg: 'UID已存在，请直接登录.'});
                        } else {
                            cb(null, player);
                        }
                    }
                });
            },
            function (player, cb) {
                console.log('check customAgentCode exist');
                model.settings.find({key: 'customAgentCode'}, 1, function (err, results) {
                    if (err == null && results.length == 1 && results[0].value == '1') {
                        cb(null, player, true);
                    } else {
                        cb(null, player, false);
                    }
                });
            },
            function (player, customAgentCode, cb) {  // second find agentid from user table check existence
                console.log('check agentid exist');
                if (customAgentCode) {
                    model.user.find({agentId: userinfo.agentCode}, 1, function (err, results) {
                        if (err != null) {
                            cb({code: error.DB_ERROR, msg: err.message});
                        } else {
                            if (results.length > 0) {
                                cb({code: error.INT_ERROR, msg: '邀请码已被使用.'});
                            } else {
                                cb(null, player, true);
                            }
                        }
                    });
                } else {
                    cb(null, player, false);
                }
            },
            function (player, customAgentCode, cb) {  // third find phonenumber from user table check existence
                console.log('check phoneNumber exist');
                if (userinfo.phoneNumber.length > 0) {
                    model.user.find({phoneNumber: userinfo.phoneNumber}, 1, function (err, results) {
                        if (err != null) {
                            cb({code: error.DB_ERROR, msg: err.message});
                        } else {
                            if (results.length > 0) {
                                cb({code: error.INT_ERROR, msg: '手机号已被使用.'});
                            } else {
                                cb(null, player, customAgentCode);
                            }
                        }
                    });
                } else
                    cb(null, player, customAgentCode);
            },
            function (player, customAgentCode, cb) {
                console.log('check upper level agent');
                model.subAgent.find({subUid: player.uid}, 1, ['id', 'Z'], function (err, results) {
                    if (err != null) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        player.level1Uid = 0;
                        player.level2Uid = 0;
                        player.rootAgent = 0;

                        if (results.length > 0) {
                            var level1Uid = 0;
                            var level2Uid = results[0].uid;

                            var extl3Agent = 0, extl4Agent = 0, extl5Agent = 0, extl6Agent = 0, extl7Agent = 0,
                                extl8Agent = 0, extl9Agent = 0;

                            model.user.find({uid: level2Uid}, 1, function (err, results) {
                                if (err == null && results.length > 0) {
                                    level1Uid = results[0].level2Agent;

                                    extl3Agent = results[0].level1Agent;
                                    extl4Agent = results[0].extl3Agent;
                                    extl5Agent = results[0].extl4Agent;
                                    extl6Agent = results[0].extl5Agent;
                                    extl7Agent = results[0].extl6Agent;
                                    extl8Agent = results[0].extl7Agent;
                                    extl9Agent = results[0].extl8Agent;

                                    if (results[0].isAgent == 2)
                                        player.rootAgent = results[0].uid;
                                    else
                                        player.rootAgent = results[0].rootAgent;
                                }

                                // if (results[0].isAgent < 3) {
                                player.level1Uid = level1Uid;
                                player.level2Uid = level2Uid;

                                player.extl3Agent = extl3Agent;
                                player.extl4Agent = extl4Agent;
                                player.extl5Agent = extl5Agent;
                                player.extl6Agent = extl6Agent;
                                player.extl7Agent = extl7Agent;
                                player.extl8Agent = extl8Agent;
                                player.extl9Agent = extl9Agent;

                                // }
                                cb(null, player, customAgentCode);
                            });
                        } else {
                            cb(null, player, customAgentCode);
                        }
                    }
                });
            },
            function (player, customAgentCode, cb) {
                console.log('check agentCodeUseUID exist');
                model.settings.find({key: 'agentCodeUseUID'}, 1, function (err, results) {
                    if (err == null && results.length == 1 && results[0].value == '1') {
                        cb(null, player, customAgentCode, true);
                    } else {
                        cb(null, player, customAgentCode, false);
                    }
                });
            },
            function (player, customAgentCode, agentCodeUseUID, cb) { // register
                console.log('register user');
                var newRecord = {};
                var uid = parseInt(userinfo.uid);
                newRecord.uid = uid;
                newRecord.name = player.nickName;
                newRecord.mail = userinfo.mail;
                newRecord.phoneNumber = userinfo.phoneNumber;
                newRecord.password = userinfo.pwd;
                newRecord.initPassword = userinfo.pwd;
                if (customAgentCode)
                    newRecord.agentId = userinfo.agentCode;
                else if (agentCodeUseUID)
                    newRecord.agentId = '' + uid;
                else
                    newRecord.agentId = '' + uid.toString(8);
                console.log(newRecord.agentId);
                if (player.vipLevel == 20) { // 普通代理
                    newRecord.isAgent = 1;
                    newRecord.agentLevel = 3;
                } else if (player.vipLevel == 25) { // 中级代理
                    newRecord.isAgent = 1;
                    newRecord.agentLevel = 2;
                } else if (player.vipLevel == 30) {// 高级代理
                    newRecord.isAgent = 2;
                    newRecord.agentLevel = 1;
                } else if (player.vipLevel == 90) // 合作运营 充卡需从自身扣除
                    newRecord.isAgent = 3;
                else
                    newRecord.isAgent = 5;  // 官方运营

                newRecord.rootAgent = player.rootAgent;
                newRecord.level1Agent = player.level1Uid;
                newRecord.level2Agent = player.level2Uid;
                newRecord.bonusPercent = userinfo.bonusPercent;

                newRecord.extl3Agent = player.extl3Agent;
                newRecord.extl4Agent = player.extl4Agent;
                newRecord.extl5Agent = player.extl5Agent;
                newRecord.extl6Agent = player.extl6Agent;
                newRecord.extl7Agent = player.extl7Agent;
                newRecord.extl8Agent = player.extl8Agent;
                newRecord.extl9Agent = player.extl9Agent;

                model.user.create(newRecord, function (err, results) {
                    if (err != null) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        cb(null, player);
                    }
                });
            },

// function (player, cb) { // remove tmpSubAgent record
//   if (player.level2Uid > 0) {
//     console.log('remove tmpSubAgent record');
//     model.subAgent.find({uid:player.level2Uid, subUid:player.uid}, 1, function(err, results) {
//       if (err == null && results.length > 0) {
//         results[0].remove(function (err) {
//           console.log('failed to remove tmpSubAgent ' + results[0].id, err);
//         })
//       }
//     });
//   }
//   cb(null, null);
// },

            function (user, cb) { // login
                console.log('login user');
                var record = {};
                record.uid = userinfo.uid;
                record.password = userinfo.pwd;
                model.user.find(record, function (err, results) {
                    if (err != null) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        if (results.length > 0) {
                            cb(null, results[0]);
                        } else {
                            cb({code: error.INT_ERROR, msg: '服务器内部错误.'});
                        }
                    }
                });
            },
            function (user, cb) { // 获取房卡数量
                console.log('get gem num');
                var record = {};
                record.uid = userinfo.uid;
                model.player.find(record, function (err, results) {
                    if (err != null) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        if (results.length > 0) {
                            user.gemNum = results[0].gemNum;
                            cb(null, user);
                        } else {
                            cb({code: error.INT_ERROR, msg: '服务器内部错误.'});
                        }
                    }
                });
            },
            function (user, cb) { // 获取可提佣金数量
                console.log('get bonus available');
                var record = {};
                record.uid = user.uid;
                model.user.find(record, function (err, results) {
                    if (err != null) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        if (results.length > 0) {
                            user.bonusAvail = results[0].bonusTotal - results[0].bonusOut;
                            cb(null, user);
                        } else {
                            cb({code: error.INT_ERROR, msg: '服务器内部错误.'});
                        }
                    }
                });
            }
        ], function (err, result) {
            if (err)
                res.status(200).json(err);
            else {
                utils.operateLog(result.uid, '注册&登录');
                res.status(200).json({code: 200, data: result /*session: utils.getSession(result.uid)*/});
            }
        });

    },

//uid: app.user.uid, pid: uid,recommender: app.user.isAgent ? app.user.uid : 0,type:1, audit:$scope.selectLevelInt}
//uid 操作id pid 目标id type 操作类型  0或者不传 表示关闭后台权限 但还是代理可在游戏中赠送钻石 1开通代理  2 为提升，audit 审核代理级别1 高级 2 中级 3 普通  -1 关闭
// 开通代理或调整代理等级
    auditAgent: function (req, res) {
        var userinfo = req.body;
        console.log(userinfo);

        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.player.find({uid: userinfo.uid}, 1, function (err, results) {
                if (err != null || results.length == 0) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {
                    var operator = results[0];
                    model.player.find({uid: parseInt(userinfo.pid)}, 1, function (err, results) {
                        if (err != null || results.length == 0) {
                            res.status(200).json({code: error.DB_ERROR, msg: err});
                        } else {
                            console.log(results[0].vipLevel);

                            var player = results[0];
                            if (player.vipLevel > 100) {
                                res.status(200).json({code: error.INT_ERROR, msg: '禁止调整运营账号权限'});
                                return;
                            }
                            if (operator.vipLevel < player.vipLevel) {
                                res.status(200).json({code: error.INT_ERROR, msg: '不允许调整比自身更高层级的权限'});
                                return;
                            }
                            var getVipLevel = function (agentLevel) {
                                if (agentLevel == 1)
                                    return 30;
                                else if (agentLevel == 2)
                                    return 25;
                                else if (agentLevel == 3)
                                    return 20;
                                else
                                    return 1;
                            };

                            if (userinfo.type == 2) { // 提升代理等级
                                var targetLevel = 20;
                                if (player.vipLevel >= 20)
                                    targetLevel = 25; // 中级
                                if (player.vipLevel >= 25)
                                    targetLevel = 30; // 高级

                                model.user.find({uid: userinfo.pid}, 1, function (err, results) {
                                    if (err != null) {
                                        res.status(200).json({code: error.DB_ERROR, msg: err});
                                    } else {
                                        if (results.length == 0) { // 还未注册
                                            model.subAgent.create({
                                                uid: userinfo.uid,
                                                subUid: userinfo.pid
                                            }, function (err) {
                                                if (err == null) {
                                                    console.log(userinfo.uid + ' recommend agent ' + userinfo.pid, err);
                                                    player.save({vipLevel: targetLevel}, function (err) {
                                                        if (err == null) {
                                                            res.status(200).json({
                                                                code: 200,
                                                                data: 1,
                                                                session: utils.getSession(userinfo.uid)
                                                            });
                                                        } else {
                                                            res.status(200).json({
                                                                code: 200,
                                                                data: 0,
                                                                session: utils.getSession(userinfo.uid)
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    res.status(200).json({
                                                        code: 200,
                                                        data: 0,
                                                        session: utils.getSession(userinfo.uid)
                                                    });
                                                }
                                                utils.operateLog(userinfo.uid, '提升: ' + userinfo.pid + '代理等级');
                                            });
                                        } else { // 已注册
                                            var user = results[0];
                                            console.log(userinfo.uid + ' recommend agent ' + userinfo.pid, err);
                                            player.save({vipLevel: targetLevel}, function (err) {
                                                if (err == null) {
                                                    user.save({
                                                        isAgent: targetLevel == 30 ? 2 : 1,
                                                        agentLevel: targetLevel == 30 ? 1 : 2
                                                    }, function (err) {
                                                        if (err == null) {
                                                            if (targetLevel == 30) { // 高级代理 绑定为其下级各代理的根代理
                                                                sql = "UPDATE qp_backendUser SET rootAgent = ? WHERE level1Agent =? OR level2Agent = ?;";

                                                                model.db.driver.execQuery(
                                                                    sql, [userinfo.pid, userinfo.pid, userinfo.pid], function (err, results) {
                                                                        console.log('change rootAgent', err);
                                                                        res.status(200).json({
                                                                            code: 200,
                                                                            data: 1,
                                                                            session: utils.getSession(userinfo.uid)
                                                                        });
                                                                    });
                                                            } else {
                                                                res.status(200).json({
                                                                    code: 200,
                                                                    data: 1,
                                                                    session: utils.getSession(userinfo.uid)
                                                                });
                                                            }
                                                        } else {
                                                            res.status(200).json({
                                                                code: 200,
                                                                data: 0,
                                                                session: utils.getSession(userinfo.uid)
                                                            });
                                                        }
                                                        utils.operateLog(userinfo.uid, '提升: ' + userinfo.pid + '代理等级');
                                                    });
                                                } else {
                                                    res.status(200).json({code: error.DB_ERROR, msg: err});
                                                }
                                            });
                                        }
                                    }
                                });
                            } else if (userinfo.type == 3) { // 调整到指定代理等级
                                var targetLevel = getVipLevel(userinfo.audit);
                                if (targetLevel == 1)
                                    res.status(200).json({code: error.INT_ERROR, msg: '参数错误'});

                                model.user.find({uid: userinfo.pid}, 1, function (err, results) {
                                    if (err != null) {
                                        res.status(200).json({code: error.DB_ERROR, msg: err});
                                    } else {
                                        if (results.length == 0) { // 还未注册
                                            model.subAgent.create({
                                                uid: userinfo.uid,
                                                subUid: userinfo.pid
                                            }, function (err) {
                                                if (err == null) {
                                                    console.log(userinfo.uid + ' recommend agent ' + userinfo.pid, err);
                                                    player.save({vipLevel: targetLevel}, function (err) {
                                                        if (err == null) {
                                                            res.status(200).json({
                                                                code: 200,
                                                                data: 1,
                                                                session: utils.getSession(userinfo.uid)
                                                            });
                                                        } else {
                                                            res.status(200).json({
                                                                code: 200,
                                                                data: 0,
                                                                session: utils.getSession(userinfo.uid)
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    res.status(200).json({
                                                        code: 200,
                                                        data: 0,
                                                        session: utils.getSession(userinfo.uid)
                                                    });
                                                }
                                                utils.operateLog(userinfo.uid, '调整: ' + userinfo.pid + '代理等级');
                                            });
                                        } else { // 已注册
                                            var user = results[0];
                                            console.log(userinfo.uid + ' adjust agent ' + userinfo.pid, err);
                                            player.save({vipLevel: targetLevel}, function (err) {
                                                if (err == null) {
                                                    user.save({
                                                        isAgent: targetLevel == 30 ? 2 : 1,
                                                        agentLevel: userinfo.audit
                                                    }, function (err) {
                                                        if (err == null) {
                                                            res.status(200).json({
                                                                code: 200,
                                                                data: 1,
                                                                session: utils.getSession(userinfo.uid)
                                                            });
                                                        } else {
                                                            res.status(200).json({
                                                                code: 200,
                                                                data: 0,
                                                                session: utils.getSession(userinfo.uid)
                                                            });
                                                        }
                                                        utils.operateLog(userinfo.uid, '调整: ' + userinfo.pid + '代理等级');
                                                    });
                                                } else {
                                                    res.status(200).json({code: error.DB_ERROR, msg: err});
                                                }
                                            });
                                        }
                                    }
                                });
                            } else { // 开通和关闭代理
                                var targetLevel = getVipLevel(userinfo.audit);

                                if (userinfo.audit >= 1) {
                                    model.user.find({uid: userinfo.uid}, 1, function (err, results) {
                                        if (err != null || results.length == 0) {
                                            res.status(200).json({code: error.DB_ERROR, msg: err});
                                        } else {
                                            // if ((userinfo.recommender == 0 || userinfo.recommender == undefined) && results[0].isAgent == 2)
                                            //   userinfo.recommender = userinfo.uid;

                                            if (/*targetLevel == 11 && */userinfo.recommender > 0) {
                                                model.subAgent.create({
                                                    uid: userinfo.recommender,
                                                    subUid: userinfo.pid
                                                }, function (err) {
                                                    if (err == null) {
                                                        console.log(userinfo.recommender + ' recommend sub agent ' + userinfo.pid, err);
                                                        player.save({vipLevel: targetLevel}, function (err) {
                                                            if (err == null) {
                                                                res.status(200).json({
                                                                    code: 200,
                                                                    data: 1,
                                                                    session: utils.getSession(userinfo.uid)
                                                                });
                                                            } else {
                                                                res.status(200).json({
                                                                    code: 200,
                                                                    data: 0,
                                                                    session: utils.getSession(userinfo.uid)
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        res.status(200).json({
                                                            code: 200,
                                                            data: 0,
                                                            session: utils.getSession(userinfo.uid)
                                                        });
                                                    }
                                                    utils.operateLog(userinfo.uid, '开启: ' + userinfo.pid + '代理权限');
                                                });
                                            } else {
                                                player.save({vipLevel: targetLevel}, function (err) {
                                                    if (err == null) {
                                                        res.status(200).json({
                                                            code: 200,
                                                            data: 1,
                                                            session: utils.getSession(userinfo.uid)
                                                        });
                                                    } else {
                                                        res.status(200).json({
                                                            code: 200,
                                                            data: 0,
                                                            session: utils.getSession(userinfo.uid)
                                                        });
                                                    }
                                                    utils.operateLog(userinfo.uid, '开启: ' + userinfo.pid + '代理权限');
                                                });
                                            }
                                        }
                                    });
                                } else if (userinfo.audit == -1) {
                                    player.save({vipLevel: parseInt(targetLevel - 1)}, function (err) {
                                        if (err == null) {
                                            res.status(200).json({
                                                code: 200,
                                                data: 1,
                                                session: utils.getSession(userinfo.uid)
                                            });
                                        } else {
                                            res.status(200).json({
                                                code: 200,
                                                data: 0,
                                                session: utils.getSession(userinfo.uid)
                                            });
                                        }
                                        utils.operateLog(userinfo.uid, '降低: ' + userinfo.pid + '代理权限');
                                    });
                                }
                            }
                        }
                    });
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 开通代理的下级代理内部方法  已废弃
    addSubAgent: function (req, res) {
        var userinfo = req.body;
        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.player.find({uid: userinfo.pid}, 1, function (err, results) {
                if (err != null) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {
                    console.log(results[0].vipLevel);
                    if (results[0].vipLevel < 11) {
                        results[0].save({vipLevel: 11}, function (err) {
                            if (err == null) {
                                model.subAgent.create({uid: userinfo.uid, subUid: userinfo.pid}, function (err) {
                                    console.log(userinfo.uid + ' add sub agent ' + userinfo.pid, err);
                                });
                                res.status(200).json({code: 200, data: 1, session: utils.getSession(userinfo.uid)});
                            } else {
                                res.status(200).json({code: 200, data: 0, session: utils.getSession(userinfo.uid)});
                            }
                            utils.operateLog(userinfo.uid, '开启: ' + userinfo.pid + '下线代理权限');
                        });
                    }
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 系统充卡或(运营、代理)发卡的内部方法
    _donateCards: function (uid, giveUid, gemNum, rewardNum, payId, callback) {
        var recordExt = {};

        async.waterfall([
            function (cb) { // 获取赠送人信息
                model.player.find({uid: uid}, 1, function (err, results) {
                    if (err != null || results.length == 0) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else if (results.length > 0) {
                        recordExt.user = results[0];
                        console.log('1', recordExt.user.gemNum);
                        cb(null, recordExt);
                    }
                });
            },
            function (recordExt, cb) { // 获取受赠人信息
                model.player.find({uid: giveUid}, 1, function (err, results) {
                    if (err != null || results.length == 0) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else if (results.length > 0) {
                        recordExt.giveUser = results[0];
                        console.log('2', recordExt.giveUser.gemNum);
                        cb(null, recordExt);
                    }
                });
            },
            function (recordExt, cb) { // 查询受赠人是否代理
                model.user.find({uid: giveUid}, 1, function (err, results) {
                    if (err != null || results.length == 0) {
                        cb(null, false, recordExt);
                    } else if (results.length > 0) {
                        cb(null, true, recordExt);
                    }
                });
            },
            function (isAgent, recordExt, cb) { // 赠送
                var _uid = uid;
                // // 如果受赠人是普通玩家 则看其是否绑定了代理邀请码 若已绑定则赠送人就改成代理 如此游戏服才能从代理身上扣除对应卡数
                // if (!isAgent && !!recordExt.giveUser.agentCode && recordExt.giveUser.agentCode.length > 0)
                //   _uid = parseInt(recordExt.giveUser.agentCode, 8);

                utils.postToGameSrv('/gmFangKa', {
                    uid: _uid,
                    giveUid: giveUid,
                    gemNum: gemNum,
                    type: 1
                }, function (err, body) {
                    console.log('donate resp:', err, body);
                    if (err != null) {
                        cb({code: error.GAME_ERROR, msg: err});
                    } else {
                        console.log('3');
                        cb(null, recordExt);
                    }
                });
            },
            function (recordExt, cb) { // 等待5秒
                setTimeout(function () {
                    cb(null, recordExt);
                }, 5000);
            },
            function (recordExt, cb) { // 查询赠送记录
                model.donates.find({
                    uid: uid,
                    giveUid: giveUid,
                    gemNum: gemNum,
                    type: 1
                }, 1, ['id', 'Z'], function (err, results) {
                    console.log('query donate result:', err, results);
                    if (err != null) {
                        utils.operateLog(uid, '查询赠送: ' + giveUid + '钻石: ' + gemNum + ' [数据库错误 不记录房卡变动方便人工对账]');
                        recordExt.result = 2;
                        console.log('4');
                        cb(null, recordExt);
                    } else if (results.length > 0 && results[0].gemNum == gemNum) {
                        utils.operateLog(uid, '赠送: ' + giveUid + '钻石: ' + gemNum);
                        recordExt.id = results[0].id;
                        recordExt.result = 1;
                        console.log('5');
                        cb(null, recordExt);
                    } else {
                        utils.operateLog(uid, '赠送: ' + giveUid + '钻石: ' + gemNum + ' 失败');
                        recordExt.result = 0;
                        console.log('6');
                        cb(null, recordExt);
                    }
                });
            },
            function (recordExt, cb) { // 获取赠送人赠送后信息
                if (recordExt.result == 1) {
                    model.db.driver.execQuery(
                        'select SQL_NO_CACHE * from qp_player where uid=?;', [uid], function (err, results) {
                            if (err != null || results.length == 0) {
                                console.error('db query failed ', err);
                                console.log('7');
                                cb(null, recordExt);
                            } else if (results.length > 0) {
                                recordExt.userNow = results[0];
                                console.log('8', recordExt.userNow.gemNum);
                                cb(null, recordExt);
                            }
                        });
                } else {
                    console.log('9');
                    cb(null, recordExt);
                }
            },
            function (recordExt, cb) { // 获取受赠人受赠后信息
                if (recordExt.result == 1) {
                    model.db.driver.execQuery(
                        'select SQL_NO_CACHE * from qp_player where uid=?;', [giveUid], function (err, results) {
                            if (err != null || results.length == 0) {
                                console.error('db query failed ', err);
                                console.log('10');
                                cb(null, recordExt);
                            } else if (results.length > 0) {
                                recordExt.giveUserNow = results[0];
                                console.log('11', recordExt.giveUserNow.gemNum);
                                cb(null, recordExt);
                            }
                        });
                } else {
                    console.log('12');
                    cb(null, recordExt);
                }
            },
            function (recordExt, cb) { // 保存房卡记录中的额外赠送数
                if (recordExt.result == 1) {
                    model.db.driver.execQuery(
                        'select SQL_NO_CACHE * from qp_player where uid=?;', [giveUid], function (err, results) {
                            if (err != null || results.length == 0) {
                                console.error('db query failed ', err);
                                console.log('10');
                                cb(null, recordExt);
                            } else if (results.length > 0) {
                                recordExt.giveUserNow = results[0];
                                console.log('11', recordExt.giveUserNow.gemNum);
                                cb(null, recordExt);
                            }
                        });
                } else {
                    console.log('12');
                    cb(null, recordExt);
                }
            },
            function (recordExt, cb) { // 记录赠送人房卡变动
                // 记录房卡变动
                if (recordExt.result == 1) {
                    var newRecord = {};
                    newRecord.id = recordExt.id;
                    newRecord.user_origin = recordExt.user.gemNum;
                    newRecord.user_now = (recordExt.userNow != undefined ? recordExt.userNow.gemNum : recordExt.user.gemNum);
                    newRecord.userGive_origin = recordExt.giveUser.gemNum;
                    newRecord.userGive_now = (recordExt.giveUserNow != undefined ? recordExt.giveUserNow.gemNum : recordExt.giveUser.gemNum);
                    newRecord.payId = payId;

                    model.fangkaRecordExt.create(newRecord, function (err, results) {
                        if (err != null) {
                            console.error('add fangkaRecordExt failed ', err);
                        } else {
                            console.log('add fangkaRecordExt success');
                        }
                        console.log('13');
                        cb(null, recordExt);
                    });
                } else {
                    console.log('14');
                    cb(null, recordExt);
                }
            },
            function (recordExt, cb) { // 额外赠送钻石数量保存
                if (recordExt.result == 1 && rewardNum > 0) {
                    model.db.driver.execQuery(
                        'update qp_player set rewardGemNum=? where uid=?;', [recordExt.giveUserNow.rewardGemNum + rewardNum, giveUid], function (err) {
                            if (err != null) {
                                console.error('update rewardNum failed ', err);
                            } else {
                                console.log('update rewardNum success');
                            }
                            cb(null, recordExt);
                        });
                } else {
                    cb(null, recordExt);
                }
            },
            function (recordExt, cb) { // 房卡表额外赠送钻石数量保存
                if (recordExt.result == 1 && rewardNum > 0) {
                    model.db.driver.execQuery(
                        'update qp_fangkarecord set rewardNum=? where id=?;', [rewardNum, recordExt.id], function (err) {
                            if (err != null) {
                                console.error('update rewardNum1 failed ', err);
                            } else {
                                console.log('update rewardNum1 success');
                            }
                            cb(null, recordExt);
                        });
                } else {
                    cb(null, recordExt);
                }
            }
        ], function (err, result) {
            if (err) {
                console.log('_donateCard', err);
                callback(err);
            } else {
                console.log('15');
                callback(null, recordExt);
            }
        });
    },

// 系统充卡的代理佣金分配
    donateBonus: function (userinfo, fkrId, cny) {
        async.waterfall([
            function (cb) { // 查询充值操作是否是运营人员进行的
                model.user.find({uid: userinfo.uid}, 1, function (err, results) {
                    console.log(err, results.length > 0 ? results[0] : '');
                    if (err != null || results.length == 0) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        if (results[0].isAgent >= 3)
                            cb(null);
                        else
                            cb('n/a');
                    }
                });
            },
            function (cb) { // 查询充值提成比例
                model.settings.find({key: 'l1BonusPercent'}, 1, function (err, results) {
                    console.log(err, results.length > 0 ? results[0] : '');
                    if (err != null || results.length == 0) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        cb(null, results[0].value);
                    }
                });
            },
            function (l1Bonus, cb) { // 查询充值提成比例
                model.settings.find({key: 'l2BonusPercent'}, 1, function (err, results) {
                    console.log(err, results.length > 0 ? results[0] : '');
                    if (err != null || results.length == 0) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        cb(null, l1Bonus, results[0].value);
                    }
                });
            },
            function (l1Bonus, l2Bonus, cb) { // 查询充值提成比例
                model.settings.find({key: 'playerBonusPercent'}, 1, function (err, results) {
                    console.log(err, results.length > 0 ? results[0] : '');
                    if (err != null || results.length == 0) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        cb(null, l1Bonus, l2Bonus, results[0].value);
                    }
                });
            },
            function (l1Bonus, l2Bonus, playerBonus, cb) { // 查询是否自定义提成比例
                model.settings.find({key: 'customBonusPercent'}, 1, function (err, results) {
                    console.log(err, results.length > 0 ? results[0] : '');
                    if (err != null || results.length == 0) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        cb(null, l1Bonus, l2Bonus, playerBonus, results[0].value);
                    }
                });
            },
            function (l1Bonus, l2Bonus, playerBonus, customPercent, cb) { // 查询是否开启10级代理
                model.settings.find({key: 'use10AgentLevel'}, 1, function (err, results) {
                    console.log(err, results.length > 0 ? results[0] : '');
                    if (err != null) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        cb(null, l1Bonus, l2Bonus, playerBonus, customPercent, results.length > 0 ? results[0].value : 0);
                    }
                });
            },
            function (l1Bonus, l2Bonus, playerBonus, customPercent, uselv10, cb) { // 查询被充值账号信息
                model.player.find({uid: userinfo.pid}, function (err, results) {
                    console.log(err, results.length > 0 ? results[0] : '');
                    if (err != null || results.length == 0) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        if (results[0].agentCode == '' || results[0].agentCode == '0')
                            cb('n/a');
                        else {
                            model.user.find({agentId: results[0].agentCode}, function (err, results) {
                                console.log(err, results.length > 0 ? results[0] : '');
                                if (err != null || results.length == 0) {
                                    cb({code: error.DB_ERROR, msg: err});
                                } else {
                                    var playerAgent = results[0];
                                    var level1Agent = 0, level2Agent = 0;

                                    model.user.find({or: [{uid: playerAgent.level1Agent}, {uid: playerAgent.level2Agent}]}, function (err, results) {
                                        console.log(err, results.length);
                                        if (err != null) {
                                            cb({code: error.DB_ERROR, msg: err});
                                        } else {
                                            if (customPercent == 1) {
                                                playerBonus = playerAgent.bonusPercent;
                                                if (results.length > 0 && results[0].uid == playerAgent.level2Agent) {
                                                    l2Bonus = results[0].bonusPercent;
                                                    level2Agent = results[0].uid;
                                                }
                                                if (results.length > 1 && results[1].uid == playerAgent.level2Agent) {
                                                    l2Bonus = results[1].bonusPercent;
                                                    level2Agent = results[1].uid;
                                                }
                                                if (results.length > 0 && results[0].uid == playerAgent.level1Agent) {
                                                    l1Bonus = results[0].bonusPercent;
                                                    level1Agent = results[0].uid;
                                                }
                                                if (results.length > 1 && results[1].uid == playerAgent.level1Agent) {
                                                    l1Bonus = results[1].bonusPercent;
                                                    level1Agent = results[1].uid;
                                                }

                                                if (uselv10 == 1) {
                                                    // 再扩展7层代理佣金
                                                    model.user.find({
                                                        or: [
                                                            {uid: playerAgent.extl3Agent}, {uid: playerAgent.extl4Agent},
                                                            {uid: playerAgent.extl5Agent}, {uid: playerAgent.extl6Agent},
                                                            {uid: playerAgent.extl7Agent}, {uid: playerAgent.extl8Agent},
                                                            {uid: playerAgent.extl9Agent}
                                                        ]
                                                    }, function (err, results) {
                                                        console.log(err, 'lv10Num:' + results.length);
                                                        if (err != null) {
                                                            cb({code: error.DB_ERROR, msg: err});
                                                        } else {
                                                            var extBonus = {};
                                                            var extl3Bonus = 0, extl4Bonus = 0, extl5Bonus = 0,
                                                                extl6Bonus = 0, extl7Bonus = 0, extl8Bonus = 0,
                                                                extl9Bonus = 0;
                                                            var extl3Agent = 0, extl4Agent = 0, extl5Agent = 0,
                                                                extl6Agent = 0, extl7Agent = 0, extl8Agent = 0,
                                                                extl9Agent = 0;
                                                            for (var i = 0; i < results.length; i++) {
                                                                console.log(results[i], playerAgent);
                                                                if (results[i].uid == playerAgent.extl3Agent) {
                                                                    extl3Bonus = results[i].bonusPercent;
                                                                    extl3Agent = results[i].uid;
                                                                }
                                                                else if (results[i].uid == playerAgent.extl4Agent) {
                                                                    extl4Bonus = results[i].bonusPercent;
                                                                    extl4Agent = results[i].uid;
                                                                }
                                                                else if (results[i].uid == playerAgent.extl5Agent) {
                                                                    extl5Bonus = results[i].bonusPercent;
                                                                    extl5Agent = results[i].uid;
                                                                }
                                                                else if (results[i].uid == playerAgent.extl6Agent) {
                                                                    extl6Bonus = results[i].bonusPercent;
                                                                    extl6Agent = results[i].uid;
                                                                }
                                                                else if (results[i].uid == playerAgent.extl7Agent) {
                                                                    extl7Bonus = results[i].bonusPercent;
                                                                    extl7Agent = results[i].uid;
                                                                }
                                                                else if (results[i].uid == playerAgent.extl8Agent) {
                                                                    extl8Bonus = results[i].bonusPercent;
                                                                    extl8Agent = results[i].uid;
                                                                }
                                                                else if (results[i].uid == playerAgent.extl9Agent) {
                                                                    extl9Bonus = results[i].bonusPercent;
                                                                    extl9Agent = results[i].uid;
                                                                }
                                                            }

                                                            if (extl9Bonus > extl8Bonus)
                                                                extl9Bonus = extl9Bonus - extl8Bonus;
                                                            else
                                                                extl9Bonus = 0;
                                                            if (extl9Agent > 0)
                                                                extBonus['extl9'] = {
                                                                    agent: extl9Agent,
                                                                    bonus: extl9Bonus
                                                                };

                                                            if (extl8Bonus > extl7Bonus)
                                                                extl8Bonus = extl8Bonus - extl7Bonus;
                                                            else
                                                                extl8Bonus = 0;
                                                            if (extl8Agent > 0)
                                                                extBonus['extl8'] = {
                                                                    agent: extl8Agent,
                                                                    bonus: extl8Bonus
                                                                };

                                                            if (extl7Bonus > extl6Bonus)
                                                                extl7Bonus = extl7Bonus - extl6Bonus;
                                                            else
                                                                extl7Bonus = 0;
                                                            if (extl7Agent > 0)
                                                                extBonus['extl7'] = {
                                                                    agent: extl7Agent,
                                                                    bonus: extl7Bonus
                                                                };

                                                            if (extl6Bonus > extl5Bonus)
                                                                extl6Bonus = extl6Bonus - extl5Bonus;
                                                            else
                                                                extl6Bonus = 0;
                                                            if (extl6Agent > 0)
                                                                extBonus['extl6'] = {
                                                                    agent: extl6Agent,
                                                                    bonus: extl6Bonus
                                                                };

                                                            if (extl5Bonus > extl4Bonus)
                                                                extl5Bonus = extl5Bonus - extl4Bonus;
                                                            else
                                                                extl5Bonus = 0;
                                                            if (extl5Agent > 0)
                                                                extBonus['extl5'] = {
                                                                    agent: extl5Agent,
                                                                    bonus: extl5Bonus
                                                                };

                                                            if (extl4Bonus > extl3Bonus)
                                                                extl4Bonus = extl4Bonus - extl3Bonus;
                                                            else
                                                                extl4Bonus = 0;
                                                            if (extl4Agent > 0)
                                                                extBonus['extl4'] = {
                                                                    agent: extl4Agent,
                                                                    bonus: extl4Bonus
                                                                };

                                                            if (extl3Bonus > l1Bonus)
                                                                extl3Bonus = extl3Bonus - l1Bonus;
                                                            else
                                                                extl3Bonus = 0;
                                                            if (extl3Agent > 0)
                                                                extBonus['extl3'] = {
                                                                    agent: extl3Agent,
                                                                    bonus: extl3Bonus
                                                                };

                                                            console.log(extBonus);

                                                            if (l1Bonus > l2Bonus)
                                                                l1Bonus = l1Bonus - l2Bonus;
                                                            else
                                                                l1Bonus = 0;

                                                            if (l2Bonus > playerBonus)
                                                                l2Bonus = l2Bonus - playerBonus;
                                                            else
                                                                l2Bonus = 0;

                                                            console.log(l2Bonus, l1Bonus);

                                                            cb(null, playerAgent, level1Agent, level2Agent, l1Bonus, l2Bonus, playerBonus, extBonus);
                                                        }
                                                    });
                                                } else {
                                                    cb(null, playerAgent, level1Agent, level2Agent, l1Bonus, l2Bonus, playerBonus, null);
                                                }
                                            } else {
                                                if (results.length > 0 && results[0].uid == playerAgent.level2Agent) {
                                                    level2Agent = results[0].uid;
                                                }
                                                if (results.length > 1 && results[1].uid == playerAgent.level2Agent) {
                                                    level2Agent = results[1].uid;
                                                }
                                                if (results.length > 0 && results[0].uid == playerAgent.level1Agent) {
                                                    level1Agent = results[0].uid;
                                                }
                                                if (results.length > 1 && results[1].uid == playerAgent.level1Agent) {
                                                    level1Agent = results[1].uid;
                                                }

                                                if (playerAgent.agentLevel >= 3) {
                                                    playerBonus = playerBonus.split('|')[0];
                                                    l2Bonus = l2Bonus.split('|')[0];
                                                    l1Bonus = l1Bonus.split('|')[0];
                                                } else if (playerAgent.agentLevel == 2) {
                                                    playerBonus = playerBonus.split('|')[1];
                                                    l2Bonus = l2Bonus.split('|')[1];
                                                    l1Bonus = 0;
                                                } else {
                                                    playerBonus = playerBonus.split('|')[2];
                                                    l2Bonus = 0;
                                                    l1Bonus = 0;
                                                }
                                                cb(null, playerAgent, level1Agent, level2Agent, l1Bonus, l2Bonus, playerBonus, null);
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            },
            function (playerAgent, l1Agent, l2Agent, l1Bonus, l2Bonus, playerBonus, extBonus, cb) {
                console.log('create bonus', l1Bonus, l2Bonus, playerBonus);

                var level1Agent = l1Agent, level2Agent = l2Agent;

                if (extBonus == null) { // 正常三层代理
                    model.bonusIn.create({
                        fkrId: fkrId,
                        l1Agent: level1Agent,
                        l1Bonus: (level1Agent == 0 ? 0.0 : cny * l1Bonus / 100.0),
                        l2Agent: level2Agent,
                        l2Bonus: (level2Agent == 0 ? 0.0 : cny * l2Bonus / 100.0),
                        playerAgent: playerAgent.uid,
                        playerBonus: cny * playerBonus / 100.0
                    }, function (err) {
                        console.log('create bonusIn', err);
                        cb(null, level1Agent, cny * l1Bonus / 100.0,
                            level2Agent, cny * l2Bonus / 100.0, playerAgent.uid, cny * playerBonus / 100.0);
                    });
                } else {  // 十层代理
                    model.bonusIn.create({
                        fkrId: fkrId,
                        l1Agent: level1Agent,
                        l1Bonus: (level1Agent == 0 ? 0.0 : cny * l1Bonus / 100.0),
                        l2Agent: level2Agent,
                        l2Bonus: (level2Agent == 0 ? 0.0 : cny * l2Bonus / 100.0),
                        playerAgent: playerAgent.uid,
                        playerBonus: cny * playerBonus / 100.0,
                        extl3Agent: extBonus['extl3'] != undefined ? extBonus['extl3'].agent : 0,
                        extl3Bonus: extBonus['extl3'] != undefined ? extBonus['extl3'].bonus * cny / 100.0 : 0.0,
                        extl4Agent: extBonus['extl4'] != undefined ? extBonus['extl4'].agent : 0,
                        extl4Bonus: extBonus['extl4'] != undefined ? extBonus['extl4'].bonus * cny / 100.0 : 0.0,
                        extl5Agent: extBonus['extl5'] != undefined ? extBonus['extl5'].agent : 0,
                        extl5Bonus: extBonus['extl5'] != undefined ? extBonus['extl5'].bonus * cny / 100.0 : 0.0,
                        extl6Agent: extBonus['extl6'] != undefined ? extBonus['extl6'].agent : 0,
                        extl6Bonus: extBonus['extl6'] != undefined ? extBonus['extl6'].bonus * cny / 100.0 : 0.0,
                        extl7Agent: extBonus['extl7'] != undefined ? extBonus['extl7'].agent : 0,
                        extl7Bonus: extBonus['extl7'] != undefined ? extBonus['extl7'].bonus * cny / 100.0 : 0.0,
                        extl8Agent: extBonus['extl8'] != undefined ? extBonus['extl8'].agent : 0,
                        extl8Bonus: extBonus['extl8'] != undefined ? extBonus['extl8'].bonus * cny / 100.0 : 0.0,
                        extl9Agent: extBonus['extl9'] != undefined ? extBonus['extl9'].agent : 0,
                        extl9Bonus: extBonus['extl9'] != undefined ? extBonus['extl9'].bonus * cny / 100.0 : 0.0
                    }, function (err) {
                        console.log('create bonusIn', err);

                        var agts = Object.keys(extBonus);
                        for (var i = 0; i < agts.length; i++) {
                            var agent = extBonus[agts[i]];
                            model.user.find({uid: agent.agent}, function (err, results) {
                                if (err == null && results.length > 0) {
                                    results[0].save({bonusTotal: results[0].bonusTotal + (agent.bonus * cny / 100.0)}, function (err) {
                                        console.log('add ' + agts[i] + 'bonus:', err, agent.agent, results[0].bonusTotal + (agent.bonus * cny / 100.0));
                                    });
                                }
                            });
                        }

                        cb(null, level1Agent, cny * l1Bonus / 100.0,
                            level2Agent, cny * l2Bonus / 100.0, playerAgent.uid, cny * playerBonus / 100.0);
                    });
                }

            },
            function (l1Agent, l1Bonus, l2Agent, l2Bonus, playerAgent, playerBonus, cb) {
                console.log('calc bonus to agent user');

                if (l1Agent != 0 && l1Bonus != 0) {
                    model.user.find({uid: l1Agent}, function (err, results) {
                        if (err != null || results.length == 0) {
                            cb({code: error.DB_ERROR, msg: err});
                        } else {
                            results[0].save({bonusTotal: results[0].bonusTotal + l1Bonus}, function (err) {
                                console.log('add l1AgentBonus', err, results[0].bonusTotal + l1Bonus);
                                cb(err, l1Agent, l1Bonus, l2Agent, l2Bonus, playerAgent, playerBonus);
                            });
                        }
                    });
                } else {
                    cb(null, l1Agent, l1Bonus, l2Agent, l2Bonus, playerAgent, playerBonus);
                }
            },
            function (l1Agent, l1Bonus, l2Agent, l2Bonus, playerAgent, playerBonus, cb) {
                console.log('calc bonus to agent user');

                if (l2Agent != 0 && l2Bonus != 0) {
                    model.user.find({uid: l2Agent}, function (err, results) {
                        if (err != null || results.length == 0) {
                            cb({code: error.DB_ERROR, msg: err});
                        } else {
                            results[0].save({bonusTotal: results[0].bonusTotal + l2Bonus}, function (err) {
                                console.log('add l2AgentBonus', err, results[0].bonusTotal + l2Bonus);
                                cb(err, l1Agent, l1Bonus, l2Agent, l2Bonus, playerAgent, playerBonus);
                            });
                        }
                    });
                } else {
                    cb(null, l1Agent, l1Bonus, l2Agent, l2Bonus, playerAgent, playerBonus);
                }
            },
            function (l1Agent, l1Bonus, l2Agent, l2Bonus, playerAgent, playerBonus, cb) {
                console.log('calc bonus to agent user');

                if (playerAgent != 0 && playerBonus != 0) {
                    model.user.find({uid: playerAgent}, function (err, results) {
                        if (err != null || results.length == 0) {
                            cb({code: error.DB_ERROR, msg: err});
                        } else {
                            results[0].save({bonusTotal: results[0].bonusTotal + playerBonus}, function (err) {
                                console.log('add playerAgentBonus', err, results[0].bonusTotal + playerBonus);
                                cb(err);
                            });
                        }
                    });
                } else {
                    cb(null);
                }
            }
        ], function (err) {
            if (err) {
                if (err == 'n/a')
                    utils.operateLog(userinfo.uid, '代理自己发钻不给佣金 ' + userinfo.pid);
                else
                    utils.operateLog(userinfo.uid, err + ' ' + userinfo.pid);
            } else {
                utils.operateLog(userinfo.uid, '代理充值返佣 ' + userinfo.pid);
            }
        });
    },

// 系统充卡或(运营、代理)发卡
    donateCards: function (req, res) {
        var userinfo = req.body;
        async.waterfall([
                //进行session验证
                function (cb) {
                    //判断是否过期
                    if (!(utils.checkSession(userinfo.uid, userinfo.session))) {
                        cb({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
                        return;
                    }
                    //判断是否给自己加钻
                    if (userinfo.uid == userinfo.pid) {
                        cb({code: error.INT_ERROR, msg: '不能给自己加钻!'});
                        return;
                    }
                    cb(null);
                },
                //十三水规则 判断是否符合规则(钻石需要1000起送 送完库存也不能少于1000钻.送钻数为10的倍数,到客户手上只有90%)
                function (cb) {
                    if ((userinfo.gameType !== null || userinfo.gameType !== underfined) && userinfo.gameType === 'yjsss') {
                        console.log('in yjsss');
                        //查询用户钻石数量
                        model.player.find({uid: userinfo.uid}, 1, function (err, results) {
                            if (err) {
                                cb({code: error.DB_ERROR, msg: err});
                                return;
                            }
                            if (results[0].gemNum - userinfo.gem < 1000 || userinfo.gem < 1000 || userinfo.gem % 10 != 0) {
                                cb({code: error.INT_ERROR, msg: '赠送钻石数量不符合规则'});
                                return;
                            }
                            //手续费
                            userinfo.charges = userinfo.gem * 0.1;
                            //实际充值数量
                            userinfo.gem = userinfo.gem * 0.9;
                            cb(null, userinfo);
                        });
                    }
                    cb(null,userinfo);
                },
                //执行操作 扣款
                function (userinfo, cb) {
                    user._donateCards(userinfo.uid, userinfo.pid, userinfo.gem, 0, 0, function (err, result) {
                        if (err != null) {
                            cb({code: error.DB_ERROR, msg: err});
                            return;
                        }
                        //发配佣金
                        user.donateBonus(userinfo, result.id, 0);
                        cb(null, userinfo, {code: 200, data: result.result, session: utils.getSession(userinfo.uid)});
                    });
                },
                //扣除手续费
                function (userinfo, donateCardsRes, cb) {
                    //判断是否有手续费
                    /*if (userinfo.charges !== null || userinfo.charges !== underfined) {
                        model.db.driver.execQuery(
                            'update `qp_player` set `gemNum` = `gemNum` - ? where uid = ?;', [userinfo.charges, userinfo.uid], function (err, results) {
                                if (err) {
                                    cb({code: error.DB_ERROR, msg: err});
                                    return;
                                }
                                //运营日志
                                utils.operateLog(10000, '运营扣除手续费:' + userinfo.uid + '金额:' + userinfo.charges);
                            });
                    }*/
                    cb(null, donateCardsRes)
                },
            ], function
                (err, donateCardsRes) {
                if (err) {
                    res.status(200).json(err);
                } else {
                    res.status(200).json(donateCardsRes);
                }
            }
        );
    },

// 发布通知
    sendNotice: function (req, res) {
        var userinfo = req.body;
        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.notice.create({
                type: userinfo.type,
                contents: userinfo.contents,
                uid: userinfo.uid,
                title: userinfo.title,
                createdtime: Date.now(),
                startTime: userinfo.startTime,
                endTime: userinfo.endTime,
                intervalTime: userinfo.intervalTime,
            }, function (err) {
                console.log('sendNotice', err);
                if (err != null)
                    res.status(200).json({code: 200, data: 0, session: utils.getSession(userinfo.uid)});
                else {
                    utils.operateLog(userinfo.uid, '发送通知:' + userinfo.contents);
                    //跑马灯
                    if (userinfo.type == 10 || userinfo.type == 11 || userinfo.type == 12) {
                        //判断是否为紧急公告   如果是 对于
                        if (userinfo.type == 10 && (userinfo.times < 0 || userinfo.times > 45)) {
                            userinfo.times = 1;
                        }
                        utils.postToGameSrv('/gmNotifyMsg', {
                            uid: userinfo.uid,
                            type: userinfo.type,
                            contents: userinfo.contents,
                            startTime: userinfo.startTime,
                            endTime: userinfo.endTime,
                            intervalTIme: userinfo.intervalTime,
                            times: userinfo.times
                        }, function (err, body) {
                            console.log(err, body);
                            if (err != null) {
                                res.status(200).json({code: error.GAME_ERROR, msg: err});
                            } else {
                                res.status(200).json({code: 200, data: 1, session: utils.getSession(userinfo.uid)});
                            }
                        });
                    }
                    else
                        res.status(200).json({code: 200, data: 1, session: utils.getSession(userinfo.uid)});
                }
            });

        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 删除通知
    deleteNotice: function (req, res) {
        var userinfo = req.body;
        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.notice.find({id: userinfo.id}, function (err, results) {
                console.log('deleteNotice', err);
                if (err != null)
                    res.status(200).json({code: error.GAME_ERROR, msg: err});
                else {
                    if (results.length > 0) {
                        // if (results[0].type == 0) {
                        //   utils.postToGameSrv('/gmNotifyMsg', {contents: ''}, function (err, body) {
                        //     console.log(err, body);
                        //   });
                        // }

                        utils.operateLog(userinfo.uid, '删除通知:' + results[0].content);

                        results[0].remove(function (err) {
                            if (err == null) {
                                res.status(200).json({code: 200, data: 1, session: utils.getSession(userinfo.uid)});
                            }
                            else
                                res.status(200).json({code: error.GAME_ERROR, msg: err});
                        });
                    } else
                        res.status(200).json({code: 200, data: 0, session: utils.getSession(userinfo.uid)});
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 查询发钻记录或充钻记录
    donates: function (req, res) {
        var userinfo = req.body;
        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            var cond = {};
            var sql = '';
            if (userinfo.type == 0)
                sql = "SELECT * FROM qp_fangkaRecord as a LEFT JOIN qp_fangkaRecordExt as b ON a.id = b.id WHERE uid=? order by a.id desc limit 200;";
            else
                sql = "SELECT * FROM qp_fangkaRecord as a LEFT JOIN qp_fangkaRecordExt as b ON a.id = b.id WHERE giveUid=? order by a.id desc limit 200;";

            model.db.driver.execQuery(
                sql, [userinfo.pid], function (err, results) {
                    console.log('donates', err);
                    if (err != null)
                        res.status(200).json({code: error.DB_ERROR, msg: err});
                    else {
                        res.status(200).json({code: 200, data: results, session: utils.getSession(userinfo.uid)});
                    }
                });

// model.donates.find(cond, 100, ['id','Z'], function (err, results) {
//   console.log('donates', err);
//   if (err != null)
//     res.status(200).json({code: error.DB_ERROR, msg: err});
//   else {
//     res.status(200).json({code: 200, data: results, session: utils.getSession(userinfo.uid)});
//   }
// });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 查询发钻记录或充钻记录
    donates_v2: function (req, res) {
        var info = req.body;

        if (!utils.verifySign(info, utils.getKey())) {
            res.status(200).json({code: error.SIGN_ERROR, msg: '安全验证失败!'});
            return;
        }

        if (utils.checkSession(info.uid, info.session)) {
            var pageId = info.pageId == undefined ? 0 : info.pageId;
            var pageSize = info.pageSize == undefined ? 100 : info.pageSize;

            console.log(info, pageId);

            var between_time = " AND a.recordTime >= \'" + info.begin + " 00:00:00\' AND a.recordTime < \'" + info.end + " 23:59:59\' ";

            var cond = {};
            var sql = '';
            if (info.pid == undefined || info.pid.length == 0) {
                sql = "select count(*) as num FROM (SELECT giveUid, date_format(recordTime, '%Y-%m-%d') as createTime FROM qp_fangkaRecord as a LEFT JOIN qp_fangkaRecordExt as b ON a.id = b.id WHERE uid=100000 ";
                sql += between_time + ' GROUP BY giveUid, createTime ORDER BY recordTime) as a';

                model.db.driver.execQuery(
                    sql, function (err, results) {
                        console.log('donates', err);
                        if (err != null)
                            res.status(200).json({code: error.DB_ERROR, msg: err});
                        else {
                            var num = results.length > 0 ? results[0].num : 0;

                            sql = "SELECT giveUid, giveUserName, sum(gemNum) as gemNum, date_format(recordTime, '%Y-%m-%d') as createTime FROM qp_fangkaRecord as a LEFT JOIN qp_fangkaRecordExt as b ON a.id = b.id WHERE uid=100000 ";
                            sql += between_time + ' GROUP BY giveUid, createTime ORDER BY recordTime limit ' + pageSize + ' offset ' + (pageId * pageSize);

                            model.db.driver.execQuery(
                                sql, function (err, results) {
                                    console.log('donates 2', err);
                                    if (err != null)
                                        res.status(200).json({code: error.DB_ERROR, msg: err});
                                    else {
                                        var page = {id: pageId, num: Math.ceil(num / pageSize)};
                                        res.status(200).json({
                                            code: 200,
                                            data: results,
                                            page: page,
                                            session: utils.getSession(info.uid)
                                        });
                                    }
                                });
                        }
                    });

            } else {
                sql = "select count(*) as num FROM (SELECT giveUid, date_format(recordTime, '%Y-%m-%d') as createTime FROM qp_fangkaRecord as a LEFT JOIN qp_fangkaRecordExt as b ON a.id = b.id WHERE uid=100000 AND giveUid=? ";
                sql += between_time + ' GROUP BY giveUid, createTime ORDER BY recordTime) as a';

                model.db.driver.execQuery(
                    sql, [info.pid], function (err, results) {
                        console.log('donates', err);
                        if (err != null)
                            res.status(200).json({code: error.DB_ERROR, msg: err});
                        else {
                            var num = results.length > 0 ? results[0].num : 0;

                            sql = "SELECT giveUid, giveUserName, sum(gemNum) as gemNum, date_format(recordTime, '%Y-%m-%d') as createTime FROM qp_fangkaRecord as a LEFT JOIN qp_fangkaRecordExt as b ON a.id = b.id WHERE uid=100000 AND giveUid=? ";
                            sql += between_time + ' GROUP BY giveUid, createTime ORDER BY recordTime limit ' + pageSize + ' offset ' + (pageId * pageSize);

                            model.db.driver.execQuery(
                                sql, [info.pid], function (err, results) {
                                    console.log('donates 2', err);
                                    if (err != null)
                                        res.status(200).json({code: error.DB_ERROR, msg: err});
                                    else {
                                        var page = {id: pageId, num: Math.ceil(num / pageSize)};
                                        res.status(200).json({
                                            code: 200,
                                            data: results,
                                            page: page,
                                            session: utils.getSession(info.uid)
                                        });
                                    }
                                });
                        }
                    });
            }
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 获取指定代理的下级代理
    agents: function (req, res) {
        var userinfo = req.body;

        if (utils.checkSession(userinfo.uid, userinfo.session)) {

            model.user.find({or: [{level1Agent: userinfo.pid}, {level2Agent: userinfo.pid}]}, function (err, results) {
                console.log('agents', err, results);
                if (err != null)
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                else {
                    var from = moment().startOf('month').format("YYYY-MM-DD") + " 00:00:00";
                    var to = moment().endOf('month').format("YYYY-MM-DD") + " 23:59:59";

                    var queries = [];
                    var j = 0;
                    for (var r in results) {
                        queries.push(function (cb) {
                            var uid = results[j++].uid;
                            console.log('agent: ', uid);
                            // var sql = "SELECT SUM(gemNum) as charge, giveUid FROM qp_fangkaRecord as a LEFT JOIN qp_fangkaRecordExt as b ON a.id = b.id WHERE a.giveUid=? AND a.uid!=? " +
                            //   "AND a.recordTime >= ? AND a.recordTime <= ?";
                            // console.log(sql);
                            // model.db.driver.execQuery(
                            //   sql, [uid, userinfo.pid, from, to], function (err, data) {
                            //     console.log('agent charge:', err, data);
                            //     if (err != null)
                            //       cb(error.DB_ERROR, null, null);
                            //     else {
                            //       sql = "SELECT SUM(gemNum) as used FROM qp_fangkaRecord as a LEFT JOIN qp_fangkaRecordExt as b ON a.id = b.id WHERE uid= ? " +
                            //         "AND a.recordTime >= ? AND a.recordTime <= ?";
                            //       console.log(sql, uid);
                            //       model.db.driver.execQuery(
                            //         sql, [uid, from, to], function (err, data1) {
                            //           console.log('agent used:', err, data1);
                            //           if (err != null)
                            //             cb(error.DB_ERROR, null);
                            //           else {
                            sql = "SELECT SUM(l1Bonus) as bonus FROM qp_fangkaBonusIn as a, qp_fangkaRecord as b WHERE a.fkrId = b.id AND l1Agent= ? " +
                                "AND a.createTime >= ? AND a.createTime <= ?";
                            console.log(sql, userinfo.pid);
                            model.db.driver.execQuery(
                                sql, [uid, from, to], function (err, data2) {
                                    console.log('agent l1bonus:', err, data2);
                                    if (err != null)
                                        cb(error.DB_ERROR, null);
                                    else {
                                        sql = "SELECT SUM(l2Bonus) as bonus FROM qp_fangkaBonusIn as a, qp_fangkaRecord as b WHERE a.fkrId = b.id AND l2Agent= ? " +
                                            "AND a.createTime >= ? AND a.createTime <= ?";
                                        console.log(sql, userinfo.pid);
                                        model.db.driver.execQuery(
                                            sql, [uid, from, to], function (err, data3) {
                                                console.log('agent l2bonus:', err, data3);
                                                if (err != null)
                                                    cb(error.DB_ERROR, null);
                                                else {
                                                    sql = "SELECT SUM(playerBonus) as bonus FROM qp_fangkaBonusIn as a, qp_fangkaRecord as b WHERE a.fkrId = b.id AND playerAgent= ? AND " +
                                                        "a.createTime >= ? AND a.createTime <= ?";
                                                    console.log(sql, userinfo.pid);
                                                    model.db.driver.execQuery(
                                                        sql, [uid, from, to], function (err, data4) {
                                                            console.log('agent playerBonus:', err, data4);
                                                            if (err != null)
                                                                cb(error.DB_ERROR, null);
                                                            else {
                                                                cb(null, data2[0].bonus, data3[0].bonus, data4[0].bonus);
                                                            }
                                                        });
                                                }
                                            });
                                    }
                                });
                            // }
                        });
                    }
                    //     });
                    // });
                    // }
                    // }

                    async.parallel(queries,
                        function (err, results1) {
                            if (err == null) {
                                for (var i = 0; i < results1.length; i++) {
                                    results[i].monthL1Bonus = results1[i][0] == null ? 0 : results1[i][0];
                                    results[i].monthL2Bonus = results1[i][1] == null ? 0 : results1[i][1];
                                    results[i].monthPlayerBonus = results1[i][2] == null ? 0 : results1[i][2];

                                    console.log(results[i]);
                                }
                            }
                            res.status(200).json({code: 200, data: results, session: utils.getSession(userinfo.uid)});
                        });
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 修改密码
    changePwd: function (req, res) {
        var userinfo = req.body;
        if (utils.checkSession(userinfo.uid, userinfo.session)) {

            model.user.find({uid: userinfo.uid}, function (err, results) {
                if (err != null || results.length == 0) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {
                    if (results[0].password != userinfo.oldpwd) {
                        res.status(200).json({code: 200, data: 0, session: utils.getSession(userinfo.uid)});
                    } else {
                        results[0].save({password: userinfo.newpwd}, function (err) {
                            if (err == null) {
                                res.status(200).json({code: 200, data: 1, session: utils.getSession(userinfo.uid)});
                            } else {
                                res.status(200).json({code: 200, data: 0, session: utils.getSession(userinfo.uid)});
                            }
                            utils.operateLog(userinfo.uid, '修改密码');
                        });
                    }
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 运营手工调整代理上下级关系   已废弃
    bindAgent: function (req, res) {
        var userinfo = req.body;
        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.user.find({uid: userinfo.pid}, 1, function (err, results) {
                if (err != null) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else if (userinfo.recommender > 0) {
                    if (results.length == 0) { // 该代理还未注册账号 则记录在代理临时关联表中
                        model.subAgent.create({uid: userinfo.recommender, subUid: userinfo.pid}, function (err) {
                            if (err != null) {
                                console.log(userinfo.recommender + ' recommend sub agent ' + userinfo.pid, err);
                                res.status(200).json({code: 200, data: 0, session: utils.getSession(userinfo.uid)});
                            } else {
                                res.status(200).json({code: 200, data: 1, session: utils.getSession(userinfo.uid)});
                            }
                            utils.operateLog(userinfo.uid, '绑定' + userinfo.pid + '上级代理');
                        });
                    } else { // 已经有代理账号
                        var user = results[0];
                        var level2Agent = userinfo.recommender;
                        var level1Agent = 0;
                        var rootAgent = 0;

                        model.user.find({uid: userinfo.recommender}, 1, function (err, results) {
                            if (err == null) {
                                if (results.length > 0) {
                                    level1Agent = results[0].level2Agent;
                                    if (results[0].isAgent == 2)
                                        rootAgent = results[0].uid;
                                    else
                                        rootAgent = results[0].rootAgent;
                                }

                                user.save({
                                    level1Agent: level1Agent,
                                    level2Agent: level2Agent,
                                    rootAgent: rootAgent
                                }, function (err) {
                                    if (err == null) {
                                        res.status(200).json({
                                            code: 200,
                                            data: 1,
                                            session: utils.getSession(userinfo.uid)
                                        });
                                    } else {
                                        res.status(200).json({
                                            code: 200,
                                            data: 0,
                                            session: utils.getSession(userinfo.uid)
                                        });
                                    }
                                });
                            } else {
                                res.status(200).json({code: 200, data: 0, session: utils.getSession(userinfo.uid)});
                            }

                            utils.operateLog(userinfo.uid, '绑定' + userinfo.pid + '上级代理');
                        });
                    }
                } else {
                    res.status(200).json({code: 200, data: 0, session: utils.getSession(userinfo.uid)});
                    utils.operateLog(userinfo.uid, '绑定' + userinfo.pid + '上级代理');
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 玩家通过邀请码绑定代理
    bind: function (req, res) {
        var userinfo = req.body;

        model.user.find({agentId: userinfo.inviteCode}, 1, function (err, results) {
            if (err != null) {
                res.status(200).json({code: error.DB_ERROR, msg: err});
            } else {
                if (results.length == 0) { // 该代理不存在 说明邀请码错误
                    res.status(200).json({code: error.INT_ERROR, msg: '邀请码错误!'});
                } else {
                    var agent = results[0];
                    model.player.find({uid: userinfo.uid}, 1, function (err, results) {
                        if (err == null) {
                            if (results.length == 0) {
                                res.status(200).json({code: error.INT_ERROR, msg: '玩家账号不存在!'});
                            } else if (userinfo.allowChange == undefined && results[0].agentCode != null && results[0].agentCode.length > 1) {
                                res.status(200).json({code: 1000, msg: '玩家已经绑定过邀请码!'});
                            } else {
                                results[0].save({
                                    agentCode: userinfo.inviteCode,
                                    rootAgent: agent.rootAgent
                                }, function (err) {
                                    if (err == null) {
                                        res.status(200).json({code: 200, data: 1});
                                        utils.operateLog(userinfo.uid, '玩家绑定' + agent.uid + '为代理');

                                        if (results[0].agentCode == null || results[0].agentCode.length <= 1) {
                                            // 赠送钻石
                                            model.settings.find({key: 'bindAgentReward'}, 1, function (err, results) {
                                                if (err == null && results.length > 0) {
                                                    console.log(results[0].value);

                                                    var num = results[0].value.split('|')[0];
                                                    num = parseInt(num);
                                                    user._donateCards('100000', userinfo.uid, num, num, 0, function (err, result) {
                                                        if (err != null)
                                                            utils.operateLog(userinfo.uid, '玩家绑定邀请码赠送钻石' + num + '失败!');
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        res.status(200).json({code: 200, data: 0});
                                    }
                                });
                            }
                        } else {
                            res.status(200).json({code: error.INT_ERROR, msg: err});
                        }
                    });
                }
            }
        });
    },

// 检查玩家是否绑定邀请码
    checkBind: function (req, res) { // 检查玩家是否已绑定代理邀请码
        var userinfo = req.body;

        model.player.find({uid: userinfo.uid}, 1, function (err, results) {
            if (err != null || results.length == 0) {
                res.status(200).json({code: error.DB_ERROR, msg: err});
            } else {
                if (results[0].agentCode != null && results[0].agentCode.length > 1)
                    res.status(200).json({code: 200, data: results[0].agentCode});
                else
                    res.status(200).json({code: 200, data: ''});
            }
        });
    },

// 获取代理的佣金记录
    bonus: function (req, res) {
        var userinfo = req.body;
        if (!utils.checkSession(userinfo.uid, userinfo.session)) {
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
            return;
        }

        var pageId = userinfo.pageId == undefined ? 0 : userinfo.pageId;
        var pageSize = userinfo.pageSize == undefined ? 100 : userinfo.pageSize;

        console.log(userinfo, pageId);

        var between_time = " AND a.createTime >= \'" + userinfo.begin + " 00:00:00\' AND a.createTime < \'" + userinfo.end + " 23:59:59\' ";
        async.waterfall([
            function (cb) { // 查询佣金累计提取和累计总佣金
                model.user.find({uid: userinfo.pid}, 1, function (err, results) {
                    console.log(err, results);
                    if (err != null || results.length == 0) {
                        cb({code: error.DB_ERROR, msg: err});
                    } else {
                        cb(null, results[0]);
                    }
                });
            },
            function (user, cb) { // 查询佣金收入记录
                {
                    var sql_data = "SELECT uid, name, agentLevel, sum(bonus) as bonus, isAgent FROM (" +
                        " (SELECT t.uid, t.name, 0 as agentLevel, (a.playerBonus) as bonus, 0 as isAgent FROM qp_fangkaBonusIn as a," +
                        " (SELECT pl.uid, pl.`nickName` as name, be.uid as playerAgent FROM `qp_player` as pl LEFT JOIN qp_backenduser as be on pl.`agentCode`=be.`agentId` WHERE be.uid=?) as t," +
                        " `qp_fangkarecordext` as fk, `qp_payrecord` as pa" +
                        " WHERE a.fkrid=fk.`id` AND fk.payId=pa.`id` AND pa.`playerId` =t.uid " + between_time +
                        " GROUP BY t.uid, t.name)" +
                        " union" +
                        " (SELECT a.playerAgent as uid, b.name, b.agentLevel,  SUM(l2Bonus) as bonus, 1 as isAgent FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.playerAgent = b.uid WHERE a.l2Agent=? " + between_time +
                        " GROUP BY uid, name)" +
                        " union " +
                        " (SELECT a.l2Agent as uid, b.name, b.agentLevel,  SUM(l1Bonus) as bonus, 1 as isAgent  FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.l2Agent = b.uid WHERE a.l1Agent=? " + between_time +
                        " GROUP BY uid, name)" +
                        " union " +
                        " (SELECT a.l1Agent as uid, b.name, b.agentLevel,  SUM(extl3Bonus) as bonus,  1 as isAgent FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.l1Agent = b.uid WHERE a.extl3Agent=?  " + between_time +
                        " GROUP BY uid, name)" +
                        " union " +
                        " (SELECT a.extl3Agent as uid, b.name, b.agentLevel,  SUM(extl4Bonus) as bonus, 1 as isAgent  FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl3Agent = b.uid WHERE a.extl4Agent=?  " + between_time +
                        " GROUP BY uid, name)" +
                        " union " +
                        " (SELECT a.extl4Agent as uid, b.name, b.agentLevel, SUM(extl5Bonus) as bonus, 1 as isAgent   FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl4Agent = b.uid WHERE a.extl5Agent=?  " + between_time +
                        " GROUP BY uid, name)" +
                        " union " +
                        " (SELECT a.extl5Agent as uid, b.name, b.agentLevel, SUM(extl6Bonus) as bonus, 1 as isAgent   FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl5Agent = b.uid WHERE a.extl6Agent=?  " + between_time +
                        " GROUP BY uid, name)" +
                        " union " +
                        " (SELECT a.extl6Agent as uid, b.name, b.agentLevel, SUM(extl7Bonus) as bonus, 1 as isAgent   FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl6Agent = b.uid WHERE a.extl7Agent=?   " + between_time +
                        " GROUP BY uid, name)" +
                        " union " +
                        " (SELECT a.extl7Agent as uid, b.name, b.agentLevel, SUM(extl8Bonus) as bonus, 1 as isAgent   FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl7Agent = b.uid WHERE a.extl8Agent=?  " + between_time +
                        " GROUP BY uid, name)" +
                        " union " +
                        " (SELECT a.extl8Agent as uid, b.name, b.agentLevel, SUM(extl9Bonus) as bonus, 1 as isAgent   FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl8Agent = b.uid WHERE a.extl9Agent=?  " + between_time +
                        " GROUP BY uid, name)" +
                        " ) as res WHERE res.bonus > 0 GROUP BY res.uid, res.name ORDER BY res.bonus ";

                    var sql_count = "SELECT count(*) as num FROM (" + sql_data + ") as t";

                    model.db.driver.execQuery(
                        sql_count, [userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid], function (err, results) {
                            console.log('bonus in', err);
                            if (err != null)
                                cb({code: error.DB_ERROR, msg: err});
                            else {
                                var num = results.length > 0 ? results[0].num : 0;

                                var sql = sql_data + " limit " + pageSize + " offset " + (pageId * pageSize);
                                model.db.driver.execQuery(
                                    sql, [userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid, userinfo.pid], function (err, results) {
                                        console.log('bonus in', err);
                                        if (err != null)
                                            cb({code: error.DB_ERROR, msg: err});
                                        else {
                                            var page = {bonusInPage: {id: pageId, num: Math.ceil(num / pageSize)}};
                                            cb(null, user, results, page);
                                        }
                                    });
                            }
                        });
                }
            },
            function (user, bonusIn, page, cb) { // 查询佣金提取记录
                console.log('get bonus out');
                var record = {};
                record.uid = user.uid;

                model.bonusOut.count(record, function (err, count) {
                    if (err == null) {
                        model.bonusOut.find(record, {offset: pageId * pageSize}, pageSize, ['id', 'Z'], function (err, results) {
                            console.log('query bonus out', err);
                            page.bonusOutPage = {id: pageId, num: Math.ceil(count / pageSize)};
                            cb(null, user, bonusIn, results, page);
                        });
                    } else
                        cb({code: error.DB_ERROR, msg: err});
                });
            }
        ], function (err, user, bonusIn, bonusOut, page) {
            if (err)
                res.status(200).json(err);
            else {
                res.status(200).json({
                    code: 200,
                    data: {user: user, bonusIn: bonusIn, bonusOut: bonusOut},
                    page: page,
                    session: utils.getSession(userinfo.uid)
                });
            }
        });

    },

// 获取代理的佣金记录
    bonus_v2: function (req, res) {
        var info = req.body;

        if (!utils.verifySign(info, utils.getKey())) {
            res.status(200).json({code: error.SIGN_ERROR, msg: '安全验证失败!'});
            return;
        }

        if (!utils.checkSession(info.uid, info.session)) {
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
            return;
        }

        var pageId = info.pageId == undefined ? 0 : info.pageId;
        var pageSize = info.pageSize == undefined ? 100 : info.pageSize;

        console.log(info, pageId);

        async.waterfall([
            function (cb) { // 查询佣金收入记录
                if (info.pid == undefined || info.pid.length == 0) {
                    var between_time = " a.createTime >= \'" + info.begin + " 00:00:00\' AND a.createTime < \'" + info.end + " 23:59:59\' ";
                    var sql_data = "SELECT res.uid, u.name, u.agentLevel, sum(res.bonus) as bonus, res.createTime FROM (" +
                        " (SELECT a.playerAgent as uid, SUM(playerBonus) as bonus, date_format(a.createTime, \'%Y-%m-%d\') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.playerAgent = b.uid WHERE " + between_time +
                        " GROUP BY uid, createTime)" +
                        " union" +
                        " (SELECT a.l2Agent as uid, SUM(l2Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.l2Agent = b.uid WHERE " + between_time +
                        " GROUP BY uid, createTime)" +
                        " union " +
                        " (SELECT a.l1Agent as uid, SUM(l1Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.l1Agent = b.uid WHERE " + between_time +
                        " GROUP BY uid, createTime)" +
                        " union " +
                        " (SELECT a.extl3Agent as uid, SUM(extl3Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl3Agent = b.uid WHERE " + between_time +
                        " GROUP BY uid, createTime)" +
                        " union " +
                        " (SELECT a.extl4Agent as uid, SUM(extl4Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl4Agent = b.uid WHERE " + between_time +
                        " GROUP BY uid, createTime)" +
                        " union " +
                        " (SELECT a.extl5Agent as uid, SUM(extl5Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl5Agent = b.uid WHERE " + between_time +
                        " GROUP BY uid, createTime)" +
                        " union " +
                        " (SELECT a.extl6Agent as uid, SUM(extl6Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl6Agent = b.uid WHERE " + between_time +
                        " GROUP BY uid, createTime)" +
                        " union " +
                        " (SELECT a.extl7Agent as uid, SUM(extl7Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl7Agent = b.uid WHERE " + between_time +
                        " GROUP BY uid, createTime)" +
                        " union " +
                        " (SELECT a.extl8Agent as uid, SUM(extl8Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl8Agent = b.uid WHERE " + between_time +
                        " GROUP BY uid, createTime)" +
                        " union " +
                        " (SELECT a.extl9Agent as uid, SUM(extl9Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl9Agent = b.uid WHERE " + between_time +
                        " GROUP BY uid, createTime)" +
                        " ) as res LEFT JOIN qp_backendUser as u ON res.uid=u.uid WHERE bonus >0 GROUP BY res.uid, res.createTime ORDER BY res.bonus desc, res.createTime desc";

                    var sql_count = "SELECT count(*) as num FROM (" + sql_data + ") as t";
                    console.log(sql_count);
                    model.db.driver.execQuery(
                        sql_count, function (err, results) {
                            console.log('bonus in', err);
                            if (err != null)
                                cb({code: error.DB_ERROR, msg: err});
                            else {
                                var num = results.length > 0 ? results[0].num : 0;

                                var sql = sql_data + " limit " + pageSize + " offset " + (pageId * pageSize);
                                model.db.driver.execQuery(
                                    sql, function (err, results) {
                                        console.log('bonus in', err);
                                        if (err != null)
                                            cb({code: error.DB_ERROR, msg: err});
                                        else {
                                            var page = {bonusInPage: {id: pageId, num: Math.ceil(num / pageSize)}};
                                            cb(null, results, page);
                                        }
                                    });
                            }
                        });
                } else {
                    var between_time = " AND a.createTime >= \'" + info.begin + " 00:00:00\' AND a.createTime < \'" + info.end + " 23:59:59\' ";
                    var sql_data = "SELECT res.uid, u.name, u.agentLevel, SUM(res.bonus) as bonus, res.createTime FROM (" +
                        " (SELECT a.playerAgent as uid, SUM(playerBonus) as bonus, date_format(a.createTime, \'%Y-%m-%d\') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.playerAgent = b.uid WHERE a.playerAgent=? " + between_time +
                        " GROUP BY createTime)" +
                        " union" +
                        " (SELECT a.l2Agent as uid, SUM(l2Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.l2Agent = b.uid WHERE a.l2Agent=? " + between_time +
                        " GROUP BY createTime)" +
                        " union " +
                        " (SELECT a.l1Agent as uid, SUM(l1Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.l1Agent = b.uid WHERE a.l1Agent=? " + between_time +
                        " GROUP BY createTime)" +
                        " union " +
                        " (SELECT a.extl3Agent as uid, SUM(extl3Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl3Agent = b.uid WHERE a.extl3Agent=?  " + between_time +
                        " GROUP BY createTime)" +
                        " union " +
                        " (SELECT a.extl4Agent as uid, SUM(extl4Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl4Agent = b.uid WHERE a.extl4Agent=?  " + between_time +
                        " GROUP BY createTime)" +
                        " union " +
                        " (SELECT a.extl5Agent as uid, SUM(extl5Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl5Agent = b.uid WHERE a.extl5Agent=?  " + between_time +
                        " GROUP BY createTime)" +
                        " union " +
                        " (SELECT a.extl6Agent as uid, SUM(extl6Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl6Agent = b.uid WHERE a.extl6Agent=?  " + between_time +
                        " GROUP BY createTime)" +
                        " union " +
                        " (SELECT a.extl7Agent as uid, SUM(extl7Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl7Agent = b.uid WHERE a.extl7Agent=?   " + between_time +
                        " GROUP BY createTime)" +
                        " union " +
                        " (SELECT a.extl8Agent as uid, SUM(extl8Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl8Agent = b.uid WHERE a.extl8Agent=?  " + between_time +
                        " GROUP BY createTime)" +
                        " union " +
                        " (SELECT a.extl9Agent as uid, SUM(extl9Bonus) as bonus, date_format(a.createTime, '%Y-%m-%d') as createTime FROM qp_fangkaBonusIn as a LEFT JOIN qp_backenduser as b" +
                        " ON a.extl9Agent = b.uid WHERE a.extl9Agent=?  " + between_time +
                        " GROUP BY createTime)" +
                        " ) as res LEFT JOIN qp_backendUser as u ON res.uid=u.uid GROUP BY res.uid, res.createTime ORDER BY res.createTime desc";

                    var sql_count = "SELECT count(*) as num FROM (" + sql_data + ") as t";

                    model.db.driver.execQuery(
                        sql_count, [info.pid, info.pid, info.pid, info.pid, info.pid, info.pid, info.pid, info.pid, info.pid, info.pid], function (err, results) {
                            console.log('bonus in', err);
                            if (err != null)
                                cb({code: error.DB_ERROR, msg: err});
                            else {
                                var num = results.length > 0 ? results[0].num : 0;

                                var sql = sql_data + " limit " + pageSize + " offset " + (pageId * pageSize);
                                model.db.driver.execQuery(
                                    sql, [info.pid, info.pid, info.pid, info.pid, info.pid, info.pid, info.pid, info.pid, info.pid, info.pid], function (err, results) {
                                        console.log('bonus in', err);
                                        if (err != null)
                                            cb({code: error.DB_ERROR, msg: err});
                                        else {
                                            var page = {bonusInPage: {id: pageId, num: Math.ceil(num / pageSize)}};
                                            cb(null, results, page);
                                        }
                                    });
                            }
                        });
                }
            },
            function (bonusIn, page, cb) { // 查询佣金提取记录
                console.log('get bonus out');
                var between_time = " AND a.createTime >= \'" + info.begin + " 00:00:00\' AND a.createTime < \'" + info.end + " 23:59:59\' ";
                if (info.pid == undefined || info.pid.length == 0) {
                    var sql_data = "SELECT a.uid, b.name, SUM(cny) as cny, date_format(a.createTime, \'%Y-%m-%d\') as createTime FROM qp_fangkaBonusOut as a LEFT JOIN qp_backenduser as b" +
                        " ON a.uid = b.uid WHERE status=1 " + between_time +
                        " GROUP BY a.uid, createTime ORDER BY createTime ";

                    var sql_count = "SELECT count(*) as num FROM (" + sql_data + ") as t";
                    model.db.driver.execQuery(
                        sql_count, function (err, results) {
                            console.log('bonus out', err);
                            if (err != null)
                                cb({code: error.DB_ERROR, msg: err});
                            else {
                                var num = results.length > 0 ? results[0].num : 0;

                                var sql = sql_data + " limit " + pageSize + " offset " + (pageId * pageSize);
                                model.db.driver.execQuery(
                                    sql, function (err, results) {
                                        console.log('bonus out', err);
                                        if (err != null)
                                            cb({code: error.DB_ERROR, msg: err});
                                        else {
                                            page.bonusOutPage = {id: pageId, num: Math.ceil(num / pageSize)};
                                            cb(null, bonusIn, results, page);
                                        }
                                    });
                            }
                        });
                } else {
                    var sql_data = "SELECT a.uid, b.name, SUM(cny) as cny, date_format(a.createTime, \'%Y-%m-%d\') as createTime FROM qp_fangkaBonusOut as a LEFT JOIN qp_backenduser as b" +
                        " ON a.uid = b.uid WHERE status=1 AND a.uid=? " + between_time +
                        " GROUP BY a.uid, createTime ORDER BY createTime ";

                    var sql_count = "SELECT count(*) as num FROM (" + sql_data + ") as t";
                    model.db.driver.execQuery(
                        sql_count, [info.pid], function (err, results) {
                            console.log('bonus out', err);
                            if (err != null)
                                cb({code: error.DB_ERROR, msg: err});
                            else {
                                var num = results.length > 0 ? results[0].num : 0;

                                var sql = sql_data + " limit " + pageSize + " offset " + (pageId * pageSize);
                                model.db.driver.execQuery(
                                    sql, [info.pid], function (err, results) {
                                        console.log('bonus out', err);
                                        if (err != null)
                                            cb({code: error.DB_ERROR, msg: err});
                                        else {
                                            page.bonusOutPage = {id: pageId, num: Math.ceil(num / pageSize)};
                                            cb(null, bonusIn, results, page);
                                        }
                                    });
                            }
                        });
                }
            }
        ], function (err, bonusIn, bonusOut, page) {
            if (err)
                res.status(200).json(err);
            else {
                res.status(200).json({
                    code: 200,
                    data: {bonusIn: bonusIn, bonusOut: bonusOut},
                    page: page,
                    session: utils.getSession(info.uid)
                });
            }
        });
    },

// 获取代理信息
    getInfo: function (req, res) {
        var userinfo = req.body;
        console.log(userinfo);

// if (utils.checkSession(userinfo.uid, userinfo.session)) {
        model.user.find({uid: parseInt(userinfo.pid)}, 1, function (err, results) {
// console.log(err, results);
            if (err != null) {
                res.status(200).json({code: error.DB_ERROR, msg: err});
            } else {
                if (results.length == 0) {
                    res.status(200).json({code: error.INT_ERROR, msg: '代理ID不存在.'});
                } else {
                    var user = results[0];
                    model.user.find({uid: parseInt(userinfo.pid)}, 1, function (err, results) {
                        if (err == null && results.length > 0) {
                            console.log('agentLevel', results[0].agentLevel);
                            user.upLevelAgent = results[0].level2Agent == 0 ? '无' : results[0].level2Agent;
                            user.agentLevel = results[0].agentLevel;
                        } else {
                            user.upLevelAgent = '无';
                            user.agentLevel = 0;
                        }
                        res.status(200).json({code: 200, data: user, session: utils.getSession(userinfo.uid)});
                    });
                }
            }
        });
// } else
//   res.status(200).json({code:error.SESSION_EXPIRE, msg:'会话过期，请重新登录!'});
    },

// 提取佣金
    payBonus: function (req, res) {
        var userinfo = req.body;
        console.log(userinfo);

        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.bonusOut1.create({uid: userinfo.pid, outNum: userinfo.num}, function (err, results) {
                if (err != null) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {
                    model.user.find({uid: userinfo.pid}, function (err, results) {
                        if (err != null || results.length == 0) {
                            res.status(200).json({code: error.DB_ERROR, msg: err});
                        } else {
                            var user = results[0];
                            results[0].save({bonusOut: results[0].bonusOut + userinfo.num}, function (err) {
                                console.log('add bonusOut', err);

                                var list = [];
                                model.bonusOut.find({uid: userinfo.pid}, 200, ['id', 'Z'], function (err, results) {
                                    if (err == null)
                                        list = results;
                                    res.status(200).json({
                                        code: 200,
                                        data: {result: 1, user: user, list: list},
                                        session: utils.getSession(userinfo.uid)
                                    });
                                });
                            });
                        }
                    });
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

//获取批量代理指定月份的佣金收入
    _queryMonthBonus: function (users, callback) {
        var from = moment().startOf('month').format("YYYY-MM-DD") + " 00:00:00";
        var to = moment().endOf('month').format("YYYY-MM-DD") + " 23:59:59";

        var queries = [];
        var j = 0;
        for (var r in users) {
            queries.push(function (cb) {
                var uid = users[j++].uid;
                // console.log('agent: ', uid);
                // var sql = "SELECT SUM(gemNum) as charge, giveUid FROM qp_fangkaRecord as a LEFT JOIN qp_fangkaRecordExt as b ON a.id = b.id WHERE a.giveUid=? AND a.uid!=? " +
                //   "AND a.recordTime >= ? AND a.recordTime <= ?";
                // console.log(sql);
                // model.db.driver.execQuery(
                //   sql, [uid, userinfo.pid, from, to], function (err, data) {
                //     console.log('agent charge:', err, data);
                //     if (err != null)
                //       cb(error.DB_ERROR, null, null);
                //     else {
                //       sql = "SELECT SUM(gemNum) as used FROM qp_fangkaRecord as a LEFT JOIN qp_fangkaRecordExt as b ON a.id = b.id WHERE uid= ? " +
                //         "AND a.recordTime >= ? AND a.recordTime <= ?";
                //       console.log(sql, uid);
                //       model.db.driver.execQuery(
                //         sql, [uid, from, to], function (err, data1) {
                //           console.log('agent used:', err, data1);
                //           if (err != null)
                //             cb(error.DB_ERROR, null);
                //           else {
                sql = "SELECT SUM(l1Bonus) as bonus FROM qp_fangkaBonusIn as a, qp_fangkaRecord as b WHERE a.fkrId = b.id AND l1Agent= ? " +
                    "AND a.createTime >= ? AND a.createTime <= ?";
                model.db.driver.execQuery(
                    sql, [uid, from, to], function (err, data2) {
                        console.log('agent l1bonus:', err, data2);
                        if (err != null)
                            cb(error.DB_ERROR, null);
                        else {
                            sql = "SELECT SUM(l2Bonus) as bonus FROM qp_fangkaBonusIn as a, qp_fangkaRecord as b WHERE a.fkrId = b.id AND l2Agent= ? " +
                                "AND a.createTime >= ? AND a.createTime <= ?";
                            model.db.driver.execQuery(
                                sql, [uid, from, to], function (err, data3) {
                                    console.log('agent l2bonus:', err, data3);
                                    if (err != null)
                                        cb(error.DB_ERROR, null);
                                    else {
                                        sql = "SELECT SUM(playerBonus) as bonus FROM qp_fangkaBonusIn as a, qp_fangkaRecord as b WHERE a.fkrId = b.id AND playerAgent= ? AND " +
                                            "a.createTime >= ? AND a.createTime <= ?";
                                        model.db.driver.execQuery(
                                            sql, [uid, from, to], function (err, data4) {
                                                console.log('agent playerBonus:', err, data4);
                                                if (err != null)
                                                    cb(error.DB_ERROR, null);
                                                else {
                                                    cb(null, data2[0].bonus, data3[0].bonus, data4[0].bonus);
                                                }
                                            });
                                    }
                                });
                        }
                    });
                // }
            });
        }
//     });
// });
// }
// }

        async.parallel(queries,
            function (err, results1) {
                if (err == null) {
                    for (var i = 0; i < results1.length; i++) {
                        users[i].monthL1Bonus = results1[i][0] == null ? 0 : results1[i][0];
                        users[i].monthL2Bonus = results1[i][1] == null ? 0 : results1[i][1];
                        users[i].monthPlayerBonus = results1[i][2] == null ? 0 : results1[i][2];

                        // console.log(users[i]);
                    }

                    users.sort(function (a, b) {
                        return b.id - a.id
                    });

                    callback(null, users);
                } else
                    callback(err);
            });
    },

//查询代理的下级代理和绑定用户数量
    _queryAgentAndPlayerNum: function (users, callback) {
        var queries = [];
        var j = 0;
        for (var r in users) {
            queries.push(function (cb) {
                var uid = users[j].uid;
                var agentId = users[j].agentId;
                j++;
                console.log('agent: ', uid);

                async.waterfall([
                    function (cb) { // 下级代理数
                        var sql = "SELECT COUNT(uid) as agentNum FROM qp_backendUser as a WHERE a.level2Agent=?";
                        // console.log(sql);
                        model.db.driver.execQuery(
                            sql, [uid], function (err, data) {
                                console.log('agent num:', err, data);
                                if (err != null)
                                    cb(error.DB_ERROR, null);
                                else {
                                    cb(null, data.length > 0 ? data[0].agentNum : 0);
                                }
                            });
                    },
                    function (agentNum, cb) { // 直属玩家数
                        var sql = "SELECT COUNT(uid) as playerNum FROM qp_player as a WHERE a.agentCode=?";
                        model.db.driver.execQuery(
                            sql, [agentId], function (err, data) {
                                console.log('player num:', err, data);
                                if (err != null)
                                    cb(error.DB_ERROR, null);
                                else {
                                    cb(null, agentNum, data[0].playerNum);
                                }
                            });
                    },
                    function (agentNum, playerNum, cb) { // 下级代理合计玩家数
                        var sql = "SELECT COUNT(uid) as agentPlayersNum FROM qp_player as a WHERE a.agentCode IN (" +
                            "SELECT b.`agentId` FROM `qp_backenduser` as b WHERE b.`level1Agent` =? or b.`level2Agent` =? or b.`extl3Agent` =? " +
                            "or b.`extl4Agent` =? or b.`extl5Agent` =? or b.`extl6Agent` =? or b.`extl7Agent` =? or b.`extl8Agent` =? or b.`extl9Agent` =?)";
                        model.db.driver.execQuery(
                            sql, [uid, uid, uid, uid, uid, uid, uid, uid, uid], function (err, data) {
                                console.log('agentplayer num:', err, data);
                                if (err != null)
                                    cb(error.DB_ERROR);
                                else {
                                    cb(null, agentNum, playerNum, data.length > 0 ? data[0].agentPlayersNum : 0);
                                }
                            });
                    },
                    function (agentNum, playerNum, agentPlayersNum, cb) { // 最新充值金额和时间
                        var sql = "SELECT a.orderAmount, a.orderTime FROM `qp_payRecord` as a WHERE status = 1 AND id IN (" +
                            "SELECT `payId` FROM qp_fangkaRecordExt WHERE id IN (SELECT fkrId FROM `qp_fangkaBonusIn` " +
                            "WHERE playerAgent=? OR l2Agent=? OR l1Agent=? OR extl3Agent=? OR extl4Agent=? OR extl5Agent=? OR extl6Agent=? " +
                            "OR extl7Agent=? OR extl8Agent=? OR extl9Agent=?)) order by a.orderTime desc limit 1;";
                        model.db.driver.execQuery(
                            sql, [uid, uid, uid, uid, uid, uid, uid, uid, uid, uid], function (err, data) {
                                console.log('recent charge num:', err, data);
                                if (err != null)
                                    cb(error.DB_ERROR);
                                else {
                                    cb(null, agentNum, playerNum, agentPlayersNum, data.length > 0 ? data[0].orderAmount : 0, data.length > 0 ? data[0].orderTime : '');
                                }
                            });
                    },
                    function (agentNum, playerNum, agentPlayersNum, orderAmount, orderTime, cb) { // 是否被封号
                        var sql = "select vipLevel from qp_player where uid=?;";
                        model.db.driver.execQuery(
                            sql, [uid], function (err, data) {
                                console.log('player lock:', err, data);
                                if (err != null)
                                    cb(error.DB_ERROR);
                                else {
                                    cb(null, agentNum, playerNum, agentPlayersNum, orderAmount, orderTime, data.length > 0 ? (data[0].vipLevel == 0 ? 1 : 0) : 0);
                                }
                            });
                    },
                    function (agentNum, playerNum, agentPlayersNum, orderAmount, orderTime, locked, cb) { //累计充值金额
                        var sql = "SELECT SUM(a.orderAmount) as totalAmount FROM `qp_payRecord` as a WHERE status = 1 AND id IN (" +
                            "SELECT `payId` FROM qp_fangkaRecordExt WHERE id IN (SELECT fkrId FROM `qp_fangkaBonusIn` " +
                            "WHERE playerAgent=? OR l2Agent=? OR l1Agent=? OR extl3Agent=? OR extl4Agent=? OR extl5Agent=? OR extl6Agent=? " +
                            "OR extl7Agent=? OR extl8Agent=? OR extl9Agent=?));";
                        model.db.driver.execQuery(
                            sql, [uid, uid, uid, uid, uid, uid, uid, uid, uid, uid], function (err, data) {
                                console.log('agent total amount:', err, data);
                                if (err != null)
                                    cb(error.DB_ERROR);
                                else {
                                    cb(null, agentNum, playerNum, agentPlayersNum, orderAmount, orderTime, locked, data.length > 0 ? data[0].totalAmount : 0);
                                }
                            });
                    },
                ], function (err, agentNum, playerNum, agentPlayersNum, orderAmount, orderTime, locked, totalAmount) {
                    if (err)
                        cb(err);
                    else
                        cb(null, agentNum, playerNum, agentPlayersNum, orderAmount, orderTime, locked, totalAmount);
                });
            });
        }

        async.parallel(queries,
            function (err, results1) {
                if (err == null) {
                    for (var i = 0; i < results1.length; i++) {
                        users[i].agentNum = results1[i][0] == null ? 0 : results1[i][0];
                        users[i].playerNum = results1[i][1] == null ? 0 : results1[i][1];
                        users[i].agentPlayersNum = results1[i][2] == null ? 0 : results1[i][2];
                        users[i].orderAmount = results1[i][3] == null ? 0 : results1[i][3];
                        users[i].orderTime = results1[i][4] == null ? 0 : results1[i][4];
                        users[i].locked = results1[i][5] == null ? 0 : results1[i][5];
                        users[i].totalAmount = results1[i][6] == null ? 0 : results1[i][6];
                    }
                    // users.sort(function(a,b){
                    //   return b.orderTime > a.orderTime});
                    // console.log(users[i]);

                    callback(null, users);
                } else
                    callback(err);
            });
    },

// getAgents的扩展接口  运营用户: 获取全部代理信息  代理用户:获取全部下级代理信息
    getAgentsExt: function (req, res) {
        var userinfo = req.body;

        if (utils.checkSession(userinfo.uid, userinfo.session)) {

            model.user1.find({uid: userinfo.pid}, 1, function (err, results) {
                // console.log('bigAgentsExt', err, results);
                if (err != null || results.length == 0)
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                else {
                    if (results[0].isAgent > 2) { // 运营查看所有代理
                        var sql = 'select * from qp_backendUser where isAgent<3  '
                        if (userinfo.begin != undefined)
                            sql += 'and createdTime >= \'' + userinfo.begin + '\' and createdTime <= \'' + userinfo.end + ' 23:59:59\'  order by id desc  limit ' + pageSize + ' offset ' + (pageId * pageSize);
                        else
                            sql += ' limit ' + pageSize + ' offset ' + (pageId * pageSize);
                        console.log(sql);
                        model.db.driver.execQuery(sql, function (err, results) {
                            // console.log('bigAgents', err, results);
                            if (err != null)
                                res.status(200).json({code: error.DB_ERROR, msg: err});
                            else {
                                user._queryMonthBonus(results, function (err, data) {
                                    if (err == null)
                                        res.status(200).json({
                                            code: 200,
                                            data: data,
                                            session: utils.getSession(userinfo.uid)
                                        });
                                    else
                                        res.status(200).json({code: error.INT_ERROR, msg: err});
                                });
                            }
                        });
                    } else { // 代理查看自己的下级
                        var sql = 'select * from qp_backendUser where (level2Agent=' + userinfo.pid + ') '
                        if (userinfo.begin != undefined)
                            sql += 'and createdTime >= \'' + userinfo.begin + '\' and createdTime <= \'' + userinfo.end + ' 23:59:59\' order by id desc limit ' + pageSize + ' offset ' + (pageId * pageSize);
                        else
                            sql += ' limit ' + pageSize + ' offset ' + (pageId * pageSize);

                        model.db.driver.execQuery(sql, function (err, results) {
                            // console.log('subAgents', err, results);
                            if (err != null)
                                res.status(200).json({code: error.DB_ERROR, msg: err});
                            else {
                                user._queryMonthBonus(results, function (err, data) {
                                    if (err == null)
                                        res.status(200).json({
                                            code: 200,
                                            data: data,
                                            session: utils.getSession(userinfo.uid)
                                        });
                                    else
                                        res.status(200).json({code: error.INT_ERROR, msg: err});
                                });
                            }
                        });
                    }
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 运营用户: 获取全部代理信息  代理用户:获取全部下级代理信息
    getAgents: function (req, res) {
        var userinfo = req.body;
        var pageId = userinfo.pageId == undefined ? 0 : userinfo.pageId;
        var pageSize = userinfo.pageSize == undefined ? 100 : userinfo.pageSize;

        console.log('getAgents', userinfo);
        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.user1.find({uid: userinfo.pid}, 1, function (err, results) {
                // console.log('bigAgents', err, results);
                if (err != null || results.length == 0)
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                else {
                    if (results[0].isAgent > 2) { // 运营查看所有代理
                        var sql = 'select count(*) as num from qp_backendUser where isAgent<3 '
                        if (userinfo.begin != undefined)
                            sql += 'and createdTime >= \'' + userinfo.begin + ' 00:00:00\' and createdTime <= \'' + userinfo.end + ' 23:59:59\' order by updateTime desc ';

                        model.db.driver.execQuery(sql, function (err, results) {
                            if (err != null)
                                res.status(200).json({code: error.DB_ERROR, msg: err});
                            else {
                                var count = results.length > 0 ? results[0].num : 0;

                                var sql = 'select * from qp_backendUser where isAgent<3 '
                                if (userinfo.begin != undefined)
                                    sql += 'and createdTime >= \'' + userinfo.begin + ' 00:00:00\' and createdTime <= \'' + userinfo.end + ' 23:59:59\' order by updateTime desc limit ' + pageSize + ' offset ' + (pageId * pageSize);
                                else
                                    sql += ' order by updateTime desc limit ' + pageSize + ' offset ' + (pageId * pageSize);

                                model.db.driver.execQuery(sql, function (err, results) {
                                    // console.log('bigAgents', err, results);
                                    if (err != null)
                                        res.status(200).json({code: error.DB_ERROR, msg: err});
                                    else {
                                        user._queryAgentAndPlayerNum(results, function (err, data) {
                                            if (err == null)
                                                res.status(200).json({
                                                    code: 200,
                                                    data: data,
                                                    page: {id: pageId, num: Math.ceil(count / pageSize)},
                                                    session: utils.getSession(userinfo.uid)
                                                });
                                            else
                                                res.status(200).json({code: error.INT_ERROR, msg: err});
                                        });
                                    }
                                });
                            }
                        });
                    } else { // 代理查看自己的下级
                        var sql = 'select count(*) as num from qp_backendUser where (level2Agent=' + userinfo.pid + ') '
                        if (userinfo.begin != undefined)
                            sql += 'and createdTime >= \'' + userinfo.begin + '\' and createdTime <= \'' + userinfo.end + ' 23:59:59\' order by updateTime desc';

                        model.db.driver.execQuery(sql, function (err, results) {
                            if (err != null)
                                res.status(200).json({code: error.DB_ERROR, msg: err});
                            else {
                                var count = results.length > 0 ? results[0].num : 0;
                                var sql = 'select * from qp_backendUser where (level2Agent=' + userinfo.pid + ') '
                                if (userinfo.begin != undefined)
                                    sql += 'and createdTime >= \'' + userinfo.begin + '\' and createdTime <= \'' + userinfo.end + ' 23:59:59\' ';
                                sql += ' order by updateTime desc limit ' + pageSize + ' offset ' + (pageId * pageSize);

                                model.db.driver.execQuery(sql, function (err, results) {
                                    // console.log('subAgents', err, results);
                                    if (err != null)
                                        res.status(200).json({code: error.DB_ERROR, msg: err});
                                    else {
                                        user._queryAgentAndPlayerNum(results, function (err, data) {
                                            if (err == null)
                                                res.status(200).json({
                                                    code: 200,
                                                    data: data,
                                                    page: {id: pageId, num: Math.ceil(count / pageSize)},
                                                    session: utils.getSession(userinfo.uid)
                                                });
                                            else
                                                res.status(200).json({code: error.INT_ERROR, msg: err});
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 按UID获取代理信息 agent的扩展接口
    agentExt: function (req, res) { // 按UID搜代理
        var userinfo = req.body;
        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.user1.find({uid: userinfo.pid}, 1, function (err, results) {
                console.log('agentExt', err, results);
                if (err != null || results.length == 0)
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                else {
                    user._queryMonthBonus(results, function (err, data) {
                        if (err == null)
                            res.status(200).json({code: 200, data: data, session: utils.getSession(userinfo.uid)});
                        else
                            res.status(200).json({code: error.INT_ERROR, msg: err});
                    });
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 按UID获取代理信息
    agent: function (req, res) {
        var userinfo = req.body;
        console.log('agent', userinfo);
        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.user1.find({uid: userinfo.pid}, 1, function (err, results) {
                console.log('agent', err, results);
                if (err != null || results.length == 0)
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                else {
                    user._queryAgentAndPlayerNum(results, function (err, data) {
                        if (err == null)
                            res.status(200).json({code: 200, data: data, session: utils.getSession(userinfo.uid)});
                        else
                            res.status(200).json({code: error.INT_ERROR, msg: err});
                    });
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 按照邀请码获取代理信息
    agent_code: function (req, res) {
        var userinfo = req.body;
        console.log('agent_code', userinfo);
        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.user1.find({agentId: userinfo.agentCode}, 1, function (err, results) {
                console.log('agent_code', err, results);
                if (err != null || results.length == 0)
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                else {
                    user._queryAgentAndPlayerNum(results, function (err, data) {
                        if (err == null)
                            res.status(200).json({code: 200, data: data, session: utils.getSession(userinfo.uid)});
                        else
                            res.status(200).json({code: error.INT_ERROR, msg: err});
                    });
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

//获取批量玩家自然月的胜率和分数
    _queryPlayersWinRatio: function (players, callback) {
        var from = moment().startOf('month').format("YYYY-MM-DD");
        var to = moment().endOf('month').format("YYYY-MM-DD");
        var between_time = " createTime >= \'" + from + " 00:00:00\' AND createTime < \'" + to + " 23:59:59\' ";

        var queries = [];
        var j = 0;
        for (var r in players) {
            queries.push(function (cb) {
                var uid = players[j++].uid;
                var sql_data = "SELECT SUM(num) as num, SUM(score) as score, AVG(ratio) as ratio FROM( " +
                    "(SELECT COUNT(uid1) as num, SUM(score1) as score, AVG(ratio1) as ratio FROM `qp_playdata` " +
                    "WHERE uid1=? AND " + between_time + ") " +
                    "UNION " +
                    "(SELECT COUNT(uid2) as num, SUM(score2) as score, AVG(ratio2) as ratio FROM `qp_playdata`  " +
                    "WHERE uid2=? AND " + between_time + ") " +
                    "UNION " +
                    "(SELECT COUNT(uid3) as num, SUM(score3) as score, AVG(ratio3) as ratio FROM `qp_playdata`  " +
                    "WHERE uid3=? AND " + between_time + ") " +
                    "UNION " +
                    "(SELECT COUNT(uid4) as num, SUM(score4) as score, AVG(ratio4) as ratio FROM `qp_playdata`  " +
                    "WHERE uid4=? AND " + between_time + ") " +
                    "UNION " +
                    "(SELECT COUNT(uid5) as num, SUM(score5) as score, AVG(ratio5) as ratio FROM `qp_playdata`  " +
                    "WHERE uid5=? AND " + between_time + ") " +
                    "UNION " +
                    "(SELECT COUNT(uid6) as num, SUM(score6) as score, AVG(ratio6) as ratio FROM `qp_playdata`  " +
                    "WHERE uid6=? AND " + between_time + ") " +
                    "UNION " +
                    "(SELECT COUNT(uid7) as num, SUM(score7) as score, AVG(ratio7) as ratio FROM `qp_playdata`  " +
                    "WHERE uid7=? AND " + between_time + ") " +
                    "UNION " +
                    "(SELECT COUNT(uid8) as num, SUM(score8) as score, AVG(ratio8) as ratio FROM `qp_playdata`  " +
                    "WHERE uid8=? AND " + between_time + ") " +
                    ") res";

                // 计算玩家战绩数据
                model.db.driver.execQuery(
                    sql_data, [uid, uid, uid, uid, uid, uid, uid, uid], function (err, results) {
                        console.log('_queryPlayersWinRatio', err);
                        if (err != null)
                            cb({code: error.DB_ERROR, msg: err});
                        else {
                            cb(null, results[0].num, results[0].score, results[0].ratio);
                        }
                    });
            });
        }

        async.parallel(queries,
            function (err, results) {
                if (err == null) {
                    for (var i = 0; i < results.length; i++) {
                        players[i].playCount = results[i][0] == null ? 0 : results[i][0];
                        players[i].winScore = results[i][1] == null ? 0 : results[i][1];
                        players[i].winRatio = results[i][2] == null ? 0 : results[i][2];
                    }
                    callback(null, players);
                } else
                    callback(null, players);
            });
    },

//获取玩家信息  运营:获取全部玩家   代理:获取绑定邀请码玩家
    getPlayers: function (req, res) {
        var userinfo = req.body;
        var pageId = userinfo.pageId == undefined ? 0 : userinfo.pageId;
        var pageSize = userinfo.pageSize == undefined ? 100 : userinfo.pageSize;

        console.log('getPlayers:', userinfo);
        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.user1.find({uid: userinfo.uid}, 1, function (err, results) {
                console.log('players', err, results);
                if (err != null || results.length == 0)
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                else {
                    if (results[0].isAgent > 2) { // 获取注册玩家
                        var sql = 'select count(*) as num from qp_player ';
                        if (userinfo.begin != undefined)
                            sql += 'where registerTime >= \'' + userinfo.begin + ' 00:00:00\' and registerTime <= \'' + userinfo.end + ' 23:59:59\'';

                        model.db.driver.execQuery(sql, function (err, results1) {
                            // console.log('players', err, results);
                            if (err != null)
                                res.status(200).json({code: error.DB_ERROR, msg: err});
                            else {
                                var count = results1[0].num;

                                var sql = 'select a.*, b.orderAmount, b.orderTime from qp_player as a LEFT JOIN qp_payRecord as b ON a.uid=b.playerId ';
                                if (userinfo.begin != undefined)
                                    sql += 'where registerTime >= \'' + userinfo.begin + ' 00:00:00\' and registerTime <= \'' + userinfo.end + ' 23:59:59\'';
                                sql += ' GROUP BY a.uid order by b.orderTime desc, a.registerTime desc limit ' + pageSize + ' offset ' + (pageId * pageSize);
                                model.db.driver.execQuery(sql, function (err, results) {
                                    // console.log('players', err, results);
                                    if (err != null)
                                        res.status(200).json({code: error.DB_ERROR, msg: err});
                                    else {
                                        user._queryPlayersWinRatio(results, function (err, players) {
                                            res.status(200).json({
                                                code: 200,
                                                data: players,
                                                page: {id: pageId, num: Math.ceil(count / pageSize)},
                                                session: utils.getSession(userinfo.uid)
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    } else { // 获取绑定邀请码的玩家
                        var sql = 'select count(*) as num from qp_player where agentCode=\'' + results[0].agentId + '\'';
                        if (userinfo.begin != undefined)
                            sql += 'and registerTime >= \'' + userinfo.begin + ' 00:00:00\' and registerTime <= \'' + userinfo.end + ' 23:59:59\'';

                        model.db.driver.execQuery(sql, function (err, results1) {
                            // console.log('players', err, results);
                            if (err != null)
                                res.status(200).json({code: error.DB_ERROR, msg: err});
                            else {
                                var count = results1.length > 0 ? results1[0].num : 0;
                                var sql = 'select a.*, b.orderAmount, b.orderTime from qp_player as a LEFT JOIN qp_payRecord as b ON a.uid=b.playerId where a.agentCode=\'' + results[0].agentId + '\'';
                                if (userinfo.begin != undefined)
                                    sql += 'and a.registerTime >= \'' + userinfo.begin + ' 00:00:00\' and a.registerTime <= \'' + userinfo.end + ' 23:59:59\'';
                                sql += ' GROUP BY a.uid order by b.orderTime desc, a.registerTime desc limit ' + pageSize + ' offset ' + (pageId * pageSize);

                                model.db.driver.execQuery(sql, function (err, results) {
                                    // console.log('players', err, results);
                                    if (err != null)
                                        res.status(200).json({code: error.DB_ERROR, msg: err});
                                    else
                                        res.status(200).json({
                                            code: 200,
                                            data: results,
                                            page: {id: pageId, num: Math.ceil(count / pageSize)},
                                            session: utils.getSession(userinfo.uid)
                                        });
                                });
                            }
                        });
                    }
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

//查询代理下属所有玩家或代理充值记录
    getCharges: function (req, res) {
        var info = req.body;
        var pageId = info.pageId == undefined ? 0 : info.pageId;
        var pageSize = info.pageSize == undefined ? 100 : info.pageSize;

        if (utils.checkSession(info.uid, info.session)) {
            var targetUid = info.pid > 0 ? info.pid : info.uid;
// 内部方法 批量查询代理及下属玩家的充值总金额
            var _queryAgentsCharge = function (agents, callback) {
                var between_time = " AND a.orderTime >= \'" + info.begin + " 00:00:00\' AND a.orderTime < \'" + info.end + " 23:59:59\' ";

                var queries = [];
                var j = 0;
                for (var r in agents) {
                    queries.push(function (cb) {
                        var uid = agents[j].uid;
                        var upLevelAgent = targetUid;
                        j++;
                        console.log('agent: ', uid);

                        var sql = "SELECT SUM(a.orderAmount) as chargeAmount FROM `qp_payRecord` as a WHERE status = 1 AND id IN (" +
                            "SELECT `payId` FROM qp_fangkaRecordExt WHERE id IN (" +
                            "SELECT fkrId FROM `qp_fangkaBonusIn` " +
                            "WHERE (playerAgent=? AND l2Agent=?) OR (l2Agent=? AND l1Agent=?) OR (l1Agent=? AND extl3Agent=?) OR " +
                            " (extl3Agent=? AND extl4Agent=?) OR (extl4Agent=? AND extl5Agent=?) OR (extl5Agent=? AND extl6Agent=?) " +
                            "OR (extl6Agent=? AND extl7Agent=?) OR (extl7Agent=? AND extl8Agent=?) OR (extl8Agent=? AND extl9Agent=?))) " + between_time;
                        model.db.driver.execQuery(
                            sql, [uid, upLevelAgent, uid, upLevelAgent, uid, upLevelAgent, uid, upLevelAgent, uid, upLevelAgent,
                                uid, upLevelAgent, uid, upLevelAgent, uid, upLevelAgent, uid, upLevelAgent], function (err, data) {
                                console.log('today charge agent amount:', err, data);
                                if (err != null)
                                    cb(error.DB_ERROR, null);
                                else {
                                    cb(null, data.length > 0 ? data[0].chargeAmount : 0);
                                }
                            });
                    });
                }

                async.parallel(queries,
                    function (err, results1) {
                        if (err == null) {
                            console.log(results1);
                            for (var i = 0; i < results1.length; i++) {
                                agents[i].chargeAmount = results1[i] == null ? 0 : results1[i];
                            }

                            callback(null, agents);
                        } else
                            callback(err);
                    });
            };

            var totalAmount = 0;

            async.waterfall([
                function (cb) {
                    model.user1.find({uid: targetUid}, 1, function (err, results) {
                        if (err != null || results.length == 0)
                            cb({code: error.DB_ERROR, msg: err});
                        else {
                            cb(null, results[0]);
                        }
                    });
                },
                function (user, cb) { // 查询代理及其下属玩家充钻记录
                    model.db.driver.execQuery(
                        "SELECT uid, name FROM qp_backendUser WHERE level2Agent = ?", [user.uid], function (err, results) {
                            console.log('today charge agents:', err, results);
                            if (err == null) {
                                var charges = [];
                                _queryAgentsCharge(results, function (err, agents) {
                                    for (var i = 0; i < agents.length; i++) {
                                        if (agents[i].chargeAmount != 0) {
                                            agents[i].isAgent = 1;
                                            totalAmount += agents[i].chargeAmount;
                                            charges.push(agents[i]);
                                        }
                                    }
                                    console.log(charges);
                                    cb(null, user, charges.length, charges);
                                });
                            } else {
                                cb(null, user, 0, []);
                            }
                        });
                },
                function (user, agentChargeNum, agentCharges, cb) { // 查询玩家充钻记录数
                    var between_time = " AND a.orderTime >= \'" + info.begin + " 00:00:00\' AND a.orderTime < \'" + info.end + " 23:59:59\' ";
                    var sql = "SELECT count(distinct playerId) as num, sum(a.orderAmount) as totalAmount FROM qp_payRecord as a LEFT JOIN qp_player as b" +
                        " ON a.playerId = b.uid WHERE b.agentCode=? and a.status=1 " + between_time;
                    model.db.driver.execQuery(
                        sql, [user.agentId], function (err, results) {
                            console.log('today charge players:', err, results[0].num);
                            if (err == null) {
                                totalAmount += results.length > 0 ? results[0].totalAmount : 0;
                                cb(null, user, agentChargeNum, agentCharges, results.length > 0 ? results[0].num : 0);
                            } else
                                cb(null, user, agentChargeNum, agentCharges, 0);
                        });
                },
                function (user, agentChargeNum, agentCharges, playerChargeNum, cb) { // 查询玩家充钻记录
                    console.log(agentChargeNum, playerChargeNum);
                    if (agentChargeNum > pageId * pageSize + pageSize) {
                        agentCharges = agentCharges.splice(pageId * pageSize, pageSize);
                        cb(null, agentChargeNum, agentCharges, playerChargeNum, null);
                    } else {
                        agentCharges = agentCharges.splice(pageId * pageSize, agentChargeNum - pageId * pageSize);

                        var between_time = " AND a.orderTime >= \'" + info.begin + " 00:00:00\' AND a.orderTime < \'" + info.end + " 23:59:59\' ";
                        var limit = "";

                        if ((agentChargeNum - pageId * pageSize > 0) && (agentChargeNum - pageId * pageSize <= pageSize)) {
                            var size = pageSize - (agentChargeNum - pageId * pageSize);
                            limit = " limit " + size + " offset 0";
                        } else {
                            limit = " limit " + pageSize + " offset " + (pageId * pageSize - agentChargeNum);
                        }


                        var sql = "SELECT SUM(a.orderAmount) as chargeAmount, b.uid, b.nickName as name FROM qp_payRecord as a LEFT JOIN qp_player as b" +
                            " ON a.playerId = b.uid WHERE b.agentCode=? and a.status=1 " + between_time + " GROUP BY a.playerId" + limit;
                        console.log(sql);
                        model.db.driver.execQuery(
                            sql, [user.agentId], function (err, results) {
                                console.log('today charge players:', err, results);
                                if (err == null) {
                                    cb(null, agentChargeNum, agentCharges, playerChargeNum, results);
                                } else {
                                    cb({code: error.DB_ERROR, msg: err});
                                }
                            });
                    }
                }

            ], function (err, agentChargeNum, agentCharges, playerChargeNum, playerCharges) {
                if (err)
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                else {
                    var page = {id: pageId, num: Math.ceil((agentChargeNum + playerChargeNum) / pageSize)};
                    var charges = [];
                    if (agentCharges != null)
                        charges = charges.concat(agentCharges);
                    if (playerCharges != null)
                        charges = charges.concat(playerCharges);

                    res.status(200).json({
                        code: 200,
                        data: {totalAmount: totalAmount, charges: charges},
                        page: page,
                        session: utils.getSession(info.uid)
                    });
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

//查询指定玩家或代理的充值信息
    getCharge: function (req, res) {
        var info = req.body;
        var pageId = info.pageId == undefined ? 0 : info.pageId;
        var pageSize = info.pageSize == undefined ? 100 : info.pageSize;

        if (utils.checkSession(info.uid, info.session)) {
            var between_time = " AND a.orderTime >= \'" + info.begin + " 00:00:00\' AND a.orderTime < \'" + info.end + " 23:59:59\' ";

            var _queryAgentsCharge = function (agents, callback) {
                var queries = [];
                var j = 0;
                for (var r in agents) {
                    queries.push(function (cb) {
                        var uid = agents[j].uid;
                        var upLevelAgent = info.pid;
                        j++;
                        console.log('agent: ', uid);

                        var sql = "SELECT SUM(a.orderAmount) as chargeAmount FROM `qp_payRecord` as a WHERE status = 1 AND id IN (" +
                            "SELECT `payId` FROM qp_fangkaRecordExt WHERE id IN (" +
                            "SELECT fkrId FROM `qp_fangkaBonusIn` " +
                            "WHERE (playerAgent=? AND l2Agent=?) OR (l2Agent=? AND l1Agent=?) OR (l1Agent=? AND extl3Agent=?) OR " +
                            " (extl3Agent=? AND extl4Agent=?) OR (extl4Agent=? AND extl5Agent=?) OR (extl5Agent=? AND extl6Agent=?) " +
                            "OR (extl6Agent=? AND extl7Agent=?) OR (extl7Agent=? AND extl8Agent=?) OR (extl8Agent=? AND extl9Agent=?))) " + between_time;
                        model.db.driver.execQuery(
                            sql, [uid, upLevelAgent, uid, upLevelAgent, uid, upLevelAgent, uid, upLevelAgent, uid, upLevelAgent,
                                uid, upLevelAgent, uid, upLevelAgent, uid, upLevelAgent, uid, upLevelAgent], function (err, data) {
                                console.log('today charge agent amount:', err, data);
                                if (err != null)
                                    cb(error.DB_ERROR, null);
                                else {
                                    cb(null, data.length > 0 ? data[0].chargeAmount : 0);
                                }
                            });
                    });
                }

                async.parallel(queries,
                    function (err, results1) {
                        console.log(results1);
                        if (err == null) {
                            for (var i = 0; i < results1.length; i++) {
                                agents[i].chargeAmount = results1[i] == null ? 0 : results1[i];
                            }

                            callback(null, agents);
                        } else
                            callback(err);
                    });
            };

            var totalAmount = 0;

            async.waterfall([
                function (cb) {
                    model.player.find({uid: info.pid}, 1, function (err, results) {
                        if (err != null || results.length == 0)
                            cb({code: error.DB_ERROR, msg: err});
                        else {
                            cb(null, results[0]);
                        }
                    });
                },
                function (user, cb) { // 查询代理及下属玩家充钻记录
                    model.db.driver.execQuery(
                        "SELECT uid, name FROM qp_backendUser WHERE level2Agent = ?", [user.uid], function (err, results) {
                            console.log('agents charge:', err, results);
                            if (err == null) {
                                var charges = [];
                                _queryAgentsCharge(results, function (err, agents) {
                                    for (var i = 0; i < agents.length; i++) {
                                        if (agents[i].chargeAmount != 0) {
                                            totalAmount += agents[i].chargeAmount;
                                            charges.push(agents[i]);
                                        }
                                    }

                                    cb(null, user, charges.length, charges);
                                });
                            } else {
                                cb(null, user, 0, null);
                            }
                        });
                },
                function (user, agentChargeNum, agentCharges, cb) { // 查询玩家充钻记录数
                    var sql = "SELECT count(*) as num, sum(totalAmount) as totalAmount FROM (" +
                        " SELECT DISTINCT(a.playerId) as uid, sum(a.orderAmount) as totalAmount FROM qp_payRecord as a LEFT JOIN qp_player as b" +
                        " ON a.playerId = b.uid WHERE (b.uid=? OR b.agentCode in (select agentId from qp_backendUser where uid=?)) and a.status=1 " + between_time +
                        " GROUP BY a.playerId) as t1";
                    model.db.driver.execQuery(
                        sql, [user.uid, user.uid], function (err, results) {
                            console.log('players charges:', err, results[0].num, results[0].totalAmount);
                            if (err == null) {
                                totalAmount += results.length > 0 ? results[0].totalAmount : 0;
                                cb(null, user, agentChargeNum, agentCharges, results.length > 0 ? results[0].num : 0);
                            } else
                                cb(null, user, agentChargeNum, agentCharges, 0);
                        });
                },
                function (user, agentChargeNum, agentCharges, playerChargeNum, cb) { // 查询玩家充钻记录
                    if (agentChargeNum > pageId * pageSize + pageSize)
                        cb(null, user, agentChargeNum, agentCharges, playerChargeNum, null);
                    else {
                        var limit = " limit ";

                        if ((agentChargeNum - pageId * pageSize > 0) && (agentChargeNum - pageId * pageSize < pageSize)) {
                            var size = pageSize - (agentChargeNum - pageId * pageSize);
                            limit += size + " offset 0";
                        } else {
                            limit += pageSize + " offset " + (pageId * pageSize - agentChargeNum);
                        }

                        var sql = "SELECT DISTINCT(a.playerId) as uid, b.nickName as name, sum(a.orderAmount) as chargeAmount FROM qp_payRecord as a LEFT JOIN qp_player as b" +
                            " ON a.playerId = b.uid WHERE (b.uid=? OR b.agentCode in (select agentId from qp_backendUser where uid=?)) and a.status=1 " + between_time +
                            " GROUP BY a.playerId" + limit;
                        model.db.driver.execQuery(
                            sql, [user.uid, user.uid], function (err, results) {
                                console.log('player charges:', err, results);
                                if (err == null) {
                                    cb(null, user, agentChargeNum, agentCharges, playerChargeNum, results);
                                } else {
                                    cb({code: error.DB_ERROR, msg: err});
                                }
                            });
                    }
                }

            ], function (err, user, agentChargeNum, agentCharges, playerChargeNum, playerCharges) {
                if (err)
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                else {
                    var page = {id: pageId, num: Math.ceil((agentChargeNum + playerChargeNum) / pageSize)};
                    var charges = [];
                    if (agentCharges != null)
                        charges = charges.concat(agentCharges);
                    if (playerCharges != null)
                        charges = charges.concat(playerCharges);
                    res.status(200).json({code: 200, data: charges, page: page, session: utils.getSession(info.uid)});
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

//运营查询全部佣金提取记录
    bonusOut: function (req, res) {
        var userinfo = req.body;
        console.log(userinfo);

        var pageId = userinfo.pageId == undefined ? 0 : userinfo.pageId;
        var pageSize = userinfo.pageSize == undefined ? 100 : userinfo.pageSize;

        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.bonusOut.count({}, function (err, count) {
                if (err == null) {
                    model.bonusOut.find({}, {offset: pageId * pageSize}, pageSize, ['id', 'Z'], function (err, results) {
                        res.status(200).json({
                            code: 200,
                            data: results,
                            page: {id: pageId, num: Math.ceil(count / pageSize)},
                            session: utils.getSession(userinfo.uid)
                        });
                    });
                } else
                    res.status(200).json({code: error.DB_ERROR, msg: err});
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

    smsCodePool: {},
//获取短信验证码
    getSmsCode: function (req, res) {
        model.user1.find({phoneNumber: req.body.phoneNumber}, 1, function (err, results) {
            console.log('users', err, results);
            if (err != null || results.length > 0)
                res.status(200).json({code: error.DB_ERROR, msg: '该手机号已经存在!'});
            else {
                // 获得4位数验证码
                var code = '' + parseInt(10 * Math.random()) + '' + parseInt(10 * Math.random()) + '' +
                    parseInt(10 * Math.random()) + '' + parseInt(10 * Math.random());

                user.smsCodePool[code] = req.body.phoneNumber;
                
                //发送短信
                // smsClient.sendSMS({
                //     PhoneNumbers: req.body.phoneNumber,
                //     SignName: '闲娱网络',
                //     TemplateCode: 'SMS_85420042',
                //     TemplateParam: '{"number":' + code + '}'
                // }).then(function (resp) {
                //     var Code = resp.Code;
                //     if (Code === 'OK') {
                //         //处理返回参数
                //         console.log(resp);
                //         res.status(200).json({code: 200, data: code});
                //     }
                // }, function (err) {
                //     console.log(err);
                //     res.status(200).json({code: error.INT_ERROR, msg: '验证码发送失败!'});
                // })
            }
        });
    },

//通过短信验证码和手机号注册普通代理
    smsApplyAgent: function (req, res) {
        var userinfo = req.body;
        console.log(userinfo, user.smsCodePool[userinfo.code]);

        if (user.smsCodePool[userinfo.code] != userinfo.phoneNum) {
            res.status(200).json({code: error.INT_ERROR, msg: '验证码错误!'});
            return;
        } else {
            model.player.find({uid: userinfo.uid}, 1, function (err, results) {
                if (err != null || results.length == 0) {
                    res.status(200).json({code: error.DB_ERROR, msg: '用户不存在,请先登录游戏!'});
                } else {
                    delete user.smsCodePool[userinfo.code];
                    model.user1.find({phoneNumber: userinfo.phoneNum}, 1, function (err, results1) {
                        console.log('users', err, results1);
                        if (err != null || results1.length > 0)
                            res.status(200).json({code: error.DB_ERROR, msg: '该手机号已经存在!'});
                        else {
                            var password = '' + parseInt(10 * Math.random()) + '' + parseInt(10 * Math.random()) + '' +
                                parseInt(10 * Math.random()) + '' + parseInt(10 * Math.random()) + '' + parseInt(10 * Math.random());
                            //发送短信
                            // smsClient.sendSMS({
                            //     PhoneNumbers: userinfo.phoneNum,
                            //     SignName: '闲娱网络',
                            //     TemplateCode: 'SMS_86580118',
                            //     TemplateParam: '{"password":' + password + '}'
                            // }).then(function (resp) {
                            //     var Code = resp.Code;
                            //     if (Code === 'OK') {
                            //         //处理返回参数
                            //         console.log(resp);
                            //         var player = results[0];

                            //         model.settings.find({key: 'agentCodeUseUID'}, 1, function (err, values) {
                            //             var agentCodeUseUID = 0;
                            //             if (err == null && values.length == 1 && values[0].value == '1')
                            //                 agentCodeUseUID = 1;

                            //             player.save({vipLevel: 21}, function (err) {
                            //                 if (err == null) {
                            //                     console.log('register user');
                            //                     var newRecord = {};
                            //                     var uid = parseInt(userinfo.uid);
                            //                     newRecord.uid = uid;
                            //                     newRecord.phoneNumber = userinfo.phoneNum;
                            //                     newRecord.name = player.nickName;
                            //                     newRecord.mail = '';
                            //                     newRecord.initPassword = password;
                            //                     newRecord.password = password;
                            //                     newRecord.agentId = '' + (agentCodeUseUID == 1 ? uid : uid.toString(8));
                            //                     newRecord.isAgent = 1;
                            //                     newRecord.agentLevel = 3;
                            //                     model.user.create(newRecord, function (err, results) {
                            //                         if (err != null) {
                            //                             res.status(200).json({code: error.DB_ERROR, msg: err});
                            //                         } else {
                            //                             res.status(200).json({code: 200, data: newRecord});
                            //                         }
                            //                     });
                            //                 } else {
                            //                     res.status(200).json({code: error.DB_ERROR, msg: err});
                            //                 }
                            //                 utils.operateLog(userinfo.uid, '申请: ' + userinfo.uid + '代理权限');
                            //             });
                            //         });
                            //     }
                            // }, function (err) {
                            //     console.log(err);
                            //     res.status(200).json({code: error.INT_ERROR, msg: '代理登录密码发送失败, 请稍后重新申请!'});
                            // });
                        }
                    });
                }
            });
        }
    },

// 根据设备号(微信unionid)获取用户uid
    getUid: function (req, res) {
        console.log(req.params);
        model.db.driver.execQuery(
            'select uid from qp_player where deviceID=?', [req.params.unionid], function (err, results) {
                console.log(err, results);
                if (err != null || results.length == 0) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {
                    console.log(results[0].uid);
                    res.status(200).json({code: 200, data: results[0].uid});
                }
            });
    },

//设置佣金比例
    setBonusPercent: function (req, res) {
        var userinfo = req.body;
        console.log('players:', userinfo);
        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.user1.find({uid: userinfo.uid}, 1, function (err, results) {
                console.log('players', err, results);
                if (err != null || results.length == 0)
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                else {
                    if (userinfo.bonusPercent > 100) {
                        res.status(200).json({code: 200, data: 0, session: utils.getSession(userinfo.uid)});
                        return;
                    }
                    var operator = results[0];
                    model.db.driver.execQuery(
                        'select * from qp_backenduser where uid in (select level2Agent from qp_backenduser where uid=?)', [userinfo.pid], function (err, results) {
                            if (err != null && results.length > 0 && userinfo.bonusPercent > results[0].bonusPercent) {
                                res.status(200).json({code: 200, data: 0, session: utils.getSession(userinfo.uid)});
                            } else {
                                if (operator.isAgent > 3) {
                                    model.db.driver.execQuery(
                                        'update qp_backenduser set bonusPercent=? where uid=?', [userinfo.bonusPercent, userinfo.pid], function (err, result) {
                                            console.log(err, result);
                                            if (err != null)
                                                res.status(200).json({
                                                    code: 200,
                                                    data: 0,
                                                    session: utils.getSession(userinfo.uid)
                                                });
                                            else {
                                                res.status(200).json({
                                                    code: 200,
                                                    data: 1,
                                                    session: utils.getSession(userinfo.uid)
                                                });
                                                utils.operateLog(userinfo.uid, '调整 ' + userinfo.pid + ' 佣金比例到' + userinfo.bonusPercent);
                                            }
                                        });
                                } else {
                                    res.status(200).json({code: error.INT_ERROR, msg: '无权进行该操作'});
                                }
                            }
                        });
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

// 根据设备号(微信unionid)获取用户微信信息
    wxCodePool: {},

// 微信自动登录后台使用code作为临时验证用户身份合法性依据
    wxGetUser: function (req, res) {
        console.log('wx_getuser', req.body);

        var wxClient = new OAuth(wxPub.wxPubConfig[req.body.prod].appId, wxPub.wxPubConfig[req.body.prod].appSecret);
        wxClient.getAccessToken(req.body.code, function (err, result) {
            if (!!err || err != undefined) {
                res.json({code: error.INT_ERROR, msg: '服务器异常, 请稍后再试!'});
                return;
            }
            var accessToken = result.data.access_token;
            console.log(result);
            if (result.data.unionid == undefined || result.data.unionid == null) {
                res.json({code: 1000, msg: '请先关注公众号!'});
                return;
            }

            model.db.driver.execQuery(
                'select uid from qp_player where deviceID=?', [result.data.unionid], function (err, results) {
                    console.log(err, results);
                    if (err != null || results.length == 0) {
                        res.status(200).json({code: error.DB_ERROR, msg: '数据异常, 请稍后再试!'});
                    } else {
                        user.wxCodePool[results[0].uid] = req.body.code;
                        console.log(results[0].uid, user.wxCodePool[results[0].uid]);
                        res.status(200).json({code: 200, data: results[0].uid});
                    }
                });
        });
    },

// 获取代理提现的微信二次确认链接
    getBonusWxCfm: function (req, res) {
        console.log(req.body);
        model.db.driver.execQuery(
            'select * from qp_fangkabonusout where uid=? and (status=1 or status=2) and wxCfmUrl is not null', [req.body.uid], function (err, results) {
                console.log(err, results);
                if (err != null || results.length == 0) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {
                    console.log(results[0].wxCfmUrl);
                    res.status(200).json({code: 200, data: results[0].wxCfmUrl});
                }
            });
    },

//获取封号列表
    getLockedAgents: function (req, res) {
        var info = req.body;

        if (!utils.verifySign(info, utils.getKey())) {
            res.status(200).json({code: error.SIGN_ERROR, msg: '安全验证失败!'});
            return;
        }

        if (!utils.checkSession(info.uid, info.session)) {
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
            return;
        }

        var pageId = info.pageId == undefined ? 0 : info.pageId;
        var pageSize = info.pageSize == undefined ? 100 : info.pageSize;

        var sql = 'select count(a.uid) as num from qp_backendUser as a LEFT JOIN `qp_player` as b ON a.uid=b.`uid` where b.vipLevel=0 ';
        model.db.driver.execQuery(
            sql, function (err, data) {
                if (err != null) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                    return;
                }
                var num = data.length > 0 ? data[0].num : 0;
                var page = {id: pageId, num: Math.ceil(num / pageSize)};
                var sql = 'select a.* from qp_backendUser as a LEFT JOIN `qp_player` as b ON a.uid=b.`uid` where b.vipLevel=0 limit ' + pageSize + ' offset ' + (pageId * pageSize);
                model.db.driver.execQuery(
                    sql, function (err, results) {
                        // console.log(err, results);
                        if (err != null) {
                            res.status(200).json({code: error.DB_ERROR, msg: err});
                        } else {
                            if (results.length == 0) {
                                res.status(200).json({
                                    code: 200,
                                    data: [],
                                    page: page,
                                    session: utils.getSession(info.uid)
                                });
                            } else {
                                res.status(200).json({
                                    code: 200,
                                    data: results,
                                    page: page,
                                    session: utils.getSession(info.uid)
                                });
                            }
                        }
                    });
            });
    }

}

module.exports = user;
