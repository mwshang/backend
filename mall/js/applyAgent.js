'use strict';

var params = {};

var getSmsCode = function() {
  if ($("#phoneNum")[0].value == '') {
    $("#msg")[0].innerText = '提示: 请输入手机号码!';
    setTimeout(function () {
      $("#msg")[0].innerText = '';
    }, 2000);
    return;
  }

  var url = 'http://www.abcd1234.online:'+port(params.prod);
  if (params.prod == 'xh')
    url = 'http://backend.xhgame.cc:'+port(params.prod);

  $.ajax({
    type: "post",
    url: url + "/user/getSmsCode",
    data: {uid: params.uid, phoneNumber : $("#phoneNum")[0].value},
    success: function (data) {
      //当异步请求成功返回响应时触发
      console.log(data);

      $("#getCode").hide();
      $("#countdown").show();
      $("#countdown")[0].innerHTML = '60秒后重新获取';
      var countdown = 0;
      setInterval(function () {
        if (countdown++ >= 59) {
          $("#countdown")[0].innerHTML = '';
          $("#countdown").hide();
          $("#getCode").show();
          countdown = 0;
        } else
          $("#countdown")[0].innerHTML = (60 - countdown) + '秒后重新获取';
      }, 1000);

      // $("#msg")[0].innerText = '提示:' + (data.data == 1 ? '验证码已发送!': data.msg);
      // setTimeout(function () {
      //   $("#msg")[0].innerText = '';
      // }, 2000);
    },
    error: function(request) {
      $("#msg")[0].innerText = '提示: 网络异常!';
      setTimeout(function () {
        $("#msg")[0].innerText = '';
      }, 2000);
    },
  });

};

var applyAgent = function() {
  if ($("#smsCode")[0].value == '') {
    $("#msg")[0].innerText = '提示: 请输入验证码!';
    setTimeout(function () {
      $("#msg")[0].innerText = '';
    }, 2000);
    return;
  }

  var url = 'http://www.abcd1234.online:'+port(params.prod);
  if (params.prod == 'xh')
    url = 'http://backend.xhgame.cc:'+port(params.prod);

  $.ajax({
    type: "post",
    url: url + "/user/smsApplyAgent",
    data: {uid: params.uid, code : $("#smsCode")[0].value, phoneNum: $("#phoneNum")[0].value},
    success: function (data) {
      //当异步请求成功返回响应时触发
      console.log(data);

      if (data.code == 200) {
        $("#msg")[0].innerText = '提示: 恭喜您申请成功,后台登录密码将发送到申请使用的手机号, 即将跳转到代理后台!';
        console.log('jump to backend');
        setTimeout(function () {
          window.location = 'http://ht'+params.prod+'.'+utils.url(params.prod)+'?i='+params.uid;
        }, 3000);
      } else {
        $("#msg")[0].innerText = '提示:' + data.msg;
        setTimeout(function () {
          $("#msg")[0].innerText = '';
        }, 3000);
      }
    },
    error: function(request) {
      $("#msg")[0].innerText = '提示: 网络异常!';
      setTimeout(function () {
        $("#msg")[0].innerText = '';
      }, 2000);
    },
  });

};

$(document).ready(function () {

});

params.prod = getUrlParam('s');
params.uid = getUrlParam('i');
params.serverType = getUrlParam('t');
params.token = getUrlParam('token');

// localStorage.params = JSON.stringify(params);

var url = 'http://www.abcd1234.online:'+port(params.prod);
if (params.prod == 'xh')
  url = 'http://backend.xhgame.cc:'+port(params.prod);

$.ajax({
  type: "post",
  url: url + "/settings/load",
  data: params,
  success: function (data) {
    if (data.code == 200) {
      $("#agentBonus")[0].innerText = '玩家充值的'+data.data.normalRate1+'%';
      var cancelCond = data.data.cancelAgentCondition.split('|');
      $("#cancelCond1")[0].innerText = cancelCond[0];
      $("#cancelCond2")[0].innerText = cancelCond[1];
    }
  }
});
