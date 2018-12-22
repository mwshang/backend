var https = require('https');
var moment = require('moment');
var qs = require('querystring');
var async = require('async');
var MD5 = require('md5');
var error = require('../constants');
var model = require('../model');
var utils = require('../utils');
var area = require('../area');
var user = require('./user');

var mall = {
  merchantNo: '10403684',
  md5Key: 'xiayou',
  wpAppId: '85460849cdb23ed92ae59c334a589566',
  wpKey: 'LuxyuGuvRvWdxqsLiZuRVtEDdrFZZPXk',

  // 充值下单
  purchase: function(req, res) {
    var params = req.body;
    console.log(params);

    params.productName = '购买钻石';
    var time = moment().format('YYYYMMDDHHmmss');
    var payRecord = {playerId: params.uid, productName: params.productName, productNum: params.count, payChannel:params.channel,
                      orderNo: time + '' + params.uid,
                      traceNo: time + '' + params.uid,
                      status: 0};

    var l1AgentCardPrice = '', l2AgentCardPrice = '', l3AgentCardPrice = '';

    async.waterfall([
      function(cb) { // 查房卡价格
        console.log('check cardPrice');
        model.settings.find({key: 'cardPrice'}, 1, function(err, results) {
          if (err != null) {
            console.log('check cardPrice err');
            cb({code: error.DB_ERROR, msg: err});
          } else {
            if (results.length == 0) {
              console.log('check price empty');
              cb({code: error.INT_ERROR, msg: '房卡价格未配置.'});
            } else {
              console.log(results[0].value);
              cb(null, results[0].value);
            }
          }
        });
      },
      function(playerPrice, cb) { // 查l3Agent房卡价格
        console.log('check cardPrice');
        model.settings.find({key: 'l3AgentCardPrice'}, 1, function(err, results) {
          if (err == null && results.length > 0)
            l3AgentCardPrice = results[0].value;

          cb(null, playerPrice);
        });
      },
      function(playerPrice, cb) { // 查l2Agent房卡价格
        console.log('check cardPrice');
        model.settings.find({key: 'l2AgentCardPrice'}, 1, function(err, results) {
          if (err == null && results.length > 0)
            l2AgentCardPrice = results[0].value;

          cb(null, playerPrice);
        });
      },
      function(playerPrice, cb) { // 查l1Agent房卡价格
        console.log('check cardPrice');
        model.settings.find({key: 'l1AgentCardPrice'}, 1, function(err, results) {
          if (err == null && results.length > 0)
            l1AgentCardPrice = results[0].value;

          cb(null, playerPrice);
        });
      },
      function(playerPrice, cb) { // 检测用户信息
        console.log('check user');
        model.user.find({uid: params.uid}, 1, function(err, results) {
          if (err == null && results.length > 0) {
            if (results[0].agentLevel == 3 && l3AgentCardPrice.length > 0)
              cb(null, l3AgentCardPrice);
            else if (results[0].agentLevel == 2 && l2AgentCardPrice.length > 0)
              cb(null, l2AgentCardPrice);
            else if (results[0].agentLevel == 1 && l1AgentCardPrice.length > 0)
              cb(null, l1AgentCardPrice);
            else
              cb(null, playerPrice);
          } else {
            cb(null, playerPrice);
          }
        });
      },
      function(price, cb) { // store payRecord
        console.log('store payRecord');

        var items = price.split('|');
        for (var i in items) {
          var prices = items[i].split(':');
          console.log(prices);
          if (parseInt(params.count) == parseInt(prices[0])) {
            payRecord.orderAmount = parseFloat(prices[1]);
            console.log(payRecord.orderAmount);
            break;
          }
        }

        console.log(payRecord.orderAmount);
        if (payRecord.orderAmount == undefined)
          payRecord.orderAmount = 1.0;
        model.payRecord.create(payRecord, function(err, results) {
          if (err != null) {
              console.log('store payRecord', err);
            cb({code: error.DB_ERROR, msg: err});
          } else {
            cb(null);
          }
        });
      },
      function(cb) {
        if (params.paySP == 0) { // 前端重定向到SFT充值
          var get_ip = function(req) {
            var ip = req.headers['x-real-ip']
              || req.headers['x-forwarded-for']
              || req.connection.remoteAddress
              || req.socket.remoteAddress
              ||'';
            if(ip.split(',').length > 0){
              ip = ip.split(',')[0];
            }
            return ip;
          };

          var ip = get_ip(req);
          console.log('pay to SFT: ', req.headers, req.ip, ip, req.connection.remoteAddress, req.socket.remoteAddress);

          var data = {Name: 'B2CPayment', Version: 'V4.1.1.1.1', Charset: 'UTF-8', TraceNo: payRecord.traceNo,
            MsgSender: mall.merchantNo, SendTime: moment().format('YYYYMMDDHHmmss'), OrderNo: payRecord.orderNo,
            OrderAmount: payRecord.orderAmount, OrderTime: moment().format('YYYYMMDDHHmmss'),
            ExpireTime: moment().add(15, 'minutes').format('YYYYMMDDHHmmss'), Currency: 'CNY', PayType: 'PT312',
            PayChannel: params.channel, InstCode: '', PageUrl: 'http://' + area.current().mallsrv + '/payresult.html',
            NotifyUrl: area.current().host + '/mall/payNotify', ProductName: params.productName, ProductNum: params.count,
            BuyerIp: ip, Ext2: '', SignType: 'MD5', SignMsg: ''};

          if (data.PayChannel == 'ha')
            data.InstCode = 'H5WA';
          else if (data.PayChannel == 'hw')
            data.InstCode = 'H5WX';

          data.Ext2 = JSON.stringify(
            {"requestFrom":"WAP","app_name":"","bundle_id":"", "package_name":"",
              "wap_url":"http://" + area.current().mallsrv + "/mall.html","wap_name":"钻石商城","note":"","attach":""});

          var mac = '';
          for(var i in data){
            if (data.hasOwnProperty(i)) {
              mac += data[i];
            };
          }
          data.SignMsg = MD5(mac+mall.md5Key);

          var postToSFT = function(host, path, data, cb) {
            var content = qs.stringify(data);
            console.log(content);

            var options = {
              hostname: host,
              path: path,
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Content-Length": content.length
              }
            };

            var req = https.request(options, function (res) {
              console.log('STATUS: ' + res.statusCode);
              console.log('HEADERS: ' + JSON.stringify(res.headers));
              var BODY = '';
              res.on('data', function (chunk) {
                BODY += chunk;
              }).on('end', function() {
                console.log('BODY: ' + BODY);
                if (res.statusCode == 200)
                  cb(null, null, BODY);
                else if (res.statusCode == 302) {
                  cb(null, res.headers.location, null);
                }
              });
            });

            req.on('error', function (e) {
              console.log('problem with request: ' + e.message);
              cb(e);
            });

            // write data to request body
            req.write(content);
            req.end();
          }

          if (params.channel == 'ha')
            postToSFT('cardpay.shengpay.com', '/mobile-acquire-channel/cashier.htm', data, function(err, location, html) {
              cb(err, location, html);
            });
          else {
            cb(null, data, null);
          }
        } else { // WiiPay
          var app_id = mall.wpAppId;//微派分配的appId,联系运营人员获取，实际项目中请替换真实appId
          var body = "购买钻石"; //商品名称，必填项，请勿包含敏感词
          var callback_url = 'http://' + area.current().mallsrv + '/payresult.html';//支付成功后跳转的商户页面(用户看到的页面)
          var channel_id = "default";//渠道编号
          var out_trade_no = payRecord.traceNo; //商户单号，确保不重复，如想透传更多参数信息，建议以Json-->String->Base64编码后传输，必填项
          var total_fee = payRecord.orderAmount;//商品价格(单位:元)，必填项
          var version = "2.0"; //版本号，默认填写2.0即可，必填项
          var key = mall.wpKey;//签名所需key,联系运营人员获取

          //本签名示例，仅为了演示，实际项目中为了安全考虑，请勿将key对外。字符串拼接规则为，参与签名的参数，按字母序key=value方式然后加上key进行md5,最后sign转大写
          var sign_prep = "app_id="+app_id+"&body="+body+"&callback_url="+callback_url+"&channel_id="
            +channel_id+"&out_trade_no="+out_trade_no+"&total_fee="+total_fee+"&version="+version+key;
          console.log(sign_prep);
          var sign = MD5(sign_prep).toUpperCase();//签名串,签名规则:MD5，utf-8
          console.log(sign);

          cb(null, {
            //"instant_channel":"ali",//配置默认支付方式，当仅有一个支付方式时，不会弹出收银台，会直接跳转到支付界面；支付宝ali，微信公众号wx，银联un，网银wy，此参数不参与签名
            // "debug":1, //开启调试模式，会显示错误信息，注意，上线后需要去掉，此参数不参与签名
            "body":body,
            "callback_url" : callback_url,
            "channel_id":channel_id,
            "out_trade_no":out_trade_no,
            "total_fee":total_fee,
            "sign":sign,
            "version":version
          }, null);
        }
      }
    ], function (err, location, html) {
      if (err)
          res.status(200).json(err);
      else {
        utils.operateLog(params.uid, '购买钻石订单');
        res.status(200).json({code:200, data:{url: location, html: html}});
      }
    });
  },

  // 盛付通通知
  payNotify: function (req, res) {
    var params = req.body;
    console.log('payNotify', params);

    var checkString = params.Name+params.Version+params.Charset+params.TraceNo+params.MsgSender+params.SendTime+params.InstCode
                      +params.OrderNo+params.OrderAmount+params.TransNo+params.TransAmount+params.TransStatus+params.TransType
                      +params.TransTime+params.MerchantNo
                      +params.ErrorCode+params.ErrorMsg
                      +params.Ext1+params.Ext2+params.SignType;
    var sign = MD5(checkString+mall.md5Key);
    console.log(checkString, sign);
    if (sign == params.SignMsg.toLowerCase()) {
      model.payRecord.find({orderNo: params.OrderNo}, 10, ['id','Z'], function (err, results) {
        if (err != null || results.length == 0) {
          console.log(params.OrderNo, 'orderNo not exist');
          res.send('OK');
        } else {
          res.send('OK');

          var payRecord = results[0];
          if (params.TransStatus == '01' && payRecord.status != 1) {
            payRecord.save({status: parseInt(params.TransStatus)}, function (err) {
              console.log(params.OrderNo, 'update orderNo status ' + params.TransStatus);
              utils.operateLog(payRecord.playerId, '支付订单成功 '+params.OrderNo+'|'+params.TransStatus);
            });


            var l1AgentCardPrice = '', l2AgentCardPrice = '', l3AgentCardPrice = '';

            async.waterfall([
              function(cb) { // 查房卡价格
                console.log('check cardPrice');
                model.settings.find({key: 'cardPrice'}, 1, function(err, results) {
                  if (err != null) {
                    console.log('check cardPrice err');
                    cb({code: error.DB_ERROR, msg: err});
                  } else {
                    if (results.length == 0) {
                      console.log('check price empty');
                      cb({code: error.INT_ERROR, msg: '房卡价格未配置.'});
                    } else {
                      console.log(results[0].value);
                      cb(null, results[0].value);
                    }
                  }
                });
              },
              function(playerPrice, cb) { // 查l3Agent房卡价格
                console.log('check cardPrice');
                model.settings.find({key: 'l3AgentCardPrice'}, 1, function(err, results) {
                  if (err == null && results.length > 0)
                    l3AgentCardPrice = results[0].value;

                  cb(null, playerPrice);
                });
              },
              function(playerPrice, cb) { // 查l2Agent房卡价格
                console.log('check cardPrice');
                model.settings.find({key: 'l2AgentCardPrice'}, 1, function(err, results) {
                  if (err == null && results.length > 0)
                    l2AgentCardPrice = results[0].value;

                  cb(null, playerPrice);
                });
              },
              function(playerPrice, cb) { // 查l1Agent房卡价格
                console.log('check cardPrice');
                model.settings.find({key: 'l1AgentCardPrice'}, 1, function(err, results) {
                  if (err == null && results.length > 0)
                    l1AgentCardPrice = results[0].value;

                  cb(null, playerPrice);
                });
              },
              function(playerPrice, cb) { // 检测用户信息
                console.log('check user');
                model.user.find({uid: payRecord.playerId}, 1, function(err, results) {
                  if (err == null && results.length > 0) {
                    if (results[0].agentLevel == 3 && l3AgentCardPrice.length > 0)
                      cb(null, l3AgentCardPrice);
                    else if (results[0].agentLevel == 2 && l2AgentCardPrice.length > 0)
                      cb(null, l2AgentCardPrice);
                    else if (results[0].agentLevel == 1 && l1AgentCardPrice.length > 0)
                      cb(null, l1AgentCardPrice);
                    else
                      cb(null, playerPrice);
                  } else {
                    cb(null, playerPrice);
                  }
                });
              }
            ], function (err, price) {
              var amount = parseInt(params.OrderAmount);
              var count = 10;
              var items = price.split('|');
              for (var i in items) {
                var prices = items[i].split(':');
                if (amount == parseInt(prices[1])) {
                  count = parseInt(prices[0]);
                  break;
                }
              }

              var userinfo = {uid: 100000, pid: payRecord.playerId, gem: count, payId: payRecord.id};
              user._donateCards(userinfo.uid, userinfo.pid, userinfo.gem, 0, userinfo.payId, function(err, result) {
                if (err != null) {
                  console.log(params.OrderNo, 'pay success but donate card fail', err);
                  utils.operateLog(payRecord.playerId, '支付成功,发钻失败 '+params.OrderNo+'|'+err.code);
                } else {
                  user.donateBonus(userinfo, result.id, params.TransAmount);
                }
              });
            });
          } else if (params.TransStatus == '00') {

          } else if (params.TransStatus == '02' || params.TransStatus == '03'
            || params.TransStatus == '09' || params.TransStatus == '10' || params.TransStatus == '11') {
            payRecord.save({status: parseInt(params.TransStatus)}, function (err) {
              console.log(params.OrderNo, 'update orderNo status ' + params.TransStatus);
            });
            utils.operateLog(payRecord.playerId, '支付订单失败 '+params.OrderNo+'|'+params.TransStatus);
          }
        }
      });
    } else {
      console.log(params.OrderNo, 'md5 check failed');
      res.send('FAIL');
    }
  },

  // 微派通知
  wpayNotify: function (req, res) {
    var params = req.body;
    console.log('wpayNotify', params);

    var checkString = 'cpparam='+params.cpparam+'&orderNo='+params.orderNo+'&price='+params.price+'&status='+params.status
      +'&synType='+params.synType+'&time='+params.time;
    var sign = MD5(checkString+mall.wpKey);
    console.log(checkString, sign);
    if (sign == params.sign.toLowerCase()) {
      model.payRecord.find({orderNo: params.cpparam}, 10, ['id','Z'], function (err, results) {
        if (err != null || results.length == 0) {
          console.log(params.cpparam, 'orderNo not exist');
          res.send('success');
        } else {
          res.send('success');

          var payRecord = results[0];
          if (params.status == 'success' && payRecord.status != 1) {
            payRecord.save({status: 1, payChannel: params.synType}, function (err) {
              console.log(params.cpparam, 'update orderNo status ' + params.status);
              utils.operateLog(payRecord.playerId, '支付订单成功 '+params.cpparam+'|'+params.status);
            });

            var l1AgentCardPrice = '', l2AgentCardPrice = '', l3AgentCardPrice = '';

            async.waterfall([
              function(cb) { // 查房卡价格
                console.log('check cardPrice');
                model.settings.find({key: 'cardPrice'}, 1, function(err, results) {
                  if (err != null) {
                    console.log('check cardPrice err');
                    cb({code: error.DB_ERROR, msg: err});
                  } else {
                    if (results.length == 0) {
                      console.log('check price empty');
                      cb({code: error.INT_ERROR, msg: '房卡价格未配置.'});
                    } else {
                      console.log(results[0].value);
                      cb(null, results[0].value);
                    }
                  }
                });
              },
              function(playerPrice, cb) { // 查l3Agent房卡价格
                console.log('check cardPrice');
                model.settings.find({key: 'l3AgentCardPrice'}, 1, function(err, results) {
                  if (err == null && results.length > 0)
                    l3AgentCardPrice = results[0].value;

                  cb(null, playerPrice);
                });
              },
              function(playerPrice, cb) { // 查l2Agent房卡价格
                console.log('check cardPrice');
                model.settings.find({key: 'l2AgentCardPrice'}, 1, function(err, results) {
                  if (err == null && results.length > 0)
                    l2AgentCardPrice = results[0].value;

                  cb(null, playerPrice);
                });
              },
              function(playerPrice, cb) { // 查l1Agent房卡价格
                console.log('check cardPrice');
                model.settings.find({key: 'l1AgentCardPrice'}, 1, function(err, results) {
                  if (err == null && results.length > 0)
                    l1AgentCardPrice = results[0].value;

                  cb(null, playerPrice);
                });
              },
              function(playerPrice, cb) { // 检测用户信息
                console.log('check user');
                model.user.find({uid: payRecord.playerId}, 1, function(err, results) {
                  if (err == null && results.length > 0) {
                    if (results[0].agentLevel == 3 && l3AgentCardPrice.length > 0)
                      cb(null, l3AgentCardPrice);
                    else if (results[0].agentLevel == 2 && l2AgentCardPrice.length > 0)
                      cb(null, l2AgentCardPrice);
                    else if (results[0].agentLevel == 1 && l1AgentCardPrice.length > 0)
                      cb(null, l1AgentCardPrice);
                    else
                      cb(null, playerPrice);
                  } else {
                    cb(null, playerPrice);
                  }
                });
              }
            ], function (err, price) {
              var amount = parseInt(params.price);
              var count = 10;
              console.log(err, price, amount);

              var items = price.split('|');
              for (var i in items) {
                var prices = items[i].split(':');
                if (amount == parseInt(prices[1])) {
                  count = parseInt(prices[0]);
                  break;
                }
              }

              var userinfo = {uid: 100000, pid: payRecord.playerId, gem: count, payId: payRecord.id};
              user._donateCards(userinfo.uid, userinfo.pid, userinfo.gem, 0, userinfo.payId, function(err, result) {
                if (err != null) {
                  console.log(params.cpparam, 'pay success but donate card fail', err);
                  utils.operateLog(payRecord.playerId, '支付成功,发钻失败 '+params.cpparam+'|'+err.code);
                } else {
                  user.donateBonus(userinfo, result.id, params.price);
                }
              });
            });
          } else if (params.status != 'success') {
            payRecord.save({status: 2, payChannel: params.synType}, function (err) {
              console.log(params.cpparam, 'update orderNo status: ' + params.status);
            });
            utils.operateLog(payRecord.playerId, '支付订单失败 '+params.cpparam+'|'+params.status);
          }
        }
      });
    } else {
      console.log(params.cpparam, 'md5 check failed');
      res.send('FAIL');
    }
  },
}

module.exports = mall;
