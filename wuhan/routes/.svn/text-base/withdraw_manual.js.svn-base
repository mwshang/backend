var moment = require('moment');
var qs = require('querystring');
var async = require('async');
var error = require('../constants');
var model = require('../model');
var utils = require('../utils');
var area = require('../area');
var user = require('./user');

var withdraw_manual = {
  withdraw: function(req, res) {
    var params = req.body;
    console.log('withdraw', params);

    var outRecord = {uid: params.uid, cny: params.cny,
                      bankAccount: params.bankAccount, bankUserName: params.bankUserName, bankName: params.bankName,
                      batchNo: moment().format('YYYYMMDDHHmmss') + '' + params.uid,
                      serialNo: moment().format('YYYYMMDDHHmmss') + '' + params.uid,
                      status: 0};

    async.waterfall([
      function(cb) {
        if (params.cny - 2.0 <= 0) {
          cb({code: error.INT_ERROR, msg: '扣除税费后金额太低'});
        } else {
          outRecord.cny = params.cny.toFixed(2);
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
        model.bonusOut.find({batchNo: outRecord.batchNo}, 1, function(err, results) {
          if (err != null || results.length == 0) {
            console.log('bonusOut batchNo err', err);
            utils.operateLog(params.uid, '数据库操作错误 '+ outRecord.batchNo);
            cb({code: error.DB_ERROR, msg: err});
          } else {
            results[0].save({status: 2}, function (err) {
              console.log(outRecord.batchNo, 'update batchNo status ' + 2);
              cb(null, 2);
            });
          }
        });
      },
      function (result, cb) {
        model.user.find({uid: params.uid}, function (err, results) {
          if (err != null || results.length == 0) {
            cb({code: error.DB_ERROR, msg: err});
          } else {
            var user = results[0];
            if (results[0].bonusOut == null)
              results[0].bonusOut = 0;

            results[0].save({bonusOut: results[0].bonusOut + params.outNum}, function (err) {
              console.log('add bonusOut', err);
              cb(null, result);
            });
          }
        });
      },
    ], function (err, result) {
      if (err)
        res.status(200).json(err);
      else {
        utils.operateLog(params.uid, '佣金提现申请 '+ result +'|'+ outRecord.batchNo);
        res.status(200).json({code:200, data: result});
      }
    });
  },

  withdrawNotify: function (req, res) {
    var params = req.body;
    console.log('withdrawNotify', params);

    model.bonusOut.find({batchNo: params.batchNo}, 10, ['id','Z'], function (err, results) {
      if (err != null || results.length == 0) {
        console.log(params.batchNo, 'batchNo not exist');
        res.status(200).json({code: error.DB_ERROR, msg: err});
      } else {
        var withdrawRecord = results[0];

        if (params.resultCode == 1) {
          withdrawRecord.save({status: 1, serialNo: params.serialNo}, function (err) {  // 1: 提现成功
            console.log(params.batchNo, 'success: update batchNo status' + params.resultCode);
          });
          utils.operateLog(withdrawRecord.uid, '提现成功 '+params.batchNo+'|'+params.resultCode);
        } else {
          model.user.find({uid: withdrawRecord.uid}, function (err, results) {
            if (err == null && results.length > 0) {
              results[0].save({bonusOut: results[0].bonusOut - withdrawRecord.outNum}, function (err) {
                console.log('sub bonusOut', err);
              });
            }
          });

          withdrawRecord.save({status: 4, serialNo: params.serialNo}, function (err) {  // 4: 提现失败
            console.log(params.batchNo, 'fail: update batchNo status' + params.resultCode);
          });
          utils.operateLog(withdrawRecord.uid, '提现失败 '+params.batchNo+'|'+params.resultCode);
        }

        res.status(200).json({code:200, data: params.resultCode});
      }
    });
  },

}

module.exports = withdraw_manual;
