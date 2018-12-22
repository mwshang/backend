var https = require("https");
var http = require("http");
var url = require("url");
var async = require('async');

//亲佳IM  http://www.gotye.com.cn/docs/ime/restapi.html
/*
 3001	roomId为空
 3003	无效的roomId
 3005	room对象为空
 3007	无效的roomType
 3009	超过app最大创建聊天室个数
* */

var IMConfig = {
    expired_in : 0,      // token 超时
    api_url : "",         // api调用路径
    access_token : undefined,   // access token
    app_key : "a3c5e1ba-59d7-4c52-baa1-22854383407b",
    expired_in_second : 0 // 多少秒后超时
}

exports.IMVoice = function(){
    this.expired_in = IMConfig.expired_in;        // token 超时
    this.api_url = IMConfig.api_url;          // api调用路径
    this.access_token = IMConfig.access_token;   // access token
    this.app_key = IMConfig.app_key;
    this.expired_in_second = IMConfig.expired_in_second; // 多少秒后超时
    var self = this;
    
    this.tokenExpired = function () {
        var nowTime = Date.now() / 1000;
        
        return self.expired_in_second < nowTime;
    } 
    
    this.GetToken = function(_cb) {
        if (this.access_token === undefined || this.tokenExpired()) {
            if (this.access_token === undefined){
                console.log("request gettoken:" + this.access_token);
            }
            var urlInfo = url.parse("https://api.gotye.com.cn/api/accessToken");
            var options = {
                method:'POST',
                host:urlInfo.hostname,
                port:urlInfo.protocol == "https:" ? 443 : 80,
                path:urlInfo.path,
                headers:{
                    "Accept":"application/json",
                    "Content-Type":'application/json'
                }
            }

            var post_data = {
               "grant_type": "client_credentials",
               "client_id": this.app_key,
               "client_secret": "5360bfa6b48a4d5d80df67849774ede2"
            }

            this.Post(options, post_data, urlInfo.protocol, function(data, err) {
                if (!!err) {
                    _cb(undefined, err);
                    return;
                }
                if (!!data.errorDesc){
                    _cb(undefined, data.errorDesc);
                    return;
                }
                if (!!data.status){
                    if (data.status != 200){
                        console.log("语音调用返回错误码:%j", data);
                        _cb(undefined, data.status+"")
                        return;
                    }
                }
                //{"api_url":"http://api.gotye.com.cn/api","expires_in":86400,"access_token":"365ddedc6852ff56ea43dc9e6e301394"}
                IMConfig.expired_in = self.expired_in = data.expires_in;      // token 超时
                IMConfig.api_url = self.api_url = data.api_url;            // api调用路径
                IMConfig.access_token = self.access_token = data.access_token;  // access token

                if (self.expired_in == undefined || !self.expired_in){
                    IMConfig.expired_in = self.expired_in = 86400;
                }
                IMConfig.expired_in_second = self.expired_in_second = self.expired_in + Date.now() / 1000;

                _cb(self.access_token, undefined);
            });
        } else {
            console.log("getCache Token");
            _cb(this.access_token, undefined);
        }
    }    

    this.Post = function(_options, _post_data, _protocol, _cb) {
        var req = (_protocol == "https:" ? https : http).request(_options, function(res){
            var res_data = "";
            res.on("error", function(err){
                _cb(undefined, err);
            });
            res.on("data", function(data) {
                res_data += data;
            });
            res.on("end", function() {
                var data = JSON.parse(res_data);
                _cb(data, undefined);
            });
        });
        req.on("error", function(err){
            _cb(undefined, err);
        });
        req.write(JSON.stringify(_post_data));
        req.end();
    }

    this.OpPost = function(_op, _post_data, _cb) {

        this.GetToken(function (_token, err) {
            if (!!err) {
                _cb(undefined, err);
                return;
            }

            if (self.api_url == undefined){
                _cb(undefined, "IM Error");
                return;
            }

            var urlInfo = url.parse(self.api_url);
            var options = {
                method:'POST',
                host:urlInfo.hostname,
                port:urlInfo.port,
                path:urlInfo.path + _op,
                headers:{
                    "Accept":"application/json",
                    "Content-Type":'application/json',
                    "Authorization": "Bearer " + self.access_token
                }
            }

            self.Post(options, _post_data, urlInfo.protocol, function (data, err) {
                if (data == undefined){
                    _cb(undefined, err);
                    return;
                } else {
                    if (data.status != 200){
                        console.error("语音调用返回错误码:%j", _post_data);
                        console.error("语音接口失败：%j", data);
                        _cb(undefined, data.status + "");
                        return;
                    }
                }
                console.log("imCB:%j", data);
                _cb(data, err);
            });
        });
    }

    // 删除房间
    this.DelRoom = function (_roomId, _cb) {
        var post_data = {
            "appkey":this.app_key,
            "roomId":_roomId    // 聊天室名
        }
        console.log(post_data);
        this.OpPost("/DelIMRoom", post_data, function(data, err) {
            if (!!err) {
                console.log("删除房间失败:%j" , data);
                _cb(undefined, err);
                return;
            }
            console.log("删除房间成功：%j", data);
            _cb(_roomId, data);
        });
    }

    //获取聊天室列表
    /*
     "status": 200,
     "entities": [{
     "roomId": 340900,
     }]
    * */
    this.GetRoomLists = function(cb){
        var post_data = {
            "appkey":this.app_key,
            "names":[],
            "index": 0,
            "count":500
        }
        console.log(post_data);
        this.OpPost("/GetIMRooms", post_data, function(data, err) {
            if (!!err) {
                console.log("获取房间列表失败:%j" , err);
                cb(err);
                return;
            }
            console.log("获取房间列表成功");
            cb(data);
        });
    }

    // 批量删除聊天室
    var self = this;
    var BATCH_NUM = 5;
    var INTERVAL_TIME = 200;

    this.BatchDelRooms = function() {
        var batch = [];
        for (var i=0; i<BATCH_NUM; i++) {
            batch.push(function (cb) {
                self.GetRoomLists(function (data) {
                    var roomsDel = [];
                    var k = 0;
                    for (var j in data.entities) {
                        roomsDel.push(function (cb1) {
                            console.log('roomId:', data.entities[k].roomId);
                            self.DelRoom(data.entities[k++].roomId, function (data, err) {
                                console.log('DelRoom:', data, err);
                                setTimeout(function () {
                                    cb1();
                                }, INTERVAL_TIME);
                            });
                        });
                    }

                    async.waterfall(roomsDel, function (err, result) {
                        console.log(err, result);
                        cb();
                    });
                });
            });
        }

        async.waterfall(batch, function (err, result) {
            console.log(err, result);
        });
    }
}
