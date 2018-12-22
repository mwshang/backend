var https = require('https');
var http = require('http');
var moment = require('moment');
var qs = require('querystring');
var async = require('async');
var MD5 = require('md5');
var error = require('../constants');
var model = require('../model');
var utils = require('../utils');
var xml2js = require('../xml2js');
var area = require('../area');
var user = require('./user');

var withdraw = {
  merchantNo: '10403684',
  md5Key: 'xiayou',
  wpAppId: 'e8367b669190b87ca340d1ae4ea5423f',
  wpKey: 'qgdfITmVcNsrrVkcEWsbriumPXqubetQ',

  // 提现
  withdraw: function(req, res) {
    var params = req.body;
    console.log('withdraw', params);

    var outRecord = {uid: params.uid, cny: params.cny,
                      bankAccount: params.bankAccount, bankUserName: params.bankUserName, bankName: params.bankName,
                      batchNo: moment().format('YYYYMMDDHHmmss') + '' + params.uid,
                      serialNo: moment().format('YYYYMMDDHHmmss') + '' + params.uid,
                      status: 0};

    var player = {};

    async.waterfall([
      function(cb) {
        model.player.find({uid: params.uid}, function (err, results) {
          if (err != null || results.length == 0) {
            cb({code: error.DB_ERROR, msg: err});
          } else {
            player = results[0];
            cb(null);
          }
        });
      },
      function (cb) {
        model.settings.find({key: 'paySP'}, 1, function(err, results) {
          if (err == null && results.length > 0)
            params.paySP = parseInt(results[0].value);
          cb(null);
        });
      },
      function(cb) {
        if (params.paySP == 0 && outRecord.cny - 2.0 <= 0) {
          cb({code: error.INT_ERROR, msg: '扣除税费后金额太低'});
        } else {
          cb(null);
        }
      },
      function(cb) { // check available bonus
        model.user.find({uid: params.uid}, function (err, results) {
          if (err != null || results.length == 0) {
            cb({code: error.DB_ERROR, msg: err});
          } else {
            var user = results[0];
            if (user.bonusTotal == null)
              user.bonusTotal = 0;

            if (user.bonusOut == null)
              user.bonusOut = 0;

            if (parseFloat(user.bonusOut) + parseFloat(params.cny) > parseFloat(user.bonusTotal)) {
              cb({code: 1000, msg: '金额超过可提佣金额度!'});
            } else
              cb(null);
          }
        });
      },
      function(cb) { // find bonusOutRecord
        console.log('find bonusOutRecord');
        model.db.driver.execQuery(
          "SELECT * FROM qp_fangkabonusout WHERE uid=? and status=1 and unix_timestamp(now())-unix_timestamp(createTime)<86400;", [params.uid], function (err, results) {
            if (err != null) {
              console.log('find bonusOutRecord', err);
              cb({code: error.DB_ERROR, msg: err});
            } else {
              if (results.length == 0)
                cb(null);
              else {
                cb({code: 1000, msg: '24小时内只能提现一次!'});
              }
            }
          });
      },
      function(cb) { // store bonusOutRecord
        console.log('store bonusOutRecord');
        model.bonusOut1.create(outRecord, function(err, results) {
          if (err != null) {
              console.log('store bonusOutRecord', err);
            cb({code: error.DB_ERROR, msg: err});
          } else {
            cb(null);
          }
        });
      },
      function(cb) {
        if (params.paySP == 0) { // SFT
          var request = {
            batchNo: outRecord.batchNo,
            totalAmount: (outRecord.cny - 2.0).toFixed(2),
            charset: 'utf-8',
            customerNo: withdraw.merchantNo,
            callbackUrl: area.current().host + '/withdraw/withdrawNotify',
            remark: '佣金提现' + outRecord.cny + '元',
            signType: 'MD5',
            sign: ''
          };
          var details = {
            id: outRecord.serialNo,
            bankName: outRecord.bankName,
            accountType: 'C',
            bankUserName: outRecord.bankUserName,
            bankAccount: outRecord.bankAccount,
            amount: (outRecord.cny - 2.0).toFixed(2),
            remark: '佣金提现' + outRecord.cny + '元'
          };

          var mac = request.charset + request.signType + request.customerNo + request.batchNo + request.callbackUrl + request.totalAmount +
            details.id + details.bankName + details.accountType + details.bankUserName +
            details.bankAccount + details.amount + details.remark;
          request.sign = MD5(mac + withdraw.md5Key).toUpperCase();

          request.details = [details];

          var data = {
            arg0: request
          };

          console.log('withdraw:', data);

          var soap = require('soap');
          var url = 'http://mtc.shengpay.com/services/BatchPayment/BatchPayment?wsdl';
          soap.createClient(url, function (err, client) {
            client.directApply(data, function (err, result) {
              console.log('withdraw resp:', result);
              result = result.return;
              var verify = 'batchNo=' + result.batchNo + 'resultCode=' + result.resultCode + 'resultMessage=' + result.resultMessage;
              var sign = MD5(verify + withdraw.md5Key);
              if (result.sign != undefined && sign == result.sign.toLowerCase()) {
                cb(null, result.resultCode == '00' ? 2 : 3); // 2:申请成功   3:申请失败
              } else {
                cb({code: error.INT_ERROR, msg: 'invalid sign'});
              }
            });
          });
        } else { // WiiPay
          var request = {};
          request['appid'] = withdraw.wpAppId; //微派分配的appId,联系运营人员获取，实际项目中请替换真实appId
          request['notify_cardholder'] = "n";
          request['cardholder_mobile'] = '';
          request['cardholder_name'] = player.userName;// user openId
          request['transfer_type'] = "weixin";
          request['out_trade_no'] = outRecord.batchNo; //商户单号，确保不重复，如想透传更多参数信息，建议以Json-->String->Base64编码后传输，必填项
          request['amount'] = (outRecord.cny-2.0).toFixed(2);//商品价格(单位:元)，必填项
          request['version'] = "2.0"; //版本号，默认填写2.0即可，必填项

          //本签名示例，仅为了演示，实际项目中为了安全考虑，请勿将key对外。字符串拼接规则为，参与签名的参数，按字母序key=value方式然后加上key进行md5,最后sign转大写request.
          var sign_prep = "amount="+request.amount+"&appid="+request.appid+"&cardholder_name="+request.cardholder_name+"&notify_cardholder="+request.notify_cardholder
                          +"&out_trade_no="+request.out_trade_no+"&transfer_type="+request.transfer_type+"&version="+request.version+withdraw.wpKey;
          console.log(sign_prep);
          request['sign'] = MD5(sign_prep).toUpperCase();//签名串,签名规则:MD5，utf-8
          console.log(request['sign']);

          var postToWP = function(data, cb) {
            var content = qs.stringify(data);
            console.log(content);

            var options = {
              hostname: 'dkapi.wiipay.cn',
              path: '/transfer/transfer.do',
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Content-Length": content.length
              }
            };

            var req = http.request(options, function (res) {
              console.log('STATUS: ' + res.statusCode);
              console.log('HEADERS: ' + JSON.stringify(res.headers));
              var BODY = '';
              res.on('data', function (chunk) {
                BODY += chunk;
              }).on('end', function() {
                console.log('BODY: ' + BODY);
                if (res.statusCode == 200)
                  cb(null, JSON.parse(BODY));
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

          postToWP(request, function(err, data) {
            var cfmUrl = '';
            if (data.code == 10000 && data.withdraw_url != undefined && data.withdraw_url != null && data.withdraw_url.length > 0)
              cfmUrl = data.withdraw_url + '?cardholder_name='+request.cardholder_name;
              cb(null, data.code == 10000 ? 2 : 3, cfmUrl); // 2:申请成功   3:申请失败
          });
        }
      },
      function(result, cfmUrl, cb) {
        console.log('store status', result, cfmUrl);

        model.bonusOut.find({batchNo: outRecord.batchNo}, 1, function(err, results) {
          if (err != null || results.length == 0) {
            console.log('bonusOut batchNo err', err);
            utils.operateLog(params.uid, '数据库操作错误 '+ result +'|'+ outRecord.batchNo);
            cb({code: error.DB_ERROR, msg: err});
          } else {
            results[0].save({status: result, wxCfmUrl: cfmUrl}, function (err) {
              console.log(outRecord.batchNo, 'update batchNo status ' + result + ' ' + cfmUrl);
              cb(null, result, cfmUrl);
            });
          }
        });
      },
      function (result, cfmUrl, cb) {
        if (result == 1 || result == 2) {
          model.user.find({uid: params.uid}, function (err, results) {
            if (err != null || results.length == 0) {
              cb({code: error.DB_ERROR, msg: err});
            } else {
              var user = results[0];
              if (results[0].bonusOut == null)
                results[0].bonusOut = 0;

              results[0].save({bonusOut: parseFloat(results[0].bonusOut) + parseFloat(params.cny)}, function (err) {
                console.log('add bonusOut', err);
                cb(null, result, cfmUrl);
              });
            }
          });
        } else {
          cb(null, result, cfmUrl);
        }
      },
    ], function (err, result, cfmUrl) {
      if (err)
        res.status(200).json(err);
      else {
        utils.operateLog(params.uid, '佣金提现申请 '+ result +'|'+ outRecord.batchNo);
        if (result == 2)
          result = 1;
        res.status(200).json({code:200, data: {result: result, cfmUrl: cfmUrl}});
      }
    });
  },

  // 提现通知
  withdrawNotify: function (req, res) {
    var params = req.body;
    console.log('withdrawNotify', params);

    var checkString = 'charset='+params.charset+'batchNo='+params.batchNo+'statusCode='+params.statusCode+'statusName='+
                      params.statusName;
    if (params.fileName.length > 0)
      checkString += 'fileName='+params.fileName;
    checkString += 'resultCode='+params.resultCode+'resultName='+params.resultName+'resultMemo='+params.resultMemo;
    var sign = MD5(checkString+withdraw.md5Key);
    console.log(checkString, sign);

    if (sign == params.sign.toLowerCase()) {
      model.bonusOut.find({batchNo: params.batchNo}, 10, ['id','Z'], function (err, results) {
        if (err != null || results.length == 0) {
          console.log(params.batchNo, 'batchNo not exist');
        } else {
          var withdrawRecord = results[0];

          if (params.resultCode == 'S001' || params.resultCode == 'S002' || params.resultCode == 'S003') {
            withdrawRecord.save({status: 1}, function (err) {  // 1: 提现成功
              console.log(params.batchNo, 'success: update batchNo status' + params.resultName);
            });
            utils.operateLog(withdrawRecord.uid, '提现成功 '+params.batchNo+'|'+params.resultName);
          } else if (withdrawRecord.status != 4) {
            withdrawRecord.save({status: 4}, function (err) {  // 4: 提现失败
              console.log(params.batchNo, 'fail: update batchNo status' + params.resultName);

              model.user.find({uid: withdrawRecord.uid}, function (err, results) {
                if (err == null && results.length > 0) {
                  results[0].save({bonusOut: parseFloat(results[0].bonusOut) - parseFloat(withdrawRecord.cny)}, function (err) {
                    console.log('sub bonusOut', err);
                  });
                }
              });
            });
            utils.operateLog(withdrawRecord.uid, '提现失败 '+params.batchNo+'|'+params.resultName);
          }

          var answer = {
            result: {
              sign: '',
              signType: 'MD5',
              resultCode: 'ok',
              resultMessage: 'ok'
            }
          };
          answer = xml2js.buildXML(answer);
          console.log(answer);
          res.send(answer);
        }
      });
    } else {
      console.log(params.batchNo, 'md5 check failed');
    }
  },

  // 微派通知
  wpwithdrawNotify: function (req, res) {
    var params = req.body;
    console.log('wpwithdrawNotify', params);

    model.bonusOut.find({batchNo: params.cpparam}, 10, ['id','Z'], function (err, results) {
      if (err != null || results.length == 0) {
        console.log(params.cpparam, 'orderNo not exist');
        res.send('success');
      } else {
        res.send('success');

        var bonusOutRecord = results[0];
        if (params.status == 'success' && bonusOutRecord.status != 1) {
          bonusOutRecord.save({status: 1}, function (err) {
            console.log(params.cpparam, 'update withdraw status ' + params.status);
            utils.operateLog(bonusOutRecord.uid, '提现订单成功 '+params.cpparam+'|'+params.status);
          });
        } else if (params.status != 'success' && bonusOutRecord.status != 4) {
          bonusOutRecord.save({status: 4}, function (err) {  // 4: 提现失败
            console.log(params.cpparam, 'fail: update batchNo status' + params.status);

            model.user.find({uid: bonusOutRecord.uid}, function (err, results) {
              if (err == null && results.length > 0) {
                results[0].save({bonusOut: parseFloat(results[0].bonusOut) - parseFloat(bonusOutRecord.cny)}, function (err) {
                  console.log('sub bonusOut', err);
                });
              }
            });

          });
          utils.operateLog(bonusOutRecord.uid, '提现失败 '+params.cpparam+'|'+params.status);
        }
      }
    });
  },
}

module.exports = withdraw;
