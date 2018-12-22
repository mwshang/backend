var async = require('async');
var error = require('../constants');
var model = require('../model');
var utils = require('../utils');
var moment = require('moment');
var area = require('../area');
//var config = require('./config/config');

//todo: 乘以0.5
//设置获取活跃是否减半
var isround = false;

var data = {
    // 统计每日数据
    produce: function () {
        var daily = {
            usedCards: 0,
            buyCards: 0,
            rewardCards: 0,
            newUsers: 0,
            activeUsers: 0,
            totalUsers: 0,
            incomeTotal: 0,
            apBonusIn: 0,
            apBonusOut: 0,
            leftCards: 0,
            openTables: 0
        };

        var star = moment().subtract(1, "day").format("YYYY-MM-D") + " 00:00:00";//开始时间
        var end = moment().subtract(1, "day").format("YYYY-MM-DD") + " 23:59:59";//结束时间
        //获取前一天日期
        var date = moment().subtract(1, "day").format("YYYYMMDD");
        async.waterfall([
            function (cb) {     // 计算每日消耗房卡数量
                model.db.driver.execQuery('SELECT sum(usedCards) as usedCards FROM qp_10mindata WHERE createdTime>=? and createdTime<= ?;', [star, end], function (err, data) {
                    if (err == null) {
                        console.log('used', data[0].usedCards);
                        daily.usedCards = data[0].usedCards;
                        //房卡消耗减半
                        if (isround) {
                            daily.usedCards = Math.round(daily.usedCards * 0.5);
                        }
                    }
                    cb(err, daily);
                });
            },
            function (daily, cb) {     // 计算每日新增用户
                model.db.driver.execQuery(
                    "SELECT count(uid) as num FROM qp_player WHERE registerTime>='" + star + "' and registerTime<='" + end + "';", function (err, data) {
                        if (err == null) {
                            console.log('newuser', data[0].num);
                            daily.newUsers = data[0].num;
                            //新增用户减半
                            if (isround) {
                                daily.newUsers = Math.round(daily.newUsers * 0.5);
                            }
                        }
                        cb(err, daily);
                    });
            },
            function (daily, cb) {     // 计算每日总用户
                model.db.driver.execQuery(
                    "SELECT count(uid) as num FROM qp_player;", function (err, data) {
                        if (err == null) {
                            console.log('totalUsers', data[0].num);
                            daily.totalUsers = data[0].num;
                            //总用户减半
                            if (isround) {
                                daily.totalUsers = Math.round(daily.totalUsers * 0.5);
                            }
                        }

                        cb(err, daily);
                    });
            },
            function (daily, cb) {     // 计算每日活跃用户
                var sql = "select count(distinct t1.udid) as num from (  \
        select uid1 as udid from qp_playerHuiFang  \
        UNION \
        select uid2 as udid from qp_playerHuiFang \
        UNION  \
        select uid3 as udid from qp_playerHuiFang \
        UNION \
        select uid4 as udid from qp_playerHuiFang \
        UNION \
        select uid5 as udid from qp_playerHuiFang \
        UNION \
        select uid6 as udid from qp_playerHuiFang \
        UNION \
        select uid7 as udid from qp_playerHuiFang \
        UNION \
        select uid8 as udid from qp_playerHuiFang \
        ) as t1";

                model.db.driver.execQuery(sql, function (err, data) {
                    if (err == null) {
                        console.log('activeuser', data[0].num);
                        daily.activeUsers = data[0].num > 0 ? data[0].num - 1 : 0;
                        //活跃减半
                        if (isround) {
                            daily.activeUsers = Math.round(daily.activeUsers * 0.5);
                        }
                    }

                    cb(err, daily);
                });
            },
            function (daily, cb) {     // 计算每日总营收
                model.db.driver.execQuery(
                    "SELECT sum(orderAmount) as income FROM qp_payrecord WHERE completeTime=? AND status=1;", [date], function (err, data) {
                        if (err == null) {
                            console.log('incomeTotal', data[0].income);
                            daily.incomeTotal = data[0].income;
                        }
                        cb(err, daily);
                    });
            },
            //查看当前是几级分层
            function (daily, cb) {
                model.settings.find({key: 'use10AgentLevel'}, function (err, data) {
                    if (data.length == 0 || !!err) {
                        console.log('user10AgentLevel false');
                        cb(err, daily, false);
                    } else {
                        console.log('user10AgentLevel true');
                        cb(err, daily, true);
                    }
                });
            },
            // 计算每日AP获佣
            function (daily, user10AgentLevel, cb) {
                if (!user10AgentLevel) {
                    var sql = "SELECT sum(l1Bonus) as l1Bonus,sum(l2Bonus) AS l2Bonus, sum(playerBonus) AS playerBonus," +
                        " 0 AS extl3Bonus,0 AS extl4Bonus,0 AS extl5Bonus,0 AS extl6Bonus,0 AS extl7Bonus,0 AS extl8Bonus," +
                        " 0 AS extl9Bonus from qp_fangkabonusin  WHERE   createTime>='" + star + "' and createTime<='" + end + "';";
                } else {
                    var sql = "SELECT sum(l1Bonus) as l1Bonus,sum(l2Bonus) AS l2Bonus, sum(playerBonus) AS playerBonus," +
                        "sum(extl3Bonus) AS extl3Bonus,sum(extl4Bonus) AS extl4Bonus,sum(extl5Bonus) AS extl5Bonus," +
                        "sum(extl6Bonus) AS extl6Bonus,sum(extl7Bonus) AS extl7Bonus,sum(extl8Bonus) AS extl8Bonus," +
                        "sum(extl9Bonus) AS extl9Bonus from qp_fangkabonusin  WHERE   createTime>='" + star + "' and createTime<='" + end + "';"
                }
                model.db.driver.execQuery(sql, function (err, data) {
                    if (err == null) {
                        console.log('apBonusIn', data[0].l1Bonus, data[0].l2Bonus, data[0].playerBonus, data[0].extl3Bonus, data[0].extl4Bonus, data[0].extl5Bonus, data[0].extl6Bonus, data[0].extl7Bonus, data[0].extl8Bonus, data[0].extl9Bonus);
                        daily.apBonusIn = data[0].l1Bonus + data[0].l2Bonus + data[0].playerBonus + data[0].extl3Bonus + data[0].extl4Bonus + data[0].extl5Bonus + data[0].extl6Bonus + data[0].extl7Bonus + data[0].extl8Bonus + data[0].extl9Bonus;
                    }
                    cb(err, daily);
                });
            },
            function (daily, cb) {     // 计算每日AP提现
                model.db.driver.execQuery(
                    "SELECT sum(cny) as apBonusOut FROM qp_fangkabonusout WHERE completeTime=? AND status=1;", [date], function (err, data) {
                        if (err == null) {
                            console.log('apBonusOut', data[0].apBonusOut);
                            daily.apBonusOut = data[0].apBonusOut;
                        }

                        cb(err, daily);
                    });
            },
            function (daily, cb) {     // 计算每日开局数
                model.db.driver.execQuery(
                    "SELECT sum(openTables) as openTables FROM qp_10mindata WHERE createdTime>='" + star + "' and createdTime<='" + end + "' ;", function (err, data) {
                        if (err == null) {
                            console.log('openTables', data[0].openTables);
                            daily.openTables = data[0].openTables;
                        }
                        //开局数减半
                        if (isround) {
                            daily.openTables = Math.round(daily.openTables * 0.5);
                        }
                        cb(err, daily);
                    });
            },
            function (daily, cb) {     // 计算每日充卡数
                model.db.driver.execQuery(
                    "SELECT sum(productNum) as buyCards FROM qp_payrecord WHERE status=1 AND completeTime=? ;", [date], function (err, data) {
                        if (err == null) {
                            console.log('buyCards', data[0].buyCards);
                            daily.buyCards = data[0].buyCards;
                        }

                        cb(err, daily);
                    });
            },
            function (daily, cb) {     // 计算每日赠送卡数
                model.db.driver.execQuery(
                    "SELECT sum(rewardNum) as rewardCards FROM qp_fangkarecord WHERE  recordTime>='" + star + "' and recordTime<='" + end + "';", function (err, data) {
                        if (err == null) {
                            console.log('rewardCards', data[0].rewardCards);
                            daily.rewardCards = data[0].rewardCards;
                        }
                        cb(err, daily);
                    });
            },
            function (daily, cb) {     // 计算每日剩余总房卡数
                model.db.driver.execQuery(
                    //统计剔除测试账号,客服账号,总代账号
                    "SELECT sum(gemNum) as leftCards FROM qp_player where vipLevel < 90;", function (err, data) {
                        if (err == null) {
                            console.log('leftCards', data[0].leftCards);
                            daily.leftCards = data[0].leftCards;
                            //剩余房卡减半
                            if (isround) {
                                daily.leftCards = Math.round(daily.leftCards * 0.5);
                            }
                        }
                        cb(err, daily);
                    });
            },
            //todo:启东暂时增加
            // function(daily,cb){   //计算每日分享次数
            //     model.db.driver.execQuery(
            //         'select count(uid) as shareFriend from qp_rewardGemInfo where type = 1 and datediff(curdate(), createTime)=1;', function(err,data){
            //             if (err == null){
            //                 console.log('shareFriend', data[0].shareFriend);
            //                 daily.shareFriend = data[0].shareFriend;
            //             }
            //             cb(err, daily);
            //         }
            //     )
            // }
        ], function (err, daily) {
            if (err)
                console.log('昨日统计失败:', err);
            else {
                console.log('昨日统计完成:', daily);

                var newRecord = {};
                newRecord.newUsers = daily.newUsers;
                newRecord.activeUsers = daily.activeUsers;
                newRecord.totalUsers = daily.totalUsers;
                newRecord.buyCards = daily.buyCards;
                newRecord.usedCards = daily.usedCards;
                newRecord.incomeTotal = daily.incomeTotal;
                newRecord.apBonusIn = daily.apBonusIn;
                newRecord.apBonusOut = daily.apBonusOut;
                newRecord.leftCards = daily.leftCards;
                newRecord.openTables = daily.openTables;
                newRecord.rewardCards = daily.rewardCards;
                //todo:启东暂时增加
                //newRecord.shareFriend = daily.shareFriend;

                model.dailyData.create(newRecord, function (err, results) {
                    if (err != null) {
                        console.error('add dailyData failed ', err);
                    }
                });
            }
        });

        // data.produceDataExt();
        // data.producePlayData();
    },
    clear_leave_over:function() {
        async.waterfall([
            function (cb) {     
                model.db.driver.execQuery(
                    "SELECT table_name FROM information_schema.TABLES WHERE table_schema = 'wuhan' and table_name like 'qp_playerhuifang%'", function (err, data) {
                        if (err == null) {
                            //获取3天前天数
                            var day =moment().subtract(4, 'day').format('YYYYMMDD')
                            var table_name="qp_playerhuifang"
                            var sql_drop="drop table "
                            //遍历获取相似表名
                            for(var i=0;i<data.length;i++){
                                //获取表名后缀时间
                              
                                if(!("table_name" in data[i])) break
                                var table_time=data[i].table_name.slice(table_name.length)
                                if(table_time.length==8){
                                    //判断表明后面时间是否在3天前
                                    var isbefore=moment(day).isBefore(table_time)
                                    if(!isbefore){
                                        //不是就+到sql drop
                                        sql_drop+=table_name+table_time+","
                                    }
                                }
                            }
                            //sql drop最后一个字符，去掉
                            sql_drop=sql_drop.substring(0,sql_drop.length-1)
                            if(sql_drop=="drop table"||sql_drop=="drop table "){
                                console.log("无遗留数据")
                                cb(err);
                                return
                            }
                            model.db.driver.execQuery(sql_drop, function (err,data) {
                                cb(err);
                          });
                        }
                        
                    });
            }
        ], function (err) {
            if (err)
                console.log('清除遗留数据失败:', err);
            else {
                console.log('清除遗留数据完成');
            }
        });
    },
    // 按游戏统计活跃、消耗和开局数等(每天第二天切表后运行)
    produceDataExt: function () {
        var extData = {};
        //拼接表名
        var table = 'qp_playerHuiFang' + moment().subtract(1, 'day').format('YYYYMMDD');
        async.waterfall([
            function (cb) {     // 按游戏算昨日消耗房卡数量
                model.db.driver.execQuery(
                    "SELECT serverType, sum(type) as num FROM " + table + " GROUP BY serverType", function (err, data) {
                        if (err == null) {
                            for (var i = 0; i < data.length; i++) {
                                if (extData[data[i].serverType] == undefined) {
                                    if (isround) {
                                        //todo: 乘以0.5
                                        extData[data[i].serverType] = {usedCards: Math.round(data[i].num * 0.5)};
                                    } else {
                                        extData[data[i].serverType] = {usedCards: data[i].num};
                                    }
                                } else {
                                    if (isround) {
                                        //todo: 乘以0.5
                                        extData[data[i].serverType]['usedCards'] = Math.round(data[i].num * 0.5);
                                    } else {
                                        extData[data[i].serverType]['usedCards'] = data[i].num;
                                    }
                                }
                            }
                        }
                        cb(err);
                    });
            },
            function (cb) {     // 按游戏算昨日活跃用户
                var sql = "select count(distinct t1.udid) as num, serverType from (  \
        select (concat(uid1, serverType)) as t, uid1 as udid, serverType  \
        from " + table + " where uid1>0 \
        UNION \
        select (concat(uid2, serverType)) as t, uid2 as udid, serverType \
        from " + table + " where uid2>0  \
        UNION  \
        select (concat(uid3, serverType)) as t, uid3 as udid, serverType \
        from " + table + " where uid3>0  \
        UNION \
        select (concat(uid4, serverType)) as t, uid4 as udid, serverType  \
        from " + table + " where uid4>0  \
        UNION \
        select (concat(uid5, serverType)) as t, uid5 as udid, serverType  \
        from " + table + " where uid5>0  \
        UNION \
        select (concat(uid6, serverType)) as t, uid6 as udid, serverType  \
        from " + table + " where uid6>0  \
        UNION \
        select (concat(uid7, serverType)) as t, uid7 as udid, serverType  \
        from " + table + " where uid7>0  \
        UNION \
        select (concat(uid8, serverType)) as t, uid8 as udid, serverType  \
        from  " + table + " where uid8>0  \
        ) as t1 GROUP BY t1.serverType";

                model.db.driver.execQuery(sql, function (err, data) {
                    if (err == null) {
                        for (var i = 0; i < data.length; i++) {
                            if (extData[data[i].serverType] == undefined) {
                                extData[data[i].serverType] = {activeUsers: data[i].num};
                            } else {
                                if (isround) {
                                    //todo: 乘以0.5
                                    extData[data[i].serverType]['activeUsers'] = Math.round(data[i].num * 0.5);
                                } else {
                                    extData[data[i].serverType]['activeUsers'] = data[i].num;
                                }
                            }
                        }
                    }
                    cb(err);
                });
            },
            function (cb) {     //按游戏算昨日开局数
                model.db.driver.execQuery(
                    "SELECT serverType, count(id) as num FROM " + table + " GROUP BY serverType", function (err, data) {
                        if (err == null) {
                            for (var i = 0; i < data.length; i++) {
                                if (extData[data[i].serverType] == undefined) {
                                    extData[data[i].serverType] = {openTables: data[i].num};
                                } else {
                                    if (isround) {
                                        //todo: 乘以0.5
                                        extData[data[i].serverType]['openTables'] = Math.round(data[i].num * 0.5);
                                    } else {
                                        extData[data[i].serverType]['openTables'] = data[i].num;
                                    }
                                }
                            }
                        }
                        cb(err);
                    });
            },
        ], function (err) {
            if (err)
                console.log('按游戏统计昨日数据失败:', err);
            else {
                console.log('按游戏统计昨日数据完成:', extData);
                var sql = 'INSERT INTO qp_dailydata_ext(serverType, activeUsers, usedCards, openTables) VALUES ';
                var serverTypes = Object.keys(extData);
                if (serverTypes.length == 0) {
                    return;
                }
                for (var i = 0; i < serverTypes.length; i++) {
                    if (i > 0)
                        sql += ',';
                    sql += '(\'' + serverTypes[i] + '\',' + extData[serverTypes[i]]['activeUsers']
                        + ',' + extData[serverTypes[i]]['usedCards'] + ',' + extData[serverTypes[i]]['openTables'] + ')';
                }
                console.log(sql);
                model.db.driver.execQuery(sql, function (err, result) {
                    if (err != null) {
                        console.error('add dailyDataExt failed ', err);
                    }
                });
            }
        });
    },

    // 统计玩家胜率 得分等(每天第二天切表后运行)
    producePlayData: function () {
        //拼接表名
        var table = 'qp_playerHuiFang' + moment().subtract(1, 'day').format('YYYYMMDD');

        var _query = function (huifangs, callback) {
            var queries = [];
            var j = 0;
            for (var r in huifangs) {
                queries.push(function (cb) {
                    var huifang = huifangs[j];
                    j++;

                    var playData = {};
                    playData['uid1'] = huifang.uid1;
                    playData['uid2'] = huifang.uid2;
                    playData['uid3'] = huifang.uid3;
                    playData['uid4'] = huifang.uid4;
                    playData['uid5'] = huifang.uid5;
                    playData['uid6'] = huifang.uid6;
                    playData['uid7'] = huifang.uid7;
                    playData['uid8'] = huifang.uid8;
                    playData['ownerId'] = huifang.fangZhu;
                    playData['tableId'] = huifang.fangHao;
                    playData['serverType'] = huifang.serverType;
                    playData['score1'] = 0;
                    playData['score2'] = 0;
                    playData['score3'] = 0;
                    playData['score4'] = 0;
                    playData['score5'] = 0;
                    playData['score6'] = 0;
                    playData['score7'] = 0;
                    playData['score8'] = 0;

                    var winNum = {};
                    winNum['uid1'] = 0;
                    winNum['uid2'] = 0;
                    winNum['uid3'] = 0;
                    winNum['uid4'] = 0;
                    winNum['uid5'] = 0;
                    winNum['uid6'] = 0;
                    winNum['uid7'] = 0;
                    winNum['uid8'] = 0;

                    var record = JSON.parse(huifang.record);
                    //console.log(record);
                    for (var i = 0; i < record.length; i++) {
                        var one = record[i]['result'];
                        //console.log(one);
                        for (var k = 0; k < one.length; k++) {
                            if (one[k].uid == playData['uid1']) {
                                playData['score1'] += one[k].winScore;
                                if (one[k].winScore > 0)
                                    winNum['uid1']++;
                            } else if (one[k].uid == playData['uid2']) {
                                playData['score2'] += one[k].winScore;
                                if (one[k].winScore > 0)
                                    winNum['uid2']++;
                            } else if (one[k].uid == playData['uid3']) {
                                playData['score3'] += one[k].winScore;
                                if (one[k].winScore > 0)
                                    winNum['uid3']++;
                            } else if (one[k].uid == playData['uid4']) {
                                playData['score4'] += one[k].winScore;
                                if (one[k].winScore > 0)
                                    winNum['uid4']++;
                            } else if (one[k].uid == playData['uid5']) {
                                playData['score5'] += one[k].winScore;
                                if (one[k].winScore > 0)
                                    winNum['uid5']++;
                            } else if (one[k].uid == playData['uid6']) {
                                playData['score6'] += one[k].winScore;
                                if (one[k].winScore > 0)
                                    winNum['uid6']++;
                            } else if (one[k].uid == playData['uid7']) {
                                playData['score7'] += one[k].winScore;
                                if (one[k].winScore > 0)
                                    winNum['uid7']++;
                            } else if (one[k].uid == playData['uid8']) {
                                playData['score8'] += one[k].winScore;
                                if (one[k].winScore > 0)
                                    winNum['uid8']++;
                            }
                        }
                    }

                    playData['ratio1'] = (winNum['uid1'] / record.length).toFixed(2);
                    playData['ratio2'] = (winNum['uid2'] / record.length).toFixed(2);
                    playData['ratio3'] = (winNum['uid3'] / record.length).toFixed(2);
                    playData['ratio4'] = (winNum['uid4'] / record.length).toFixed(2);
                    playData['ratio5'] = (winNum['uid5'] / record.length).toFixed(2);
                    playData['ratio6'] = (winNum['uid6'] / record.length).toFixed(2);
                    playData['ratio7'] = (winNum['uid7'] / record.length).toFixed(2);
                    playData['ratio8'] = (winNum['uid8'] / record.length).toFixed(2);

                    //console.log('playData: ', playData);
                    model.playData.create(playData, function (err, result) {
                        if (err != null) {
                            console.error('add playData failed ', err);
                        }
                        cb(err);
                    });
                });
            }

            async.parallel(queries,
                function (err) {
                    callback(err);
                });
        };

        async.waterfall([
            function (cb) { // 获取昨天开桌总数
                model.db.driver.execQuery(
                    "SELECT count(id) as num FROM " + table + ";", function (err, data) {
                        cb(err, data.length > 0 ? data[0].num : 0);
                    });
            },
            function (num, cb) {     // 按100条一批进行计算
                var count = parseInt(num / 100);
                if (num % 100 > 0)
                    count++;

                var queries = [];
                var j = 0;
                for (var i = 0; i < count; i++) {
                    queries.push(function (cb1) {
                        model.db.driver.execQuery(
                            "SELECT * FROM " + table + " limit 100 offset " + (j * 100), function (err, data) {
                                if (err != null) {
                                    cb1(err);
                                } else {
                                    _query(data, function (err) {
                                        cb1(err);
                                    });
                                }
                            });
                        console.log(j);
                        j++;
                    });
                }

                async.parallel(queries,
                    function (err) {
                        cb(err);
                    });

            },
        ], function (err) {
            if (err)
                console.log('统计昨日战绩数据失败:', err);
            else {
                console.log('统计昨日战绩数据完成');
            }
        });
    },

    // 10分钟实时统计
    produce10min: function () {
        var min10 = {usedCards: 0, buyCards: 0, newUsers: 0, activeUsers: 0, leftCards: 0, openTables: 0};
        //现在
        var now = "'" + moment().format('YYYY-MM-DD HH:') + parseInt(moment().format('m') / 10) + '0:00' + "'";
        //10分钟前
        var begin = "'" + moment().minutes(moment(moment().format('YYYY-MM-DD HH:') + parseInt(moment().format('m') / 10) + '0').minutes() - 10).format('YYYY/MM/DD HH:mm') + ':00' + "'";

        async.waterfall([
            function (cb) {     // 计算每10分钟消耗房卡数量
                var sql = "SELECT sum(type) as num FROM qp_playerHuiFang WHERE recordTime > " + begin + " AND recordTime <= " + now;
                model.db.driver.execQuery(sql, function (err, data) {
                    if (err == null) {
                        min10.usedCards = data[0].num == null ? 0 : data[0].num;
                    }
                    cb(err);
                });
            },
            function (cb) {     // 计算每10分钟新增用户
                model.db.driver.execQuery(
                    "SELECT count(uid) as num FROM qp_player WHERE registerTime > " + begin +
                    " AND registerTime <= " + now, function (err, data) {
                        if (err == null) {
                            min10.newUsers = data[0].num == null ? 0 : data[0].num;
                        }

                        cb(err);
                    });
            },
            function (cb) {     // 计算每10分钟活跃用户
                var sql = "select count(distinct t1.udid) as num from (  \
        select uid1 as udid  \
        from qp_playerHuiFang where recordTime > " + begin + " AND recordTime <= " + now + " \
        UNION \
        select uid2 as udid \
        from qp_playerHuiFang where recordTime > " + begin + " AND recordTime <= " + now + " \
        UNION  \
        select uid3 as udid \
        from qp_playerHuiFang where recordTime > " + begin + " AND recordTime <= " + now + " \
        UNION \
        select uid4 as udid  \
        from qp_playerHuiFang where recordTime > " + begin + " AND recordTime <= " + now + " \
        UNION \
        select uid5 as udid  \
        from qp_playerHuiFang where recordTime > " + begin + " AND recordTime <= " + now + " \
        UNION \
        select uid6 as udid  \
        from qp_playerHuiFang where recordTime > " + begin + " AND recordTime <= " + now + " \
        UNION \
        select uid7 as udid  \
        from qp_playerHuiFang where recordTime > " + begin + " AND recordTime <= " + now + " \
        UNION \
        select uid8 as udid  \
        from qp_playerHuiFang where recordTime > " + begin + " AND recordTime <= " + now + " \
        ) as t1";

                model.db.driver.execQuery(sql, function (err, data) {
                    if (err == null) {
                        min10.activeUsers = data[0].num > 0 ? data[0].num - 1 : 0;
                    }

                    cb(err);
                });
            },
            function (cb) {     // 计算每10分钟充卡数
                model.db.driver.execQuery(
                    "SELECT sum(productNum) as buyCards FROM qp_payrecord WHERE status=1 AND orderTime > " + begin +
                    " AND orderTime <= " + now, function (err, data) {
                        if (err == null) {
                            min10.buyCards = data[0].buyCards == null ? 0 : data[0].buyCards;
                        }

                        cb(err);
                    });
            },
            function (cb) {     // 计算每10分钟开局数
                model.db.driver.execQuery(
                    "SELECT count(id) as openTables FROM qp_playerHuiFang WHERE recordTime > " + begin +
                    " AND recordTime <= " + now, function (err, data) {
                        if (err == null) {
                            min10.openTables = data[0].openTables == null ? 0 : data[0].openTables;
                        }

                        cb(err);
                    });
            },
            function (cb) {     // 计算每10分钟剩余总房卡数
                model.db.driver.execQuery(
                    //统计剔除测试账号,客服账号,总代账号
                    "SELECT sum(gemNum) as leftCards FROM qp_player where vipLevel < 90;", function (err, data) {
                        if (err == null) {
                            min10.leftCards = data[0].leftCards;
                        }

                        cb(err);
                    });
            },
        ], function (err) {
            if (err)
                console.log('10分钟统计失败:', err);
            else {
                console.log('10分钟统计完成:', min10);

                var newRecord = {};
                newRecord.newUsers = min10.newUsers;
                newRecord.activeUsers = min10.activeUsers;
                newRecord.buyCards = min10.buyCards;
                newRecord.usedCards = min10.usedCards;
                newRecord.openTables = min10.openTables;
                newRecord.leftCards = min10.leftCards;

                model.min10Data.create(newRecord, function (err, results) {
                    if (err != null) {
                        console.error('add min10Data failed ', err);
                    }
                });
            }
        });
    },

    // 游戏数据
    operatordata: function (req, res) { // 游戏数据
        var info = req.body;
        if (utils.checkSession(info.uid, info.session)) {
            // var now = moment().unix();
            // var threshold = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
            var todayBegin = 0, todayEnd = 0;
            // if (now > threshold) {
            //   todayBegin = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
            //   todayEnd = moment().hours(23).minutes(59).seconds(59).milliseconds(0).unix();
            // } else {
            //   todayBegin = moment().date(moment().date()-1).hours(4).minutes(30).seconds(0).milliseconds(0).unix();
            //   todayEnd = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
            // }

            todayBegin = moment().hours(0).minutes(0).seconds(0).milliseconds(0).unix();
            todayEnd = moment().hours(23).minutes(59).seconds(59).milliseconds(0).unix();

            var sql = " ";

            var today = {
                usedCards: 0,
                buyCards: 0,
                newUsers: 0,
                activeUsers: 0,
                incomeTotal: 0,
                apBonusIn: 0,
                apBonusOut: 0,
                openTables: 0
            };
            var yesterday = {};
            var week = {};
            var halfMonth = {};
            var month = {};
            var lastMonth = {};
            var year = {};

            async.waterfall([
                function (cb) { // 昨日数据
                    var _sql = "SELECT * FROM qp_dailydata WHERE datediff(curdate(), createdTime)=0";
                    model.db.driver.execQuery(_sql, function (err, data) {
                        console.log(err, data);
                        if (data.length > 0)
                            yesterday = data[0];
                        cb(err);
                    });
                },
                function (cb) { // 7日数据
                    model.db.driver.execQuery(
                        "SELECT sum(newUsers) as newUsers, sum(usedCards) as usedCards, sum(incomeTotal) as incomeTotal, sum(apBonusIn) as apBonusIn, " +
                        " sum(buyCards) as buyCards, sum(activeUsers) as activeUsers, sum(openTables) as openTables " +
                        "FROM qp_dailydata WHERE datediff(curdate(), createdTime)>=0 AND datediff(curdate(), createdTime)<=5;", function (err, data) {
                            console.log(err, data);
                            week = data[0];
                            cb(err);
                        });
                },
                function (cb) { // 15日数据
                    model.db.driver.execQuery(
                        "SELECT sum(newUsers) as newUsers, sum(usedCards) as usedCards, sum(incomeTotal) as incomeTotal, sum(apBonusIn) as apBonusIn, " +
                        " sum(buyCards) as buyCards, sum(activeUsers) as activeUsers, sum(openTables) as openTables " +
                        "FROM qp_dailydata WHERE datediff(curdate(), createdTime)>=0 AND datediff(curdate(), createdTime)<=13;", function (err, data) {
                            console.log(err, data);
                            halfMonth = data[0];
                            cb(err);
                        });
                },
                function (cb) { // 本月数据
                    var begin = moment().date(2).hours(0).minutes(0).seconds(0).milliseconds(0).unix();
                    var end = moment().month(moment().month() + 1).date(1).hours(23).minutes(59).seconds(59).milliseconds(0).unix();

                    model.db.driver.execQuery(
                        "SELECT sum(newUsers) as newUsers, sum(usedCards) as usedCards, sum(incomeTotal) as incomeTotal, sum(apBonusIn) as apBonusIn, " +
                        " sum(buyCards) as buyCards, sum(activeUsers) as activeUsers, sum(openTables) as openTables " +
                        "FROM qp_dailydata WHERE unix_timestamp(createdTime)>=" + begin + " AND unix_timestamp(createdTime)<=" + end, function (err, data) {
                            console.log(err, data);
                            month = data[0];
                            cb(err);
                        });
                },
                function (cb) { // 上月数据
                    var begin = moment().month(moment().month() - 1).date(2).hours(0).minutes(0).seconds(0).milliseconds(0).unix();
                    var end = moment().date(1).hours(23).minutes(59).seconds(59).milliseconds(0).unix();

                    model.db.driver.execQuery(
                        "SELECT sum(newUsers) as newUsers, sum(usedCards) as usedCards, sum(incomeTotal) as incomeTotal, sum(apBonusIn) as apBonusIn, " +
                        " sum(buyCards) as buyCards, sum(activeUsers) as activeUsers, sum(openTables) as openTables " +
                        "FROM qp_dailydata WHERE unix_timestamp(createdTime)>=" + begin + " AND unix_timestamp(createdTime)<=" + end, function (err, data) {
                            console.log(err, data);
                            lastMonth = data[0];
                            cb(err);
                        });
                },
                function (cb) { // 本年数据
                    var begin = moment().month(0).date(2).hours(0).minutes(0).seconds(0).milliseconds(0).unix();
                    var end = moment().year(moment().year() + 1).month(0).date(1).hours(23).minutes(59).seconds(59).milliseconds(0).unix();

                    model.db.driver.execQuery(
                        "SELECT sum(newUsers) as newUsers, sum(usedCards) as usedCards, sum(incomeTotal) as incomeTotal, sum(apBonusIn) as apBonusIn, " +
                        " sum(buyCards) as buyCards, sum(activeUsers) as activeUsers, sum(openTables) as openTables " +
                        " FROM qp_dailydata WHERE unix_timestamp(createdTime)>=" + begin + " AND unix_timestamp(createdTime)<=" + end, function (err, data) {
                            console.log(err, data);
                            year = data[0];
                            cb(err);
                        });
                },
                function (cb) {     // 计算每日消耗房卡数量
                    model.db.driver.execQuery(
                        "SELECT sum(usedCards) as usedCards FROM qp_10mindata WHERE datediff(curdate(), createdTime)=0;", function (err, data) {
                            if (err == null) {
                                console.log('used', data[0].usedCards);
                                today.usedCards = data[0].usedCards;
                            }
                            cb(err);
                        });
                },
                function (cb) {     // 计算每日新增用户
                    model.db.driver.execQuery(
                        "SELECT count(uid) as num FROM qp_player WHERE datediff(curdate(), registerTime)=0;", function (err, data) {
                            if (err == null) {
                                console.log('newuser', data[0].num);
                                today.newUsers = data[0].num;
                            }

                            cb(err);
                        });
                },
                function (cb) {     // 计算每日活跃用户
                    var sql = "select count(distinct t1.udid) as num from (  \
            select uid1 as udid  \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
                    sql += " UNION \
            select uid2 as udid \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
                    sql += " UNION \
            select uid3 as udid \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
                    sql += " UNION \
            select uid4 as udid  \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
                    sql += " UNION \
            select uid5 as udid  \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
                    sql += " UNION \
            select uid6 as udid  \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
                    sql += " UNION \
            select uid7 as udid  \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
                    sql += " UNION \
            select uid8 as udid  \
            from qp_playerHuiFang where unix_timestamp(recordTime) >= " + todayBegin + " AND unix_timestamp(recordTime) < " + todayEnd;
                    sql += ") as t1";

                    model.db.driver.execQuery(sql, function (err, data) {
                        if (err == null) {
                            console.log('activeuser', data[0].num);
                            today.activeUsers = data[0].num > 0 ? data[0].num - 1 : 0;
                        }

                        cb(err);
                    });
                },
                function (cb) {     // 计算每日总营收
                    model.db.driver.execQuery(
                        "SELECT sum(orderAmount) as income FROM qp_payrecord WHERE datediff(curdate(), orderTime)=0 AND status=1;", function (err, data) {
                            if (err == null) {
                                console.log('incomeTotal', data[0].income);
                                today.incomeTotal = data[0].income;
                            }

                            cb(err);
                        });
                },
                function (cb) {     // 计算每日AP佣金
                    model.db.driver.execQuery(
                        "SELECT sum(l1Bonus) as l1Bonus, sum(l2Bonus) as l2Bonus, sum(playerBonus) as playerBonus " +
                        "FROM qp_fangkabonusin WHERE datediff(curdate(), createTime)=0;", function (err, data) {
                            if (err == null) {
                                console.log('apBonusIn', data[0].l1Bonus, data[0].l2Bonus, data[0].playerBonus);
                                today.apBonusIn = data[0].l1Bonus + data[0].l2Bonus + data[0].playerBonus;
                            }

                            cb(err);
                        });
                },
                function (cb) {     // 计算每日AP提现
                    model.db.driver.execQuery(
                        "SELECT sum(cny) as apBonusOut FROM qp_fangkabonusout WHERE datediff(curdate(), createTime)=0 AND status=1;", function (err, data) {
                            if (err == null) {
                                console.log('apBonusOut', data[0].apBonusOut);
                                today.apBonusOut = data[0].apBonusOut;
                            }

                            cb(err);
                        });
                },
                function (cb) {     // 计算每日开局数
                    model.db.driver.execQuery(
                        "SELECT sum(openTables) as openTables FROM qp_10mindata WHERE datediff(curdate(), createdTime)=0;", function (err, data) {
                            if (err == null) {
                                console.log('openTables', data[0].openTables);
                                today.openTables = data[0].openTables;
                            }

                            cb(err);
                        });
                },
                function (cb) {     // 计算每日充卡数
                    model.db.driver.execQuery(
                        "SELECT sum(productNum) as buyCards FROM qp_payrecord WHERE status=1 AND datediff(curdate(), orderTime)=0;", function (err, data) {
                            if (err == null) {
                                console.log('buyCards', data[0].buyCards);
                                today.buyCards = data[0].buyCards;
                            }

                            cb(err);
                        });
                },
                function (cb) {     // 计算每日剩余总房卡数
                    model.db.driver.execQuery(
                        //剔除客服,总代钻石数
                        "SELECT sum(gemNum) as leftCards FROM qp_player where vipLevel < 90;", function (err, data) {
                            if (err == null) {
                                console.log('leftCards', data[0].leftCards);
                                today.leftCards = data[0].leftCards;
                            }

                            cb(err);
                        });
                }
            ], function (err) {
                if (err != null) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {
                    console.log(err, today, yesterday, week, halfMonth, month, lastMonth, year);
                    res.status(200).json({
                        code: 200, data: {
                            today: today, yesterday: yesterday, week: week,
                            halfMonth: halfMonth, month: month, lastMonth: lastMonth, year: year
                        },
                        session: utils.getSession(info.uid)
                    });
                }
            });
        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

    // 营收数据
    operatordata1: function (req, res) { // 营收数据
        var info = req.body;
        console.log(info);

        if (utils.checkSession(info.uid, info.session)) {
            var _queryMonth = function (months, _min, _max, callback) {
                console.log(_min, _max);
                var queries = [];
                var j = _min;

                for (var m = _min; m <= _max; m++) {
                    queries.push(function (cb) {
                        var month = j;
                        console.log('month: ', month);
                        var begin = moment().month(month - 1).date(1).hours(0).minutes(0).seconds(0).milliseconds(0).unix();
                        var end = moment().month(month).date(0).hours(23).minutes(59).seconds(59).milliseconds(0).unix();

                        var sql = "SELECT " + month + " as month,  SUM(incomeTotal) as incomeTotal, SUM(apBonusIn) as apBonusIn, SUM(apBonusOut) as apBonusOut FROM qp_dailydata " +
                            "WHERE unix_timestamp(createdTime)>=" + begin + " AND unix_timestamp(createdTime)<=" + end;

                        // console.log(sql);
                        model.db.driver.execQuery(
                            sql, function (err, data) {
                                if (err != null)
                                    cb(error.DB_ERROR, null);
                                else {
                                    cb(null, data[0].month, data[0].incomeTotal, data[0].apBonusIn, data[0].apBonusOut);
                                }
                            });
                        j++;
                    });
                }

                async.parallel(queries,
                    function (err, results) {
                        if (err == null) {
                            for (var i = 0; i < results.length; i++) {
                                var month = results[i][0];
                                var incomeTotal = results[i][1] == null ? 0 : results[i][1];
                                var apBonusIn = results[i][2] == null ? 0 : results[i][2];
                                var apBonusOut = results[i][3] == null ? 0 : results[i][3];
                                months.push({
                                    month: month,
                                    incomeTotal: incomeTotal,
                                    apBonusIn: apBonusIn,
                                    apBonusOut: apBonusOut
                                });
                            }

                            callback(null, months);
                        } else
                            callback(err);
                    });
            }

            var _queryDay = function (days, month, _min, _max, callback) {
                console.log(month, _min, _max);
                var queries = [];
                var j = _min;
                var max = _max;

                if (_min > max) {
                    month--;
                    _max = moment().date(0).date();
                }

                console.log(_min, _max);
                for (var m = _min; m <= _max; m++) {
                    queries.push(function (cb) {
                        var date = j;
                        console.log('date: ', date);
                        var begin = moment().month(month).date(date).hours(0).minutes(0).seconds(0).milliseconds(0).unix() + 86400;
                        var end = moment().month(month).date(date).hours(23).minutes(59).seconds(59).milliseconds(0).unix() + 86400;

                        var sql = "SELECT " + date + " as date, SUM(incomeTotal) as incomeTotal, SUM(apBonusIn) as apBonusIn, SUM(apBonusOut) as apBonusOut FROM qp_dailydata " +
                            "WHERE unix_timestamp(createdTime)>=" + begin + " AND unix_timestamp(createdTime)<=" + end;

                        // console.log(sql);
                        model.db.driver.execQuery(
                            sql, function (err, data) {
                                if (err != null)
                                    cb(error.DB_ERROR, null);
                                else {
                                    cb(null, data[0].date, data[0].incomeTotal, data[0].apBonusIn, data[0].apBonusOut);
                                }
                            });
                        j++;
                    });
                }

                if (_min > max) {
                    month++;

                    _min = 1;
                    _max = max;
                    var k = _min;

                    for (var m = _min; m <= _max; m++) {
                        queries.push(function (cb) {
                            var date = k;
                            console.log('date: ', date);
                            var begin = moment().month(month).date(date).hours(0).minutes(0).seconds(0).milliseconds(0).unix() + 86400;
                            var end = moment().month(month).date(date).hours(23).minutes(59).seconds(59).milliseconds(0).unix() + 86400;

                            var sql = "SELECT " + date + " as date, SUM(incomeTotal) as incomeTotal, SUM(apBonusIn) as apBonusIn, SUM(apBonusOut) as apBonusOut FROM qp_dailydata " +
                                "WHERE unix_timestamp(createdTime)>=" + begin + " AND unix_timestamp(createdTime)<=" + end;

                            // console.log(sql);
                            model.db.driver.execQuery(
                                sql, function (err, data) {
                                    if (err != null)
                                        cb(error.DB_ERROR, null);
                                    else {
                                        cb(null, data[0].date, data[0].incomeTotal, data[0].apBonusIn, data[0].apBonusOut);
                                    }
                                });
                            k++;
                        });
                    }
                }

                async.parallel(queries,
                    function (err, results) {
                        if (err == null) {
                            for (var i = 0; i < results.length; i++) {
                                var date = results[i][0];
                                var incomeTotal = results[i][1] == null ? 0 : results[i][1];
                                var apBonusIn = results[i][2] == null ? 0 : results[i][2];
                                var apBonusOut = results[i][3] == null ? 0 : results[i][3];
                                days.push({
                                    date: date,
                                    incomeTotal: incomeTotal,
                                    apBonusIn: apBonusIn,
                                    apBonusOut: apBonusOut
                                });
                            }

                            callback(null, days);
                        } else
                            callback(err);
                    });
            }

            if (info.type == 'months') {
                var months = [];

                var begin = moment().month(1).month();
                var end = moment().month() + 1;

                _queryMonth(months, begin, end, function (err, months) {
                    if (err == null)
                        res.status(200).json({code: 200, data: months, session: utils.getSession(info.uid)});
                    else
                        res.status(200).json({code: error.DB_ERROR, msg: err});
                });
            } else if (info.type == 'days') {
                var days = [];

                var begin = 0;
                var end = 0;

                if (info.month == -1)
                    info.month = moment().month() - 1;
                if (info.month < 0)
                    info.month = 12;

                if (info.days == 7) {
                    begin = moment().date(moment().date() - 7).date();
                    end = moment().date(moment().date() - 1).date();
                } else if (info.days == 15) {
                    begin = moment().date(moment().date() - 15).date();
                    end = moment().date(moment().date() - 1).date();
                } else {
                    begin = moment().month(info.month).date(1).date();
                    if (moment().month() == info.month)
                        end = moment().month(info.month).date() - 1;
                    else
                        end = moment().month(info.month).date(0).date();
                }

                _queryDay(days, info.month, begin, end, function (err, days) {
                    if (err == null)
                        res.status(200).json({code: 200, data: days, session: utils.getSession(info.uid)});
                    else
                        res.status(200).json({code: error.DB_ERROR, msg: err});
                });
            } else if (info.type == 'daily') {
                var daily = {};

                if (info.date == 0) {
                    info.date = moment().date();
                    info.month = moment().month();
                } else if (info.date == -1) {
                    info.date = moment().date(moment().date() - 1).date();
                    info.month = moment().date(moment().date() - 1).month();
                }

                if (info.month == -1) {
                    info.month = moment().month() - 1;
                }

                var begin = moment().month(info.month).date(info.date).hours(0).minutes(0).seconds(0).milliseconds(0).unix();
                var end = moment().month(info.month).date(info.date).hours(23).minutes(59).seconds(59).milliseconds(0).unix();

                var sql = 'SELECT a.*, c.`l1Bonus` +c.`l2Bonus` +c.`playerBonus` as apBonusIn FROM qp_payrecord as a, ' +
                    '`qp_fangkarecordext` as b, `qp_fangkabonusin` as c WHERE a.status=1 AND a.`id` = b.`payId` AND c.`fkrId` =b.`id` ' +
                    'AND unix_timestamp(a.orderTime)>=' + begin + ' AND unix_timestamp(a.orderTime)<=' + end;
                // console.log(sql);
                model.db.driver.execQuery(
                    sql, function (err, results) {
                        if (err != null)
                            res.status(200).json({code: error.DB_ERROR, msg: err});
                        else {
                            daily.income = results;

                            var sql = 'SELECT * FROM qp_fangkabonusout WHERE status=1 AND unix_timestamp(createTime)>=' + begin + ' AND unix_timestamp(createTime)<=' + end;
                            console.log(sql);
                            model.db.driver.execQuery(
                                sql, function (err, results) {
                                    if (err != null)
                                        res.status(200).json({code: error.DB_ERROR, msg: err});
                                    else {
                                        daily.apOut = results;
                                        res.status(200).json({
                                            code: 200,
                                            data: daily,
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

    // 游戏数据
    operatordata2: function (req, res) { // 游戏数据
        var info = req.body;
        console.log(info);

        if (utils.checkSession(info.uid, info.session)) {

            var _queryMonth = function (months, _min, _max, callback) {
                console.log(_min, _max);
                var queries = [];
                var j = _min;

                for (var m = _min; m <= _max; m++) {
                    queries.push(function (cb) {
                        var month = j;
                        console.log('month: ', month);
                        var begin = moment().month(month - 1).date(1).hours(0).minutes(0).seconds(0).milliseconds(0).unix();
                        var end = moment().month(month).date(0).hours(23).minutes(59).seconds(59).milliseconds(0).unix();

                        var sql = "SELECT " + month + " as month, SUM(usedCards) as usedCards, SUM(buyCards) as buyCards," +
                            " SUM(newUsers) as newUsers, SUM(activeUsers) as activeUsers, SUM(openTables) as openTables FROM qp_dailydata " +
                            "WHERE unix_timestamp(createdTime)>=" + begin + " AND unix_timestamp(createdTime)<=" + end;

                        // console.log(sql);
                        model.db.driver.execQuery(
                            sql, function (err, data) {
                                if (err != null)
                                    cb(error.DB_ERROR, null);
                                else {
                                    cb(null, data[0].month, data[0].usedCards, data[0].buyCards,
                                        data[0].newUsers, data[0].activeUsers, data[0].openTables);
                                }
                            });
                        j++;
                    });
                }

                async.parallel(queries,
                    function (err, results) {
                        if (err == null) {
                            for (var i = 0; i < results.length; i++) {
                                var month = results[i][0];
                                var usedCards = results[i][1] == null ? 0 : results[i][1];
                                var buyCards = results[i][2] == null ? 0 : results[i][2];
                                var newUsers = results[i][3] == null ? 0 : results[i][3];
                                var activeUsers = results[i][4] == null ? 0 : results[i][4];
                                var openTables = results[i][5] == null ? 0 : results[i][5];

                                months.push({
                                    month: month, usedCards: usedCards, buyCards: buyCards, newUsers: newUsers,
                                    activeUsers: activeUsers, openTables: openTables
                                });
                            }

                            callback(null, months);
                        } else
                            callback(err);
                    });
            }

            var _queryDay = function (days, month, _min, _max, callback) {
                console.log(month, _min, _max);
                var queries = [];
                var j = _min;
                var max = _max;

                if (_min > max) {
                    month--;
                    _max = moment().date(0).date();
                }

                console.log(_min, _max);
                for (var m = _min; m <= _max; m++) {
                    queries.push(function (cb) {
                        var date = j;
                        console.log('date: ', date);
                        var begin = moment().month(month).date(date).hours(0).minutes(0).seconds(0).milliseconds(0).unix() + 86400;
                        var end = moment().month(month).date(date).hours(23).minutes(59).seconds(59).milliseconds(0).unix() + 86400;

                        var sql = "SELECT " + date + " as date, SUM(usedCards) as usedCards, SUM(buyCards) as buyCards," +
                            " SUM(newUsers) as newUsers, SUM(activeUsers) as activeUsers, SUM(openTables) as openTables FROM qp_dailydata " +
                            "WHERE unix_timestamp(createdTime)>=" + begin + " AND unix_timestamp(createdTime)<=" + end;

                        // console.log(sql);
                        model.db.driver.execQuery(
                            sql, function (err, data) {
                                if (err != null)
                                    cb(error.DB_ERROR, null);
                                else {
                                    cb(null, data[0].date, data[0].usedCards, data[0].buyCards,
                                        data[0].newUsers, data[0].activeUsers, data[0].openTables);
                                }
                            });
                        j++;
                    });
                }

                if (_min > max) {
                    month++;
                    _min = 1;
                    _max = max;
                    var k = _min;

                    for (var m = _min; m <= _max; m++) {
                        queries.push(function (cb) {
                            var date = k;
                            console.log('date: ', date);
                            var begin = moment().month(month).date(date).hours(0).minutes(0).seconds(0).milliseconds(0).unix() + 86400;
                            var end = moment().month(month).date(date).hours(23).minutes(59).seconds(59).milliseconds(0).unix() + 86400;

                            var sql = "SELECT " + date + " as date, SUM(usedCards) as usedCards, SUM(buyCards) as buyCards," +
                                " SUM(newUsers) as newUsers, SUM(activeUsers) as activeUsers, SUM(openTables) as openTables FROM qp_dailydata " +
                                "WHERE unix_timestamp(createdTime)>=" + begin + " AND unix_timestamp(createdTime)<=" + end;

                            // console.log(sql);
                            model.db.driver.execQuery(
                                sql, function (err, data) {
                                    if (err != null)
                                        cb(error.DB_ERROR, null);
                                    else {
                                        cb(null, data[0].date, data[0].usedCards, data[0].buyCards,
                                            data[0].newUsers, data[0].activeUsers, data[0].openTables);
                                    }
                                });
                            k++;
                        });
                    }
                }

                async.parallel(queries,
                    function (err, results) {
                        if (err == null) {
                            for (var i = 0; i < results.length; i++) {
                                var date = results[i][0];
                                var usedCards = results[i][1] == null ? 0 : results[i][1];
                                var buyCards = results[i][2] == null ? 0 : results[i][2];
                                var newUsers = results[i][3] == null ? 0 : results[i][3];
                                var activeUsers = results[i][4] == null ? 0 : results[i][4];
                                var openTables = results[i][5] == null ? 0 : results[i][5];

                                days.push({
                                    date: date, usedCards: usedCards, buyCards: buyCards, newUsers: newUsers,
                                    activeUsers: activeUsers, openTables: openTables
                                });
                            }

                            callback(null, days);
                        } else
                            callback(err);
                    });
            }

            var _queryHour = function (hours, month, date, _min, _max, callback) {
                console.log(month, date, _min, _max);
                var queries = [];
                var j = _min;

                for (var m = _min; m <= _max; m++) {
                    queries.push(function (cb) {
                        var hour = j;
                        console.log('hour: ', hour);
                        var begin = moment().month(month).date(date).hours(hour).minutes(0).seconds(0).milliseconds(0).unix();
                        var end = moment().month(month).date(date).hours(hour).minutes(59).seconds(59).milliseconds(0).unix();

                        var sql = "SELECT " + hour + " as hour, SUM(usedCards) as usedCards, SUM(buyCards) as buyCards," +
                            " SUM(newUsers) as newUsers, MAX(activeUsers) as activeUsers, SUM(openTables) as openTables FROM qp_10mindata " +
                            "WHERE unix_timestamp(createdTime)>=" + begin + " AND unix_timestamp(createdTime)<=" + end;

                        // console.log(sql);
                        model.db.driver.execQuery(
                            sql, function (err, data) {
                                if (err != null)
                                    cb(error.DB_ERROR, null);
                                else {
                                    cb(null, data[0].hour, data[0].usedCards, data[0].buyCards,
                                        data[0].newUsers, data[0].activeUsers, data[0].openTables);
                                }
                            });
                        j++;
                    });
                }

                async.parallel(queries,
                    function (err, results) {
                        if (err == null) {
                            for (var i = 0; i < results.length; i++) {
                                var hour = results[i][0];
                                var usedCards = results[i][1] == null ? 0 : results[i][1];
                                var buyCards = results[i][2] == null ? 0 : results[i][2];
                                var newUsers = results[i][3] == null ? 0 : results[i][3];
                                var activeUsers = results[i][4] == null ? 0 : results[i][4];
                                var openTables = results[i][5] == null ? 0 : results[i][5];

                                hours.push({
                                    hour: hour, usedCards: usedCards, buyCards: buyCards, newUsers: newUsers,
                                    activeUsers: activeUsers, openTables: openTables
                                });
                            }

                            callback(null, hours);
                        } else
                            callback(err);
                    });
            }

            if (info.type == 'months') {
                var months = [];

                var begin = moment().month(1).month();
                var end = moment().month() + 1;

                _queryMonth(months, begin, end, function (err, months) {
                    if (err == null)
                        res.status(200).json({code: 200, data: months, session: utils.getSession(info.uid)});
                    else
                        res.status(200).json({code: error.DB_ERROR, msg: err});
                });
            } else if (info.type == 'days') {
                var days = [];

                var begin = 0;
                var end = 0;

                if (info.month == -1)
                    info.month = moment().month() - 1;
                if (info.month < 0)
                    info.month = 12;

                if (info.days == 7) {
                    begin = moment().date(moment().date() - 7).date();
                    end = moment().date(moment().date() - 1).date();
                } else if (info.days == 15) {
                    begin = moment().date(moment().date() - 15).date();
                    end = moment().date(moment().date() - 1).date();
                } else {
                    begin = moment().month(info.month).date(1).date();
                    if (moment().month() == info.month)
                        end = moment().month(info.month).date() - 1;
                    else
                        end = moment().month(info.month).date(0).date();
                }

                _queryDay(days, info.month, begin, end, function (err, days) {
                    if (err == null)
                        res.status(200).json({code: 200, data: days, session: utils.getSession(info.uid)});
                    else
                        res.status(200).json({code: error.DB_ERROR, msg: err});
                });
            } else if (info.type == 'daily') {
                var hours = [];

                if (info.date == 0) {
                    info.date = moment().date();
                    info.month = moment().month();
                } else if (info.date == -1) {
                    info.date = moment().date(moment().date() - 1).date();
                    info.month = moment().date(moment().date() - 1).month();
                }

                if (info.month == -1)
                    info.month = moment().month() - 1;
                if (info.month < 0)
                    info.month = 12;

                _queryHour(hours, info.month, info.date, 0, 23, function (err, hours) {
                    if (err == null)
                        res.status(200).json({code: 200, data: hours, session: utils.getSession(info.uid)});
                    else
                        res.status(200).json({code: error.DB_ERROR, msg: err});
                });
            } else if (info.type == 'hour') {
                var idxs = [];

                if (info.hour == -1) {
                    var end = moment().unix();
                }
                var begin = end - 3600;

                var sql = "SELECT * FROM qp_10mindata WHERE unix_timestamp(createdTime)>=" + begin + " AND unix_timestamp(createdTime)<=" + end;

                // console.log(sql);
                model.db.driver.execQuery(
                    sql, function (err, data) {
                        if (err == null)
                            res.status(200).json({code: 200, data: data, session: utils.getSession(info.uid)});
                        else
                            res.status(200).json({code: error.DB_ERROR, msg: err});
                    });
            }

        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

    // 代理数据概览
    agentdata: function (req, res) { // 代理数据概览
        var info = req.body;
        if (utils.checkSession(info.uid, info.session)) {
            // var now = moment().unix();
            // var threshold = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
            var todayBegin = 0, todayEnd = 0;
            // if (now > threshold) {
            //   todayBegin = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
            //   todayEnd = moment().hours(23).minutes(59).seconds(59).milliseconds(0).unix();
            // } else {
            //   todayBegin = moment().date(moment().date()-1).hours(4).minutes(30).seconds(0).milliseconds(0).unix();
            //   todayEnd = moment().hours(4).minutes(30).seconds(0).milliseconds(0).unix();
            // }
            todayBegin = moment().hours(0).minutes(0).seconds(0).milliseconds(0).unix();
            todayEnd = moment().hours(23).minutes(59).seconds(59).milliseconds(0).unix();

            var _queryAgentsCharge = function (agents, callback) {
                var between_time = " AND unix_timestamp(a.orderTime) >= " + todayBegin + " AND unix_timestamp(a.orderTime) < " + todayEnd + ";";

                var queries = [];
                var j = 0;
                for (var r in agents) {
                    queries.push(function (cb) {
                        var uid = agents[j].uid;
                        var upLevelAgent = info.uid;

                        j++;
                        console.log('agent: ', uid);

                        var sql = "SELECT SUM(a.orderAmount) as chargeAmount FROM `qp_payrecord` as a WHERE status = 1 AND id IN (" +
                            "SELECT `payId` FROM qp_fangkarecordext WHERE id IN (" +
                            "SELECT fkrId FROM `qp_fangkabonusin` " +
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

            var _query = function (users, callback) {
                var queries = [];
                var j = 0;
                for (var r in users) {
                    queries.push(function (cb) {
                        var uid = users[j].uid;
                        var agentId = users[j].agentId;
                        j++;

                        console.log('agent: ', uid);
                        var between_time = " AND unix_timestamp(a.orderTime) >= " + todayBegin + " AND unix_timestamp(a.orderTime) < " + todayEnd + ";";

                        var agentPlayersNum = 0;

                        async.waterfall([
                            function (cb) { // 查询下级代理数
                                var sql = "SELECT COUNT(uid) as agentNum FROM qp_backenduser as a WHERE a.level2Agent=?";
                                // console.log(sql);
                                model.db.driver.execQuery( // 下级代理数
                                    sql, [uid], function (err, data) {
                                        console.log('agent num:', err, data);
                                        if (err != null)
                                            cb(error.DB_ERROR);
                                        else
                                            cb(null, data.length > 0 ? data[0].agentNum : 0);
                                    });
                            },
                            function (agentNum, cb) { // 查询直属绑定用户数
                                sql = "SELECT COUNT(uid) as playerNum FROM qp_player as a WHERE a.agentCode=?";
                                var _uid = parseInt(uid);
                                model.db.driver.execQuery( // 绑定用户数
                                    sql, [agentId], function (err, data) {
                                        console.log('player num:', err, data);
                                        if (err != null)
                                            cb(error.DB_ERROR);
                                        else
                                            cb(null, agentNum, data.length > 0 ? data[0].playerNum : 0);
                                    });
                            },
                            function (agentNum, playerNum, cb) { // 查询全部下级代理绑定用户数
                                sql = "SELECT COUNT(uid) as agentPlayersNum FROM qp_player as a WHERE a.agentCode IN (" +
                                    "SELECT b.`agentId` FROM `qp_backenduser` as b WHERE b.`level1Agent` =? or b.`level2Agent` =? or b.`extl3Agent` =? " +
                                    "or b.`extl4Agent` =? or b.`extl5Agent` =? or b.`extl6Agent` =? or b.`extl7Agent` =? or b.`extl8Agent` =? or b.`extl9Agent` =?)";
                                model.db.driver.execQuery( // 绑定用户数
                                    sql, [uid, uid, uid, uid, uid, uid, uid, uid, uid], function (err, data) {
                                        console.log('agentplayer num:', err, data);
                                        if (err != null)
                                            cb(error.DB_ERROR);
                                        else {
                                            agentPlayersNum = data.length > 0 ? data[0].agentPlayersNum : 0;
                                            cb(null, agentNum, playerNum);
                                        }
                                    });
                            },
                            function (agentNum, playerNum, cb) { // 查询代理及其下属玩家充钻记录
                                model.db.driver.execQuery(
                                    "SELECT uid, name FROM qp_backenduser WHERE level2Agent = ?", [uid], function (err, results) {
                                        console.log('agents:', err, results);
                                        if (err == null) {
                                            var amountCharges = 0;

                                            _queryAgentsCharge(results, function (err, agents) {
                                                for (var i = 0; i < agents.length; i++) {
                                                    if (agents[i].chargeAmount != 0) {
                                                        amountCharges += agents[i].chargeAmount;
                                                    }
                                                }
                                                cb(null, agentNum, playerNum, amountCharges);
                                            });
                                        } else {
                                            cb({code: error.DB_ERROR, msg: err});
                                        }
                                    });
                            },
                            function (agentNum, playerNum, agentCharges, cb) { // 查询玩家充钻记录
                                sql = "SELECT SUM(a.orderAmount) as chargeAmount FROM qp_payrecord as a LEFT JOIN qp_player as b" +
                                    " ON a.playerId = b.uid WHERE b.agentCode=? and a.status=1 " + between_time;
                                model.db.driver.execQuery(
                                    sql, [agentId], function (err, results) {
                                        console.log('today charge players:', err, results);
                                        if (err == null) {
                                            cb(null, agentNum, playerNum, agentCharges + (results.length > 0 ? results[0].chargeAmount : 0), agentPlayersNum);
                                        } else {
                                            cb({code: error.DB_ERROR, msg: err});
                                        }
                                    });
                            }

                        ], function (err, agentNum, playerNum, amountCharges, agentPlayersNum) {
                            if (err)
                                cb(err);
                            else {
                                cb(null, agentNum, playerNum, amountCharges, agentPlayersNum);
                            }
                        });
                    });
                }

                async.parallel(queries,
                    function (err, results1) {
                        if (err == null) {
                            for (var i = 0; i < results1.length; i++) {
                                users[i].agentNum = results1[i][0] == null ? 0 : results1[i][0];
                                users[i].playerNum = results1[i][1] == null ? 0 : results1[i][1];
                                users[i].chargeAmount = results1[i][2] == null ? 0 : results1[i][2];
                                users[i].agentPlayersNum = results1[i][3] == null ? 0 : results1[i][3];
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

            model.user.find({uid: info.uid}, 1, function (err, results) {
                if (err != null || results.length == 0) {
                    res.status(200).json({code: error.DB_ERROR, msg: err});
                } else {
                    _query(results, function (err, data) {
                        if (err == null)
                            res.status(200).json({code: 200, data: data[0], session: utils.getSession(info.uid)});
                        else
                            res.status(200).json({code: error.INT_ERROR, msg: err});
                    });
                }
            });

        } else
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
    },

    // 游戏数据v2
    operatordata_v2: function (req, res) { // 游戏数据
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

        var between_time = " createdTime >= \'" + info.begin + " 00:00:00\' AND createdTime < \'" + info.end + " 23:59:59\' ";

        var sql_data = "SELECT newUsers, activeUsers, totalUsers, openTables, usedCards, buyCards, incomeTotal, date_format(date_sub(createdTime, interval 1 day), \'%Y-%m-%d\') as createTime FROM qp_dailydata " +
            " WHERE " + between_time +
            " GROUP BY createTime ORDER BY createTime desc";

        async.waterfall([
            function (cb) { // 统计总行数用于计算分页
                var sql_count = "SELECT count(*) as num FROM (" + sql_data + ") as t";
                model.db.driver.execQuery(
                    sql_count, function (err, results) {
                        console.log('operatordata_v2', err);
                        if (err != null)
                            cb({code: error.DB_ERROR, msg: err});
                        else {
                            cb(null, results.length > 0 ? results[0].num : 0);
                        }
                    });
            },
            function (num, cb) { // 计算日均数据
                var sql = "SELECT avg(newUsers) as newUsers, avg(activeUsers) as activeUsers, avg(openTables) as openTables, avg(usedCards) as usedCards, avg(buyCards) as buyCards FROM qp_dailydata " +
                    " WHERE " + between_time;
                model.db.driver.execQuery(
                    sql, function (err, results) {
                        console.log('operatordata_v2', err);
                        if (err != null)
                            cb({code: error.DB_ERROR, msg: err});
                        else {
                            cb(null, num, results[0]);
                        }
                    });
            },
            function (num, avg, cb) {
                var sql = sql_data + " limit " + pageSize + " offset " + (pageId * pageSize);
                model.db.driver.execQuery(
                    sql, function (err, results) {
                        console.log('operatordata_v2', err);
                        if (err != null)
                            cb({code: error.DB_ERROR, msg: err});
                        else {
                            cb(null, num, avg, results);
                        }
                    });
            }
        ], function (err, num, avg, data) {
            if (err != null)
                res.status(200).json(err);
            else {
                var page = {id: pageId, num: Math.ceil(num / pageSize)};
                res.status(200).json({
                    code: 200,
                    data: {data: data, avg: avg},
                    page: page,
                    session: utils.getSession(info.uid)
                });
            }
        });

    },

    // 按游戏和时间获取游戏数据
    operatordata_bygame: function (req, res) {
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

        var between_time = " createdTime >= \'" + info.begin + " 00:00:00\' AND createdTime < \'" + info.end + " 23:59:59\' ";

        var sql_data = "SELECT serverType, activeUsers, openTables, usedCards, date_format(date_sub(createdTime, interval 1 day), \'%Y-%m-%d\') as createTime FROM qp_dailydata_ext " +
            " WHERE " + between_time +
            " GROUP BY serverType, createTime ORDER BY serverType, createTime ";

        async.waterfall([
            function (cb) { // 统计总行数用于计算分页
                var sql_count = "SELECT count(*) as num FROM (" + sql_data + ") as t";
                model.db.driver.execQuery(
                    sql_count, function (err, results) {
                        console.log('operatordata_bygame', err);
                        if (err != null)
                            cb({code: error.DB_ERROR, msg: err});
                        else {
                            cb(null, results.length > 0 ? results[0].num : 0);
                        }
                    });
            },
            function (num, cb) { // 计算日均数据
                var sql = "SELECT serverType, avg(activeUsers) as activeUsers, avg(openTables) as openTables, avg(usedCards) as usedCards  FROM qp_dailydata_ext " +
                    " WHERE " + between_time;
                model.db.driver.execQuery(
                    sql, function (err, results) {
                        console.log('operatordata_bygame', err);
                        if (err != null)
                            cb({code: error.DB_ERROR, msg: err});
                        else {
                            cb(null, num, results[0]);
                        }
                    });
            },
            function (num, avg, cb) {
                var sql = sql_data + " limit " + pageSize + " offset " + (pageId * pageSize);
                model.db.driver.execQuery(
                    sql, function (err, results) {
                        console.log('operatordata_bygame', err);
                        if (err != null)
                            cb({code: error.DB_ERROR, msg: err});
                        else {
                            cb(null, num, avg, results);
                        }
                    });
            }
        ], function (err, num, avg, data) {
            if (err != null)
                res.status(200).json(err);
            else {
                var page = {id: pageId, num: Math.ceil(num / pageSize)};
                res.status(200).json({
                    code: 200,
                    data: {data: data, avg: avg},
                    page: page,
                    session: utils.getSession(info.uid)
                });
            }
        });

    },

    // 获取玩家得分胜率汇总数据
    playerdata: function (req, res) {
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

        var between_time = " createTime >= \'" + info.begin + " 00:00:00\' AND createTime < \'" + info.end + " 23:59:59\' ";

        if (info.pid == undefined || info.pid.length == 0) { // 运营查看指定日期范围全部玩家综合战绩
            var sql_data = "SELECT res.uid, b.nickName as name, SUM(num) as num, SUM(score) as score, AVG(ratio) as ratio FROM( " +
                "(SELECT uid1 as uid, COUNT(uid1) as num, SUM(score1) as score, AVG(ratio1) as ratio FROM `qp_playdata` " +
                "WHERE uid1>0 AND " + between_time + " GROUP BY uid1) " +
                "UNION " +
                "(SELECT uid2 as uid, COUNT(uid2) as num, SUM(score2) as score, AVG(ratio2) as ratio FROM `qp_playdata`  " +
                "WHERE uid2>0 AND " + between_time + " GROUP BY uid2) " +
                "UNION " +
                "(SELECT uid3 as uid, COUNT(uid3) as num, SUM(score3) as score, AVG(ratio3) as ratio FROM `qp_playdata`  " +
                "WHERE uid3>0 AND " + between_time + " GROUP BY uid3) " +
                "UNION " +
                "(SELECT uid4 as uid, COUNT(uid4) as num, SUM(score4) as score, AVG(ratio4) as ratio FROM `qp_playdata`  " +
                "WHERE uid4 > 0 AND " + between_time + " GROUP BY uid4) " +
                "UNION " +
                "(SELECT uid5 as uid, COUNT(uid5) as num, SUM(score5) as score, AVG(ratio5) as ratio FROM `qp_playdata`  " +
                "WHERE uid5>0 AND " + between_time + " GROUP BY uid5) " +
                "UNION " +
                "(SELECT uid6 as uid, COUNT(uid6) as num, SUM(score6) as score, AVG(ratio6) as ratio FROM `qp_playdata`  " +
                "WHERE uid6>0 AND " + between_time + " GROUP BY uid6) " +
                "UNION " +
                "(SELECT uid7 as uid, COUNT(uid7) as num, SUM(score7) as score, AVG(ratio7) as ratio FROM `qp_playdata`  " +
                "WHERE uid7>0 AND " + between_time + " GROUP BY uid7) " +
                "UNION " +
                "(SELECT uid8 as uid, COUNT(uid8) as num, SUM(score8) as score, AVG(ratio8) as ratio FROM `qp_playdata`  " +
                "WHERE uid8>0 AND " + between_time + " GROUP BY uid8) " +
                ") res LEFT JOIN qp_player as b ON res.uid=b.uid GROUP BY res.uid ORDER BY res.score desc, res.ratio desc, res.num desc ";

            async.waterfall([
                function (cb) { // 统计总行数用于计算分页
                    var sql_count = "SELECT count(*) as num FROM (" + sql_data + ") as t";
                    model.db.driver.execQuery(
                        sql_count, function (err, results) {
                            console.log('playerdata', err);
                            if (err != null)
                                cb({code: error.DB_ERROR, msg: err});
                            else {
                                cb(null, results.length > 0 ? results[0].num : 0);
                            }
                        });
                },
                function (num, cb) { // 计算玩家战绩数据
                    var sql = sql_data + " limit " + pageSize + " offset " + (pageId * pageSize);
                    model.db.driver.execQuery(
                        sql, function (err, results) {
                            console.log('playerdata', err);
                            if (err != null)
                                cb({code: error.DB_ERROR, msg: err});
                            else {
                                cb(null, num, results);
                            }
                        });
                }
            ], function (err, num, data) {
                if (err != null)
                    res.status(200).json(err);
                else {
                    var page = {id: pageId, num: Math.ceil(num / pageSize)};
                    res.status(200).json({code: 200, data: data, page: page, session: utils.getSession(info.uid)});
                }
            });
        } else { // 查看指定玩家战绩
            var sql_data = "SELECT res.uid, b.nickName as name, SUM(num) as num, SUM(score) as score, AVG(ratio) as ratio FROM( " +
                "(SELECT uid1 as uid, COUNT(uid1) as num, SUM(score1) as score, AVG(ratio1) as ratio FROM `qp_playdata` " +
                "WHERE uid1>0 AND " + between_time + " GROUP BY uid1) " +
                "UNION " +
                "(SELECT uid2 as uid, COUNT(uid2) as num, SUM(score2) as score, AVG(ratio2) as ratio FROM `qp_playdata`  " +
                "WHERE uid2>0 AND " + between_time + " GROUP BY uid2) " +
                "UNION " +
                "(SELECT uid3 as uid, COUNT(uid3) as num, SUM(score3) as score, AVG(ratio3) as ratio FROM `qp_playdata`  " +
                "WHERE uid3>0 AND " + between_time + " GROUP BY uid3) " +
                "UNION " +
                "(SELECT uid4 as uid, COUNT(uid4) as num, SUM(score4) as score, AVG(ratio4) as ratio FROM `qp_playdata`  " +
                "WHERE uid4 > 0 AND " + between_time + " GROUP BY uid4) " +
                "UNION " +
                "(SELECT uid5 as uid, COUNT(uid5) as num, SUM(score5) as score, AVG(ratio5) as ratio FROM `qp_playdata`  " +
                "WHERE uid5>0 AND " + between_time + " GROUP BY uid5) " +
                "UNION " +
                "(SELECT uid6 as uid, COUNT(uid6) as num, SUM(score6) as score, AVG(ratio6) as ratio FROM `qp_playdata`  " +
                "WHERE uid6>0 AND " + between_time + " GROUP BY uid6) " +
                "UNION " +
                "(SELECT uid7 as uid, COUNT(uid7) as num, SUM(score7) as score, AVG(ratio7) as ratio FROM `qp_playdata`  " +
                "WHERE uid7>0 AND " + between_time + " GROUP BY uid7) " +
                "UNION " +
                "(SELECT uid8 as uid, COUNT(uid8) as num, SUM(score8) as score, AVG(ratio8) as ratio FROM `qp_playdata`  " +
                "WHERE uid8>0 AND " + between_time + " GROUP BY uid8) " +
                ") res LEFT JOIN qp_player as b ON res.uid=b.uid WHERE res.uid=? GROUP BY res.uid ORDER BY res.score desc, res.ratio desc, res.num desc ";

            async.waterfall([
                function (cb) { // 统计总行数用于计算分页
                    var sql_count = "SELECT count(*) as num FROM (" + sql_data + ") as t";
                    model.db.driver.execQuery(
                        sql_count, [info.pid], function (err, results) {
                            console.log('playerdata', err);
                            if (err != null)
                                cb({code: error.DB_ERROR, msg: err});
                            else {
                                cb(null, results.length > 0 ? results[0].num : 0);
                            }
                        });
                },
                function (num, cb) { // 计算玩家战绩数据
                    var sql = sql_data + " limit " + pageSize + " offset " + (pageId * pageSize);
                    model.db.driver.execQuery(
                        sql, [info.pid], function (err, results) {
                            console.log('playerdata', err);
                            if (err != null)
                                cb({code: error.DB_ERROR, msg: err});
                            else {
                                cb(null, num, results);
                            }
                        });
                }
            ], function (err, num, data) {
                if (err != null)
                    res.status(200).json(err);
                else {
                    var page = {id: pageId, num: Math.ceil(num / pageSize)};
                    res.status(200).json({code: 200, data: data, page: page, session: utils.getSession(info.uid)});
                }
            });
        }
    },

    // 获取玩家得分胜率详细数据
    playerdata_detail: function (req, res) {
        var info = req.body;

        if (!utils.verifySign(info, utils.getKey())) {
            res.status(200).json({code: error.SIGN_ERROR, msg: '安全验证失败!'});
            return;
        }

        if (!utils.checkSession(info.uid, info.session)) {
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
            return;
        }
        if (info.pid == undefined || info.pid.length == 0) {
            res.status(200).json({code: error.INT_ERROR, msg: '参数错误!'});
            return;
        }

        var pageId = info.pageId == undefined ? 0 : info.pageId;
        var pageSize = info.pageSize == undefined ? 100 : info.pageSize;

        var between_time = " createTime >= \'" + info.begin + " 00:00:00\' AND createTime < \'" + info.end + " 23:59:59\' ";

        var sql_data = "SELECT * FROM `qp_playdata` WHERE (`uid1`=? OR `uid2` =? OR `uid3` =? OR `uid4` =? " +
            "OR `uid5` = ? OR `uid6` = ? OR `uid7` =? OR `uid8` =?) AND " + between_time + " ORDER BY createTime desc";

        async.waterfall([
            function (cb) { // 统计总行数用于计算分页
                var sql_count = "SELECT count(*) as num FROM (" + sql_data + ") as t";
                model.db.driver.execQuery(
                    sql_count, [info.pid], function (err, results) {
                        console.log('playerdata_detail', err);
                        if (err != null)
                            cb({code: error.DB_ERROR, msg: err});
                        else {
                            cb(null, results.length > 0 ? results[0].num : 0);
                        }
                    });
            },
            function (num, cb) { // 计算玩家战绩详情数据
                var sql = sql_data + " limit " + pageSize + " offset " + (pageId * pageSize);
                model.db.driver.execQuery(
                    sql, [info.pid], function (err, results) {
                        console.log('playerdata_detail', err);
                        if (err != null)
                            cb({code: error.DB_ERROR, msg: err});
                        else {
                            cb(null, num, results);
                        }
                    });
            }
        ], function (err, num, data) {
            if (err != null)
                res.status(200).json(err);
            else {
                var page = {id: pageId, num: Math.ceil(num / pageSize)};
                res.status(200).json({code: 200, data: data, page: page, session: utils.getSession(info.uid)});
            }
        });
    },

    // 凌晨四点扣除摇摇乐奖奖池  扣除数量为  昨天凌晨0点  到今天凌晨0点的 玩家消耗总和 统计昨日数据
    yyl_socket: function (req, res) {
        //今天凌晨0点
        today = moment().set({hour: 0, minute: 0, second: 0}).format('YYYY-MM-DD HH:mm:ss');
        //昨天凌晨0点
        yesterday = moment().set({hour: 0, minute: 0, second: 0}).subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
        async.waterfall([
            //统计一天内 总每日的 总消耗  玩家总投入 每日累计参与次数
            function (cb) {
                model.db.driver.execQuery(
                    'select sum(betNum) as totalExpend ,count(*) as gameNum, sum(rewardNum) as totalReward from qp_yylstateinfo where createTime >= ? and createTime <= ? ',
                    [yesterday, today], function (err, results) {
                        if (err) {
                            cb({code: error.DB_ERROR, msg: err});
                            return;
                        }
                        //将奖池数量传递
                        cb(null, results[0]);
                    });
            },
            //查询 每日参加 的玩家数
            function (dailyData, cb) {
                model.db.driver.execQuery(
                    'select count(t.uid) as playerNum  from (select uid from qp_yylstateinfo where createTime >= ? and createTime < ? group by uid) as t;',
                    [yesterday, today], function (err, results) {
                        if (err) {
                            cb({code: error.DB_ERROR, msg: err});
                            return;
                        }
                        //合并查询结果
                        dailyData.playerNum = results[0].playerNum;
                        cb(null, dailyData);
                    });
            },
            // 写入 每日统计表
            function (dailyData, cb) {
                model.yylDailyData.create({
                    totalExpend: dailyData.totalExpend + 0,
                    gameNum: dailyData.gameNum + 0,
                    totalReward: dailyData.totalReward + 0,
                    playerNum: dailyData.playerNum + 0,
                    time: yesterday,
                    createTime: moment().format('YYYY-MM-DD HH:mm:ss')
                }, function (err) {
                    if (err) {
                        cb({code: error.DB_ERROR, msg: err});
                        return;
                    }
                    utils.operateLog(10000, '每日统计摇摇乐数据写入成功');
                });
            },
            // todo:更改总奖池金额 暂时不开
            // function (dailyData, cb) {
            //     model.settings.find({key: 'yylRewardTotalNum'}, function (err, res) {
            //         if (err) {
            //             cb({code: error.DB_ERROR, msg: err});
            //             return;
            //         }
            //         res[0].value = res[0].value - (dailyData.totalExpend * 0.2);
            //         //奖金池 改写到数据库
            //         res[0].save(function (err) {
            //             if (err) {
            //                 cb({code: error.DB_ERROR, msg: err});
            //                 return;
            //             }
            //             utils.operateLog(10000, '摇摇乐奖金池每日扣除:扣除数量' + (dailyData.totalExpend * 0.2) + '扣除后数量为:' + res[0].value);
            //         });
            //     })
            // }
        ], function (err) {
            if (err)
                console.log('摇摇乐数据操作失败:', err);
            else {
                console.log('摇摇乐数据操作成功');
            }
        })
    },

    // 查找摇摇乐每日数据   uid, pageSize:每页显示数量 pageId: 页码  begin:起始时间  end:终止时间
    yyl_daily: function (req, res) {
        var info = req.body;
        if (!utils.verifySign(info, utils.getKey())) {
            res.status(200).json({code: error.SIGN_ERROR, msg: '安全验证失败!'});
            return;
        }
        if (!utils.checkSession(info.uid, info.session)) {
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
            return;
        }
        //数据验证
        var pageId = info.pageId == undefined ? 0 : info.pageId;
        var pageSize = info.pageSize == undefined ? 100 : info.pageSize;
        var begin = info.begin + ' 00:00:00';
        var end = info.end + ' 23:59:59';

        async.waterfall([
            //计算总页码
            function (cb) {
                model.db.driver.execQuery(
                    'select count(*) as num from qp_yyl_daily_data where time >= ? and time <= ? ', [begin, end], function (err, results) {
                        if (err) {
                            cb({code: error.DB_ERROR, msg: err});
                            return;
                        }
                        //将奖池数量传递
                        cb(null, results[0].num);
                    });
            },
            //获取数据
            function (page, cb) {
                model.db.driver.execQuery(
                    'select * from qp_yyl_daily_data where time >= ? and time <= ? order by time desc limit ' + pageSize + ' offset ' + (pageId * pageSize),
                    [begin, end], function (err, results) {
                        if (err) {
                            cb({code: error.DB_ERROR, msg: err});
                            return;
                        }
                        cb(null, page, results);
                    });
            },
        ], function (err, page, data) {
            if (err != null)
                res.status(200).json(err);
            else {
                var page = {id: pageId, num: Math.ceil(page / pageSize)};
                res.status(200).json({
                    code: 200,
                    data: data,
                    page: page,
                    session: utils.getSession(info.uid)
                });
            }
        });
    },

    // 摇摇乐 今日实时数据 uid
    yyl_today: function (req, res) {
        var info = req.body;
        if (!utils.verifySign(info, utils.getKey())) {
            res.status(200).json({code: error.SIGN_ERROR, msg: '安全验证失败!'});
            return;
        }
        if (!utils.checkSession(info.uid, info.session)) {
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
            return;
        }
        //今天凌晨0点
        begin = moment().set({hour: 0, minute: 0, second: 0}).format('YYYY-MM-DD HH:mm:ss');
        //明日凌晨
        end = moment().set({hour: 0, minute: 0, second: 0}).add(1, 'days').format('YYYY-MM-DD HH:mm:ss');
        async.waterfall([
            //统计一天内 总每日的 总消耗  玩家总投入 每日累计参与次数
            function (cb) {
                model.db.driver.execQuery(
                    'select sum(betNum) as totalExpend ,count(*) as gameNum, sum(rewardNum) as totalReward from qp_yylstateinfo where createTime >= ? and createTime < ? ',
                    [begin, end], function (err, results) {
                        if (err) {
                            cb({code: error.DB_ERROR, msg: err});
                            return;
                        }
                        //将奖池数量传递
                        cb(null, results[0]);
                    });
            },
            //查询 每日参加 的玩家数
            function (todayData, cb) {
                sql = 'select count(*) as playerNum from qp_yylstateinfo where createTime >= ' + begin + ' and createTime < ' + end + ' group by uid';
                console.log(sql);
                model.db.driver.execQuery(
                    'select count(t.uid) as playerNum  from (select uid from qp_yylstateinfo where createTime >= ? and createTime < ? group by uid) as t;',
                    [begin, end], function (err, results) {
                        if (err) {
                            cb({code: error.DB_ERROR, msg: err});
                            return;
                        }
                        //合并查询结果
                        todayData.playerNum = results[0].playerNum;
                        cb(null, todayData);
                    });
            },
        ], function (err, todayData) {
            if (err != null)
                res.status(200).json(err);
            else {
                res.status(200).json({
                    code: 200,
                    data: todayData,
                    session: utils.getSession(info.uid)
                });
            }
        })

    },

    // 摇摇乐 中奖列表 根据时间查询 uid, pageSize:每页显示数量 pageId: 页码  begin:起始时间  end:终止时间
    yyl_list: function (req, res) {
        var info = req.body;
        if (!utils.verifySign(info, utils.getKey())) {
            res.status(200).json({code: error.SIGN_ERROR, msg: '安全验证失败!'});
            return;
        }
        if (!utils.checkSession(info.uid, info.session)) {
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
            return;
        }
        //数据验证
        var pageId = info.pageId == undefined ? 0 : info.pageId;
        var pageSize = info.pageSize == undefined ? 100 : info.pageSize;
        var begin = info.begin + ' 00:00:00';
        var end = info.end + ' 23:59:59';
        var type = info.type == undefined ? 0 : +info.type;
        async.waterfall([
            //计算总页码
            function (cb) {
                var sql = 'select count(*) as num,sum(betNum) as betNum,sum(rewardNum) as rewardNum  from qp_yylstateinfo where createTime >= ? and createTime <= ? ';
                var cond = [begin, end];
                //判断type类型 决定是否需要条件搜索
                if (type !== 0) {
                    sql += ' and type = ?';
                    cond.push(+info.type);
                }
                model.db.driver.execQuery(sql, cond, function (err, results) {
                    if (!!err) {
                        cb({code: error.DB_ERROR, msg: err});
                        return;
                    }
                    //页面数量
                    cb(null, results[0]);
                });
            },
            //查询详情
            function (pages, cb) {
                var sql = 'select y.*,p.nickName from qp_yylstateinfo as y LEFT JOIN qp_player as p ON y.uid = p.uid where y.createTime >= ? and y.createTime <= ?';
                var cond = [begin, end];
                //判断type类型 决定是否需要条件搜索
                if (type !== 0) {
                    sql += ' and y.type = ?';
                    cond.push(+info.type);
                }
                sql += ' order by y.createTime desc limit ? offset ?';
                cond.push(+pageSize, pageId * pageSize);
                model.db.driver.execQuery(sql, cond, function (err, results) {
                    if (err) {
                        cb({code: error.DB_ERROR, msg: err});
                        return;
                    }
                    cb(null, pages, results);
                });
            },
        ], function (err, pages, data) {
            if (err != null)
                res.status(200).json(err);
            else {
                var page = {id: pageId, num: Math.ceil(pages.num / pageSize)};
                res.status(200).json({
                    code: 200,
                    data: {data: data, betNum: pages.betNum, rewardNum: pages.rewardNum},
                    page: page,
                    session: utils.getSession(info.uid)
                });
            }
        });
    },

    // 摇摇乐 中奖列表 根据玩家查询 uid, pid,pageSize:每页显示数量 pageId: 页码
    yyl_list_uid: function (req, res) {
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
        var type = info.type == undefined ? 0 : +info.type;
        async.waterfall([
            //计算总页码
            function (cb) {
                var sql = 'select count(*) as num,sum(betNum) as betNum,sum(rewardNum) as rewardNum   from qp_yylstateinfo where uid = ? ';
                var cond = [+info.pid];
                //判断type类型 决定是否需要条件搜索
                if (type !== 0) {
                    sql += ' and type = ?';
                    cond.push(+info.type);
                }
                model.db.driver.execQuery(sql, cond, function (err, results) {
                    if (!!err) {
                        cb({code: error.DB_ERROR, msg: err});
                        return;
                    }
                    //页面数量
                    cb(null, results[0]);
                });
            },
            //查询详情
            function (pages, cb) {
                var sql = 'select y.*,p.nickName from qp_yylstateinfo as y LEFT JOIN qp_player as p ON y.uid = p.uid where y.uid = ?';
                var cond = [+info.pid];
                //判断type类型 决定是否需要条件搜索
                if (type !== 0) {
                    sql += ' and y.type = ?';
                    cond.push(+info.type);
                }
                sql += ' order by y.createTime desc limit ? offset ?';
                cond.push(+pageSize, pageId * pageSize);
                model.db.driver.execQuery(sql, cond, function (err, results) {
                    if (err) {
                        cb({code: error.DB_ERROR, msg: err});
                        return;
                    }
                    cb(null, pages, results);
                });
            },
        ], function (err, pages, data) {
            if (err != null)
                res.status(200).json(err);
            else {
                var page = {id: pageId, num: Math.ceil(pages.num / pageSize)};
                res.status(200).json({
                    code: 200,
                    data: {data: data, betNum: pages.betNum, rewardNum: pages.rewardNum},
                    page: page,
                    session: utils.getSession(info.uid)
                });
            }
        });

    },

    // 实时当日游戏统计 uid
    game_live_data: function (req, res) {
        var info = req.body;
        if (!utils.verifySign(info, utils.getKey())) {
            res.status(200).json({code: error.SIGN_ERROR, msg: '安全验证失败!'});
            return;
        }
        if (!utils.checkSession(info.uid, info.session)) {
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
            return;
        }
        var extData = {};
        async.waterfall([
            // 按游戏算消耗房卡数量
            function (cb) {
                if (config.backendName == 'taiWan') {
                    var sql = "SELECT serverType, sum(type) as num FROM qp_playerHuiFang where lossType = 0 GROUP BY serverType";
                } else {
                    var sql = "SELECT serverType, sum(type) as num FROM qp_playerHuiFang  GROUP BY serverType";
                }
                model.db.driver.execQuery(sql, function (err, data) {
                    if (err) {
                        cb({code: error.DB_ERROR, msg: err});
                        return;
                    }
                    for (var i = 0; i < data.length; i++) {
                        if (extData[data[i].serverType] == undefined) {
                            extData[data[i].serverType] = {usedCards: data[i].num};
                            extData[data[i].serverType]['serverType'] = data[i].serverType;
                        } else {
                            extData[data[i].serverType]['usedCards'] = data[i].num;
                            extData[data[i].serverType]['serverType'] = data[i].serverType;
                            if (isround) {
                                extData[data[i].serverType]['usedCards'] = Math.round(data[i].num * 0.5);
                            }
                        }
                    }
                    cb(null);
                });
            },
            // 按游戏算活跃用户
            function (cb) {
                var sql = "select count(t1.udid) as num, serverType from (" +
                    "select distinct (concat(uid1, serverType)) as t, uid1 as udid, serverType from qp_playerHuiFang where uid1>0 "
                    + "UNION select distinct (concat(uid2, serverType)) as t, uid2 as udid, serverType from qp_playerHuiFang where uid2>0 "
                    + "UNION select distinct (concat(uid3, serverType)) as t, uid3 as udid, serverType from qp_playerHuiFang where uid3>0 "
                    + "UNION select distinct (concat(uid4, serverType)) as t, uid4 as udid, serverType from qp_playerHuiFang where uid4>0 "
                    + "UNION select distinct (concat(uid5, serverType)) as t, uid5 as udid, serverType from qp_playerHuiFang where uid5>0 "
                    + "UNION select distinct (concat(uid6, serverType)) as t, uid6 as udid, serverType from qp_playerHuiFang where uid6>0 "
                    + "UNION select distinct (concat(uid7, serverType)) as t, uid7 as udid, serverType from qp_playerHuiFang where uid7>0 "
                    + "UNION select distinct (concat(uid8, serverType)) as t, uid8 as udid, serverType from qp_playerHuiFang where uid8>0"
                    + ") as t1 GROUP BY t1.serverType";
                model.db.driver.execQuery(sql, function (err, data) {
                    if (err) {
                        cb({code: error.DB_ERROR, msg: err});
                    }
                    for (var i = 0; i < data.length; i++) {
                        if (extData[data[i].serverType] == undefined) {
                            extData[data[i].serverType] = {activeUsers: data[i].num};
                        } else {
                            extData[data[i].serverType]['activeUsers'] = data[i].num;
                            if (isround) {
                                extData[data[i].serverType]['activeUsers'] = Math.round(data[i].num * 0.5);
                            }
                        }
                    }
                    cb(null);
                });
            },
            function (cb) {     //按游戏算昨日开局数
                var sql = "SELECT serverType, count(id) as num FROM qp_playerHuiFang GROUP BY serverType";
                model.db.driver.execQuery(sql, function (err, data) {
                    if (err) {
                        res.status(200).json(err);
                    } else {
                        for (var i = 0; i < data.length; i++) {
                            if (extData[data[i].serverType] == undefined) {
                                extData[data[i].serverType] = {openTables: data[i].num};
                            } else {
                                extData[data[i].serverType]['openTables'] = data[i].num;
                                if (isround) {
                                    extData[data[i].serverType]['openTables'] = Math.round(data[i].num * 0.5);
                                }
                            }
                        }
                        cb(null);
                    }
                });
            },
        ], function (err) {
            if (err != null) {
                res.status(200).json(err);
            } else {
                res.status(200).json({
                    code: 200,
                    data: extData,
                    session: utils.getSession(info.uid)
                })
            }
        });
    },

    //统计 总线下的 代理数据
    sales_daily_data: function (req, res) {
        //开始时间
        var begin = moment().set({hour: 0, minute: 0, second: 0}).subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
        //结束时间
        var end = moment().set({hour: 0, minute: 0, second: 0}).format('YYYY-MM-DD HH:mm:ss');
        //表名拼接的时间
        var tableTime = moment().set({hour: 0, minute: 0, second: 0}).subtract(1, 'days').format('YYYYMMDD');
        //统计每个玩家
        async.waterfall([
            //统计有几条线
            function (cb) {
                var sql = 'select distinct rootAgent from qp_backenduser where rootAgent > 0';
                model.db.driver.execQuery(sql, function (err, results) {
                    if (!!err) {
                        cb(err);
                    }
                    cb(null, results);
                })

            },
            //循环统计 每条线路的 数据
            function (rootAgentIds, cb) {
                //循环执行
                async.eachSeries(rootAgentIds, function (item, cb2) {
                    var rootAgentData = {};
                    //统计日期
                    rootAgentData.createTime = begin;
                    //按照顺序依次执行
                    async.waterfall([
                        //获取计算所有玩家的数量,剩余钻石数,积分数
                        function (callback) {
                            var sql = 'select uid,gemNum,coinNum from qp_player where rootAgent = ?';
                            model.db.driver.execQuery(sql, [item.rootAgent], function (err, results) {
                                if (!!err) {
                                    callback(err);
                                }
                                //代理线 的 代理id
                                rootAgentData.uid = item.rootAgent;
                                //代理线 的 玩家总数
                                rootAgentData.totalPlayers = results.length;
                                //代理线 的 玩家剩余钻石数
                                var gemNum = 0;
                                var coinNum = 0;
                                results.forEach(function (value) {
                                    gemNum += value.gemNum;
                                    coinNum += value.coinNum;
                                });
                                rootAgentData.gemNum = gemNum;
                                rootAgentData.coinNum = coinNum;
                                callback(null);
                            })
                        },
                        //计算新玩家数
                        function (callback) {
                            var sql = 'select count(*) as newPlayers from qp_player where rootAgent = ? and registerTime > ? and registerTime < ?';
                            model.db.driver.execQuery(sql, [item.rootAgent, begin, end], function (err, results) {
                                if (!!err) {
                                    callback(err);
                                }
                                // 代理线 新注册玩家
                                rootAgentData.newPlayers = results[0].newPlayers;
                                callback(null);
                            })
                        },
                        //计算玩家的 消费总额
                        function (callback) {
                            var sql = 'select sum(orderAmount) as salesNum from qp_payrecord where status = 1 and playerId in (select uid from qp_player where rootAgent = ?)';
                            model.db.driver.execQuery(sql, [item.rootAgent], function (err, results) {
                                if (!!err) {
                                    callback(err);
                                }
                                // 代理线 总流水
                                rootAgentData.salesNum = results[0].salesNum;
                                callback(null);
                            })
                        },
                        //计算活跃玩家数
                        function (callback) {
                            var sql = "select count(b.uid) as num from (select distinct t.udid as uid from(\
                            select uid1 as udid from qp_playerHuiFang" + tableTime + " where uid1 < 1000000 \
                            UNION \
                            select uid2 as udid from qp_playerHuiFang" + tableTime + " where uid2 < 1000000 \
                            UNION \
                            select uid3 as udid from qp_playerHuiFang" + tableTime + " where uid3 < 1000000 \
                            UNION \
                            select uid4 as udid from qp_playerHuiFang" + tableTime + " where uid4 < 1000000 \
                            UNION \
                            select uid5 as udid from qp_playerHuiFang" + tableTime + " where uid5 < 1000000 \
                            UNION \
                            select uid6 as udid from qp_playerHuiFang" + tableTime + " where uid6 < 1000000 \
                            UNION \
                            select uid7 as udid from qp_playerHuiFang" + tableTime + " where uid7 < 1000000 \
                            UNION \
                            select uid8 as udid from qp_playerHuiFang" + tableTime + " where uid8 < 1000000)\
                            as t) as a,qp_player as b where a.uid = b.uid and b.rootAgent = ?;";
                            model.db.driver.execQuery(sql, [item.rootAgent], function (err, results) {
                                if (!!err) {
                                    callback(err);
                                }
                                // 代理线 活跃玩家数
                                rootAgentData.activePlayer = results[0].num;
                                callback(null);
                            })
                        },
                        //开局数 耗钻数 开局数
                        function (callback) {
                            var sql = "select sum(type) as expendNum,count(id) as tableNum from qp_playerhuifang" + tableTime +
                                " where fangZhu in (select uid from qp_player where rootAgent = ?)";
                            model.db.driver.execQuery(sql, [item.rootAgent], function (err, results) {
                                if (!!err) {
                                    callback(err);
                                }
                                // 代理线 耗钻数
                                rootAgentData.expendNum = results[0].expendNum;
                                // 代理线 开局数
                                rootAgentData.tableNum = results[0].tableNum;
                                callback(null);
                            });
                        },
                        //单条数据写入
                        function (callback) {
                            model.salesDailyData.create(rootAgentData, function (err, results) {
                                if (!!err) {
                                    callback(err);
                                }
                                callback(null);
                            });
                        }
                    ], function (err) {
                        if (!!err) {
                            cb2(err);
                        } else {
                            cb2(null);
                        }
                    })
                }, function (err) {
                    if (!!err) {
                        cb(err);
                    } else {
                        cb(null);
                    }
                });
            }
        ], function (err) {
            if (!!err) {
                console.log('每日销售线数据统计失败' + err);
                return;
            } else {
                console.log('每日销售数据统计完成');
                return;
            }
        });
    },

    //查询当前用户信息 改
    agent_data: function (req, res) {
        var info = req.body;
        if (!utils.verifySign(info, utils.getKey())) {
            res.status(200).json({code: error.SIGN_ERROR, msg: '安全验证失败!'});
            return;
        }
        if (!utils.checkSession(info.uid, info.session)) {
            res.status(200).json({code: error.SESSION_EXPIRE, msg: '会话过期，请重新登录!'});
            return;
        }
        var chargeAmount = 0;
        var playerNum = 0;
        var agentNum = 0;
        var bonusAvail = 0;
        var today = moment().format('YYYYMMDD');
        async.waterfall([
            //查询玩家信息 可提佣金
            function (cb) {
                model.user.find({uid: +info.uid}, 1, function (err, result) {
                    if (!!err) {
                        cb({code: error.DB_ERROR, msg: err});
                        return;
                    }
                    if (result.length == 0) {
                        cb({code: error.INT_ERROR, msg: '无权限查询!'});
                    }
                    bonusAvail = (parseFloat(result[0].bonusTotal) - parseFloat(result[0].bonusOut)).toFixed(2);
                    cb(null, result[0].agentId);
                })
            },
            // 绑定玩家数量 下探1层
            function (agentCode, cb) {
                model.player.count({agentCode: agentCode}, 1, function (err, result) {
                    if (!!err) {
                        cb({code: error.DB_ERROR, msg: err});
                        return;
                    }
                    playerNum = result;
                    cb(null);
                })
            },
            //获取绑定的10层玩家uid
            function (cb) {
                var sql = 'select uid from qp_player where agentCode in ' +
                    '(select agentId from qp_backenduser where uid = ? ' +
                    'or level1Agent = ? or level2Agent = ? or extl3Agent = ? ' +
                    'or extl4Agent = ? or extl5Agent = ? or extl6Agent = ? ' +
                    'or extl7Agent = ? or extl8Agent = ? or extl9Agent = ?' +
                    ')';
                model.db.driver.execQuery(sql, [
                    +info.uid, +info.uid, +info.uid, +info.uid, +info.uid,
                    +info.uid, +info.uid, +info.uid, +info.uid, +info.uid,
                ], function (err, result) {
                    if (!!err) {
                        cb({code: error.DB_ERROR, msg: err});
                        return;
                    }
                    var playerIds = [];
                    result.map(x => playerIds.push(x.uid));
                    cb(null, playerIds);
                })
            },
            //今日充值 下探10层
            function (playerIds, cb) {
                model.payRecord.aggregate({
                    playerId: playerIds,
                    completeTime: today
                }).sum('orderAmount').get(function (err, result) {
                    if (!!err) {
                        cb({code: error.DB_ERROR, msg: err});
                        return;
                    }
                    chargeAmount = parseFloat(result + 0).toFixed(2);
                    cb(null)
                })
            },
            //下级代理数量
            function (cb) { // 查询下级代理数
                model.user.count({level2Agent: +info.uid}, function (err, result) {
                    if (!!err) {
                        cb({code: error.DB_ERROR, msg: err});
                        return
                    }
                    agentNum = result;
                    cb(null);
                });
            },
        ], function (err) {
            if (!!err) {
                res.status(200).json(err);
                return;
            }
            res.status(200).json({
                code: 200,
                data: {chargeAmount: chargeAmount, bonusAvail: bonusAvail, playerNum: playerNum, agentNum: agentNum},
                session: utils.getSession(info.uid)
            });
        })
    },
};

module.exports = data;
