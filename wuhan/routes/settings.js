var async = require('async');
var error = require('../constants');
var model = require('../model');
var utils = require('../utils');

var settings = {
    load: function (req, res) {
        var userinfo = req.body;
        console.log(userinfo);

        // if (utils.checkSession(userinfo.uid, userinfo.session)) {
        model.user.find({uid: userinfo.uid}, 1, function (err, results) {
            var agentLevel = 0;
            if (err == null && results.length > 0)
                agentLevel = results[0].agentLevel;

            model.settings.find({}, function (err, results) {
                console.log(err, results);
                if (err != null) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {
                    var data = {};

                    for (var i = 0; i < results.length; i++) {
                        console.log(results[i].key);
                        if (results[i].key == 'cardPrice')
                            data.gemPrice = results[i].value;
                        else if (results[i].key == 'withdrawPrice')
                            data.withdrawPrice = results[i].value;
                        else if (results[i].key == 'playerBonusPercent') {
                            var rates = results[i].value.split('|');
                            data.normalRate1 = parseInt(rates[0]);
                            data.middleRate1 = rates.length > 1 ? parseInt(rates[1]) : 0;
                            data.highRate1 = rates.length > 2 ? parseInt(rates[2]) : 0;
                        }
                        else if (results[i].key == 'l2BonusPercent') {
                            var rates = results[i].value.split('|');
                            data.normalRate2 = parseInt(rates[0]);
                            data.middleRate2 = rates.length > 1 ? parseInt(rates[1]) : 0;
                        }
                        else if (results[i].key == 'l1BonusPercent') {
                            var rates = results[i].value.split('|');
                            data.normalRate3 = parseInt(rates[0]);
                        } else if (results[i].key == 'paySP') {
                            data.paySP = parseInt(results[i].value);
                        } else if (results[i].key == 'opcpSharing') {
                            data.opcpSharing = results[i].value;
                        } else if (results[i].key == 'manualWithdraw') {
                            data.manualWithdraw = results[i].value;
                        } else if (results[i].key == 'customBonusPercent') {
                            data.customBonusPercent = results[i].value;
                        } else if (results[i].key == 'bindAgentReward') {
                            data.bindAgentReward = results[i].value;
                        } else if (results[i].key == 'cancelAgentCondition') {
                            data.cancelAgentCondition = results[i].value;
                        } else if (results[i].key == 'customAgentCode') {
                            data.customAgentCode = results[i].value;
                        } else if (results[i].key == 'agentUsePhoneNum') {
                            data.agentUsePhoneNum = results[i].value;
                        } else if (results[i].key == 'agentCodeUseUID') {
                            data.agentCodeUseUID = results[i].value;
                        } else if (results[i].key == 'l1AgentCardPrice') {
                            data.l1AgentCardPrice = results[i].value;
                        } else if (results[i].key == 'l2AgentCardPrice') {
                            data.l2AgentCardPrice = results[i].value;
                        } else if (results[i].key == 'l3AgentCardPrice') {
                            data.l3AgentCardPrice = results[i].value;
                        } else {
                            data[results[i].key] = results[i].value;
                        }
                    }

                    if (agentLevel == 1 && data.l1AgentCardPrice != undefined && data.l1AgentCardPrice.length > 0) {
                        data.gemPrice = data.l1AgentCardPrice;
                    } else if (agentLevel == 2 && data.l2AgentCardPrice != undefined && data.l2AgentCardPrice.length > 0) {
                        data.gemPrice = data.l2AgentCardPrice;
                    } else if (agentLevel == 3 && data.l3AgentCardPrice != undefined && data.l3AgentCardPrice.length > 0) {
                        data.gemPrice = data.l3AgentCardPrice;
                    }

                    console.log(data);
                    res.status(200).json({code: 200, data: data/*, session:utils.getSession(userinfo.uid)*/});
                }
            });
        });
        // } else
        //   res.status(200).json({code:error.SESSION_EXPIRE, msg:'会话过期，请重新登录!'});
    },

    loadById: function (req, res) {
        var info = req.body;
        console.log(info);

        // if (utils.checkSession(userinfo.uid, userinfo.session)) {
        model.user.find({uid: info.uid}, 1, function (err, results) {
            var agentLevel = 0;
            if (err == null && results.length > 0)
                agentLevel = results[0].agentLevel;

            model.settings.find({}, function (err, results) {
                console.log(err, results);
                if (err != null) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {

                }
            });
        });
    },

    save: function (req, res) {
        var userinfo = req.body;
        // userinfo.settings=JSON.parse(userinfo.settings);
        console.log(userinfo);

        if (utils.checkSession(userinfo.uid, userinfo.session)) {
            model.user.find({uid: userinfo.uid}, 1, function (err, results) {
                console.log(err, results);
                if (err != null || results.length == 0) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {
                    if (results[0].isAgent <= 2) {
                        utils.operateLog(userinfo.uid, '修改运营参数但权限不够');
                        res.status(200).json({code: error.INT_ERROR, msg: '无操作权限'});
                    } else {
                        async.waterfall([
                            function (cb) { // 验证价格配置格式
                                model.settings.find({key: 'cardPrice'}, 1, function (err, results) {
                                    // console.log(err, results);
                                    if (err != null || results.length == 0) {
                                        cb({code: error.DB_ERROR, msg: err});
                                    } else {
                                        var price = results[0].value;
                                        console.log(price, userinfo.settings.gemPrice);
                                        if (price != userinfo.settings.gemPrice) {

                                            var is_error = false;
                                            var re = new RegExp(/\d+:\d+/i);
                                            var prices = userinfo.settings.gemPrice.split('|');
                                            for (var p in prices) {
                                                console.log(prices[p]);
                                                if (!re.test(prices[p])) {
                                                    is_error = true;
                                                    break;
                                                }
                                            }

                                            if (is_error) {
                                                cb({code: error.INT_ERROR, msg: '价格配置格式错误'});
                                            } else {
                                                results[0].save({value: userinfo.settings.gemPrice}, function (err) {
                                                    console.log('save Price', userinfo.settings.gemPrice, err);
                                                    if (err != null)
                                                        cb({code: error.DB_ERROR, msg: err});
                                                    else {
                                                        utils.operateLog(userinfo.uid, '修改运营价格:' + userinfo.settings.gemPrice);
                                                        cb(null);
                                                    }
                                                });
                                            }
                                        } else {
                                            cb(null);
                                        }
                                    }
                                });
                            },
                            function (cb) { // 修改玩家直接代理的充值提成
                                model.settings.find({key: 'playerBonusPercent'}, 1, function (err, results) {
                                    // console.log(err, results);
                                    if (err != null || results.length == 0) {
                                        cb({code: error.DB_ERROR, msg: err});
                                    } else {
                                        var playerBonusPercent = userinfo.settings.normalRate1 + '|' + userinfo.settings.middleRate1 + '|' + userinfo.settings.highRate1;
                                        {
                                            results[0].save({value: playerBonusPercent}, function (err) {
                                                console.log('save playerBonusPercent', playerBonusPercent, err);
                                                if (err != null)
                                                    cb({code: error.DB_ERROR, msg: err});
                                                else {
                                                    utils.operateLog(userinfo.uid, '修改直接代理提成:' + playerBonusPercent);
                                                    cb(null);
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            function (cb) { // 修改上级代理的充值提成
                                model.settings.find({key: 'l2BonusPercent'}, 1, function (err, results) {
                                    // console.log(err, results);
                                    if (err != null || results.length == 0) {
                                        cb({code: error.DB_ERROR, msg: err});
                                    } else {
                                        var l2BonusPercent = userinfo.settings.normalRate2 + '|' + userinfo.settings.middleRate2;
                                        {
                                            results[0].save({value: l2BonusPercent}, function (err) {
                                                console.log('save l2BonusPercent', l2BonusPercent, err);
                                                if (err != null)
                                                    cb({code: error.DB_ERROR, msg: err});
                                                else {
                                                    utils.operateLog(userinfo.uid, '修改上级代理提成:' + l2BonusPercent);
                                                    cb(null);
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            function (cb) { // 修改上上级代理的充值提成
                                model.settings.find({key: 'l1BonusPercent'}, 1, function (err, results) {
                                    // console.log(err, results);
                                    if (err != null || results.length == 0) {
                                        cb({code: error.DB_ERROR, msg: err});
                                    } else {
                                        var l1BonusPercent = userinfo.settings.normalRate3;
                                        {
                                            results[0].save({value: l1BonusPercent}, function (err) {
                                                console.log('save l1BonusPercent', l1BonusPercent, err);
                                                if (err != null)
                                                    cb({code: error.DB_ERROR, msg: err});
                                                else {
                                                    utils.operateLog(userinfo.uid, '修改上上级代理提成:' + l1BonusPercent);
                                                    cb(null);
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            function (cb) { // 修改联运分成比例
                                model.settings.find({key: 'opcpSharing'}, 1, function (err, results) {
                                    // console.log(err, results);
                                    if (err != null || results.length == 0) {
                                        cb({code: error.DB_ERROR, msg: err});
                                    } else {
                                        var opcpSharing = userinfo.settings.opcpSharing;
                                        {
                                            results[0].save({value: opcpSharing}, function (err) {
                                                console.log('save opcpSharing', opcpSharing, err);
                                                if (err != null)
                                                    cb({code: error.DB_ERROR, msg: err});
                                                else {
                                                    utils.operateLog(userinfo.uid, '修改联运分成比例:' + opcpSharing);
                                                    cb(null);
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            function (cb) { // 修改健康公告
                                model.settings.find({key: 'healthNotice'}, 1, function (err, results) {
                                    // console.log(err, results);
                                    if (err != null || results.length == 0) {
                                        cb({code: error.DB_ERROR, msg: err});
                                    } else {
                                        var healthNotice = userinfo.settings.healthNotice;
                                        {
                                            results[0].save({value: healthNotice}, function (err) {
                                                console.log('save healthNotice', healthNotice, err);
                                                if (err != null)
                                                    cb({code: error.DB_ERROR, msg: err});
                                                else {
                                                    utils.operateLog(userinfo.uid, '修改健康公告:' + healthNotice);
                                                    cb(null);
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            function (cb) { // 修改联系客服:
                                model.settings.find({key: 'kfWeChat'}, 1, function (err, results) {
                                    // console.log(err, results);
                                    if (err != null || results.length == 0) {
                                        cb({code: error.DB_ERROR, msg: err});
                                    } else {
                                        var kfWeChat = userinfo.settings.kfWeChat;
                                        {
                                            results[0].save({value: kfWeChat}, function (err) {
                                                console.log('save kfWeChat', kfWeChat, err);
                                                if (err != null)
                                                    cb({code: error.DB_ERROR, msg: err});
                                                else {
                                                    utils.operateLog(userinfo.uid, '修改联系客服:' + kfWeChat);
                                                    cb(null);
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            function (cb) { // 修改代理招募
                                model.settings.find({key: 'dlWeChat'}, 1, function (err, results) {
                                    // console.log(err, results);
                                    if (err != null || results.length == 0) {
                                        cb({code: error.DB_ERROR, msg: err});
                                    } else {
                                        var dlWeChat = userinfo.settings.dlWeChat;
                                        {
                                            results[0].save({value: dlWeChat}, function (err) {
                                                console.log('save dlWeChat', dlWeChat, err);
                                                if (err != null)
                                                    cb({code: error.DB_ERROR, msg: err});
                                                else {
                                                    utils.operateLog(userinfo.uid, '修改代理招募:' + dlWeChat);
                                                    cb(null);
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            function (cb) { // 修改房卡咨询
                                model.settings.find({key: 'fkWeChat'}, 1, function (err, results) {
                                    // console.log(err, results);
                                    if (err != null || results.length == 0) {
                                        cb({code: error.DB_ERROR, msg: err});
                                    } else {
                                        var fkWeChat = userinfo.settings.fkWeChat;
                                        {
                                            results[0].save({value: fkWeChat}, function (err) {
                                                console.log('save fkWeChat', fkWeChat, err);
                                                if (err != null)
                                                    cb({code: error.DB_ERROR, msg: err});
                                                else {
                                                    utils.operateLog(userinfo.uid, '修改房卡咨询:' + fkWeChat);
                                                    cb(null);
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            function (cb) { // 修改投诉举报
                                model.settings.find({key: 'tsWeChat'}, 1, function (err, results) {
                                    // console.log(err, results);
                                    if (err != null || results.length == 0) {
                                        cb({code: error.DB_ERROR, msg: err});
                                    } else {
                                        var tsWeChat = userinfo.settings.tsWeChat;
                                        {
                                            results[0].save({value: tsWeChat}, function (err) {
                                                console.log('save tsWeChat', tsWeChat, err);
                                                if (err != null)
                                                    cb({code: error.DB_ERROR, msg: err});
                                                else {
                                                    utils.operateLog(userinfo.uid, '修改投诉举报:' + tsWeChat);
                                                    cb(null);
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            function (cb) { // 修改奖池
                                model.settings.find({key: 'yylRewardTotalNum'}, 1, function (err, results) {
                                    // console.log(err, results);
                                    if (err != null || results.length == 0) {
                                        cb({code: error.DB_ERROR, msg: err});
                                    } else {
                                        var yylRewardTotalNum = userinfo.settings.yylRewardTotalNum;
                                        {
                                            results[0].save({value: yylRewardTotalNum}, function (err) {
                                                console.log('save yylRewardTotalNum', yylRewardTotalNum, err);
                                                if (err != null)
                                                    cb({code: error.DB_ERROR, msg: err});
                                                else {
                                                    utils.operateLog(userinfo.uid, '修改奖池金额:' + yylRewardTotalNum);
                                                    cb(null);
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            function (cb) { // 修改奖池
                                if (info.flag === 'yylRateSet'){
                                    model.settings.find({key: 'yylRateSet'}, 1, function (err, results) {
                                        // console.log(err, results);
                                        if (err != null || results.length == 0) {
                                            cb({code: error.DB_ERROR, msg: err});
                                        } else {
                                            var yylRateSet = userinfo.settings.yylRateSet;
                                            {
                                                results[0].save({value: yylRateSet}, function (err) {
                                                    console.log('save yylRateSet', yylRateSet, err);
                                                    if (err != null)
                                                        cb({code: error.DB_ERROR, msg: err});
                                                    else {
                                                        utils.operateLog(userinfo.uid, '修改摇摇乐概率:' + yylRateSet);
                                                        //通知游戏端刷新概率
                                                        utils.postToGameSrv('/yyl/refreshRate', {});
                                                        cb(null);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                                cb(null);
                            },
                        ], function (err) {
                            if (err)
                                res.status(200).json(err);
                            else {
                                res.status(200).json({code: 200, data: 1, session: utils.getSession(userinfo.uid)});
                            }
                        });
                    }
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    }
}

module.exports = settings;
