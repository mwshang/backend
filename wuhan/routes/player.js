var async = require('async');
var error = require('../constants');
var model = require('../model');
var utils = require('../utils');
var user = require('./user');

var OAuth = require('wechat-oauth');
var wxPub = require('../wxpub');

var player = {
    // 玩家信息
    getPlayer: function (req, res) {
        var userinfo = req.body;
        console.log(userinfo);

        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.player.find({uid: userinfo.pid}, 1, function (err, results) {
                // console.log(err, results);
                if (err != null) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {
                    if (results.length == 0) {
                        res.status(200).json({code: error.INT_ERROR, msg: '玩家游戏ID不存在.'});
                    } else {
                        var player = results[0];
                        model.user.find({uid: userinfo.pid}, 1, function (err, results) {
                            if (err == null && results.length > 0) {
                                console.log('agentLevel', results[0].agentLevel);
                                player.upLevelAgent = results[0].level2Agent == 0 ? '无' : results[0].level2Agent;
                                player.agentLevel = results[0].agentLevel;
                            } else {
                                player.upLevelAgent = '无';
                                player.agentLevel = 0;
                            }

                            model.payRecord1.find({playerId: userinfo.pid}, 1, ['orderTime', 'Z'], function (err, results) {
                                if (err == null && results.length > 0) {
                                    player.orderTime = results[0].orderTime;
                                    player.orderAmount = results[0].orderAmount;
                                } else {
                                    player.orderTime = '';
                                    player.orderAmount = 0;
                                }

                                user._queryPlayersWinRatio([player], function (err ,players) {
                                    res.status(200).json({code: 200, data: players[0], session: utils.getSession(userinfo.uid)});
                                });
                            });
                        });
                    }
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

    //玩家封号
    lockPlayer: function (req, res) {
        var info = req.body;
        console.log("收到参数", info);
        //if (!utils.verifySign(info, utils.getKey())) {
        //  res.status(200).json({code:error.SIGN_ERROR, msg:'安全验证失败!'});
        //  return;
        //}
        //
        //if (!utils.checkSession(info.uid, info.session)) {
        //  res.status(200).json({code:error.SESSION_EXPIRE, msg:'会话过期，请重新登录!'});
        //  return;
        //}

        //todo 没有做权限验证
        model.player.find({uid: info.pid}, 1, function (err, results) {
            // console.log(err, results);
            if (err != null) {
                res.status(200).json({code: error.DB_ERROR, msg: err});
                return;
            } else {
                if (results.length == 0) {
                    res.status(200).json({code: error.INT_ERROR, msg: '玩家游戏ID不存在.'});
                    return;
                } else {
                    var player = results[0];
                    //player.locked=info.locked;

                    results[0].save({locked: info.locked}, function (err) {
                        if (err != null)
                            res.status(200).json({code: error.DB_ERROR, msg: err});
                        else {
                            console.log('save lockPlayer', info.locked, err);
                            utils.operateLog(info.uid, '封号或解封:' + info.locked + "被封号账号:" + info.pid);
                            res.status(200).json({code: 200, data: player, session: utils.getSession(info.uid)});
                            utils.postToGameSrv('/gmlockPlayer', {
                                uid: info.uid,
                                optUid: player.uid,
                                locked: info.locked
                            }, function (err, body) {
                                console.log('gmlockPlayer:', err, body);
                                //if (err != null) {
                                //  res.status(200).json({code: error.GAME_ERROR, msg: err});
                                //} else {
                                //
                                //  res.status(200).json({code: 200});
                                //}
                            });
                        }
                    });
                }
            }
        });
    },

    //获取封号列表{uid:查询人 pageId:页码  pageSize:显示数量}}
    getLockedPlayerList: function (req, res) {
        var info = req.body;

        // if (!utils.verifySign(info, utils.getKey())) {
        //   res.status(200).json({code:error.SIGN_ERROR, msg:'安全验证失败!'});
        //   return;
        // }
        //
        // if (!utils.checkSession(info.uid, info.session)) {
        //   res.status(200).json({code:error.SESSION_EXPIRE, msg:'会话过期，请重新登录!'});
        //   return;
        // }

        var pageId = info.pageId === undefined ? 0 : info.pageId;
        var pageSize = info.pageSize === undefined ? 100 : info.pageSize;
        //计算总条数
        var sql = 'select count(*) as num from qp_player where locked=1';
        model.db.driver.execQuery(sql, function (err, results) {
            //错误信息
            if (err !== null) {
                res.status(200).json({code: error.DB_ERROR, msg: err});
                return;
            }
            //判断是否为空
            var num = results.length > 0 ? results[0].num : 0;
            if (num === 0) {
                res.status(200).json({
                    code: 200,
                    data: [],
                    page: {id: 0, num: 1},
                    session: utils.getSession(info.uid)
                });
                return;
            }
            var page = {id: pageId, num: Math.ceil(num / pageSize)};
            //查找详细数据
            var sql = 'select * from qp_player where locked=1 ORDER BY registerTime limit ' + pageSize + ' offset ' + (pageId * pageSize);
            model.db.driver.execQuery(sql, function (err, results) {
                //错误信息
                if (err !== null) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                    return;
                }
                res.status(200).json({code: 200, data: results, page: page, session: utils.getSession(info.uid)});
            });
        });
    },

    //封号列表查询(uid:查询人 pid:被查询人)
    getLockedPlayer: function (req, res) {
        var info = req.body;
        // if (!utils.verifySign(info, utils.getKey())) {
        //     res.status(200).json({code:error.SIGN_ERROR, msg:'安全验证失败!'});
        //     return;
        // }
        //
        // if (!utils.checkSession(info.uid, info.session)) {
        //     res.status(200).json({code:error.SESSION_EXPIRE, msg:'会话过期，请重新登录!'});
        //     return;
        // }
        //获取传输pid
        if (info.pid === undefined || info.pid === '') {
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '玩家不存在!'});
            return;
        }
        var sql = 'select * from qp_player where locked=1 and uid=' + info.pid;
        model.db.driver.execQuery(
            sql, function (err, results) {
                // console.log(err, results);
                if (err != null) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                    return;
                } else {
                    if (results.length == 0) {
                        res.status(200).json({code: 200, data: [], session: utils.getSession(info.uid)});
                        return;
                    } else {
                        res.status(200).json({code: 200, data: results, session: utils.getSession(info.uid)});
                        return;
                    }
                }
            });
    },

    // 记录点击邀请码链接的下载用户
    registerPlayer: function (req, res) {
        console.log('registerPlayer', req.body);

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
                'select unionid from qp_download_player where unionid=?', [result.data.unionid], function (err, results) {
                    console.log(err);
                    if (err != null) {
                        res.status(200).json({code: error.DB_ERROR, msg: '服务器异常, 请稍后再试!'});
                    } else if (results.length > 0) {
                        res.status(200).json({code: 200, data: 1});
                    } else {
                        model.db.driver.execQuery(  // serverType used as agentCode here
                            'insert into qp_download_player(unionid, agentCode) values(?, ?)', [result.data.unionid, req.body.serverType], function (err) {
                                console.log(err);
                                if (err != null) {
                                    res.status(200).json({code: error.DB_ERROR, msg: '服务器异常, 请稍后再试!'});
                                } else {
                                    res.status(200).json({code: 200, data: 1});
                                }
                            });
                    }
                });
        });
    }
}

module.exports = player;
