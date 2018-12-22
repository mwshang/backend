var express = require('express');
var http = require('http');
var fs = require("fs");
var path = require('path');
var process = require('process');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var schedule = require('node-schedule');

var area = require('./area');
var model = require('./model');
var user = require('./routes/user');
var player = require('./routes/player');
var gameop = require('./routes/gameop');
var settings = require('./routes/settings');
var data = require('./routes/data');
var mall = require('./routes/mall');
var withdraw = require('./routes/withdraw');
var withdraw_manual = require('./routes/withdraw_manual');
var IMVoice = require('./imvoice').IMVoice;
var nbAdapter = require('./routes/nb_adapter');

var app = express();

app.set('port', process.env.PORT || 30160);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'yjsss_yy')));

var orm = require("orm");
orm.connect(area.current().db, function(err, db) {
    if (err)
        console.error('Connection error: ' + err);
    else {
        // connected
        model.init(db);

        schedule.scheduleJob('01 0 0 * * *', function(){
            console.log('统计昨日数据');
            data.produce();

            user.smsCodePool = [];

            if (area.current().id == 'qg') {
                console.log('清理聊天室');
                new IMVoice().BatchDelRooms();
            }
        });
        //统计十分钟数据
        var rule = new schedule.RecurrenceRule();
        rule.minute = [0, 10, 20, 30, 40, 50];
        schedule.scheduleJob(rule, function(){
            console.log('统计10分钟数据');
            data.produce10min();
        });
        //清楚遗留数据
    	var rule= new schedule.RecurrenceRule();
    	rule.hour = 5;
    	rule.minute = 0;
    	schedule.scheduleJob(rule,function(){
    	    console.log("清除遗留数据")
    	    data.clear_leave_over();	
    	})

        //每日4点 扣除奖池的 20%
    }
});

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

    next();
});

app.post('/user/register', user.register);
app.post('/user/login', user.login);
app.post('/user/auditAgent', user.auditAgent);
app.post('/user/donateCards', user.donateCards);
app.post('/user/sendNotice', user.sendNotice);
app.post('/user/deleteNotice', user.deleteNotice);
app.post('/user/addSubAgent', user.addSubAgent);
app.post('/user/donates', user.donates);
app.post('/user/donates_v2', user.donates_v2);
app.post('/user/agents', user.agents);
app.post('/user/changePwd', user.changePwd);
app.post('/user/bindAgent', user.bindAgent);
app.post('/user/bonus', user.bonus);
app.post('/user/bonus_v2', user.bonus_v2);
app.post('/user/bind', user.bind);
app.post('/user/checkBind', user.checkBind);
app.post('/user/getInfo', user.getInfo);
app.post('/user/payBonus', user.payBonus);
app.post('/user/getAgents', user.getAgents);
app.post('/user/getAgentsExt', user.getAgentsExt);
app.post('/user/agent', user.agent);
app.post('/user/agentExt', user.agentExt);
app.post('/user/getPlayers', user.getPlayers);
app.post('/user/getCharges', user.getCharges);
app.post('/user/getCharge', user.getCharge);
app.post('/user/bonusOut', user.bonusOut);
app.post('/user/getSmsCode', user.getSmsCode);
app.post('/user/smsApplyAgent', user.smsApplyAgent);
app.get('/user/getUid/:unionid', user.getUid);
app.post('/user/setBonusPercent', user.setBonusPercent);
app.post('/user/wx_getuser', user.wxGetUser);
app.post('/user/getBonusWxCfm', user.getBonusWxCfm);
app.post('/user/getLockedAgents', user.getLockedAgents);

app.post('/player/getPlayer', player.getPlayer);
app.post('/player/registerPlayer', player.registerPlayer); // register a weixin download user with agent code
app.post('/player/lockPlayer', player.lockPlayer);//封号解封 玩家  {uid(操作人)  pid(操作对象)  locked 1(锁) 0(解)}
app.post('/player/getLockedPlayerList', player.getLockedPlayerList);//获取封号玩家列表
app.post('/player/getLockedPlayer', player.getLockedPlayer);//获取封号玩家 {uid(操作人) pid(被查询人)}

app.post('/gameop/notice', gameop.notice); //list
app.post('/gameop/closeRoom', gameop.closeRoom); //close room
app.post('/gameop/getServerTypes', gameop.getServerTypes);

app.post('/data/operatordata_v2', data.operatordata_v2);
app.post('/data/operatordata', data.operatordata);
app.post('/data/operatordata1', data.operatordata1);
app.post('/data/operatordata2', data.operatordata2);
app.post('/data/agentdata', data.agentdata);
app.post('/data/operatordata_bygame', data.operatordata_bygame);

// 摇摇乐  每日4点 统计昨天数据 扣除奖池
app.post('/data/yyl_socket', data.yyl_socket);
// 摇摇乐 每日数据 分页查询
app.post('/data/yyl_daily', data.yyl_daily);
app.post('/data/playerdata', data.playerdata);
app.post('/data/playerdata_detail', data.playerdata_detail);

app.post('/mall/purchase', mall.purchase);
app.post('/mall/payNotify', mall.payNotify);
app.post('/mall/wpayNotify', mall.wpayNotify);

app.post('/withdraw/withdraw', withdraw.withdraw);
app.post('/withdraw/withdrawNotify', withdraw.withdrawNotify);
app.post('/withdraw/wpwithdrawNotify', withdraw.wpwithdrawNotify);
app.post('/withdraw_manual/withdraw', withdraw_manual.withdraw);
app.post('/withdraw_manual/withdrawNotify', withdraw_manual.withdrawNotify);

app.post('/settings/load', settings.load);
app.post('/settings/save', settings.save);

app.post('/api/recharge', nbAdapter.recharge);
app.post('/api/queryplayer', nbAdapter.queryplayer);
app.post('/api/bindinvitation', nbAdapter.bindinvitation);
app.post('/api/lockplayer', nbAdapter.lockplayer);
app.post('/api/queryonlinenumber', nbAdapter.queryonlinenumber);
app.post('/api/gamestatistic', nbAdapter.gamestatistic);

process.on('uncaughtException', function (err) {
    console.log(err);
    console.log(err.stack);
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
