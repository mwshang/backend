'use strict';

var params = {};

var bindAgent = function() {
  if ($("#inviteCode")[0].value == '') {
    $("#msg")[0].innerText = '提示: 请输入邀请码!';
    setTimeout(function () {
      $("#msg")[0].innerText = '';
    }, 2000);
    return;
  } else if ($("#inviteCode")[0].value.length != 6) {
    $("#msg")[0].innerText = '提示: 邀请码必须为6位数字!';
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
    url: url + "/user/bind",
    data: {uid: params.uid, inviteCode : $("#inviteCode")[0].value, serverType: params.serverType},
    success: function (data) {
      //当异步请求成功返回响应时触发
      console.log(data);

      if (data.code == 200) {
        if (data.data == 1) {
          $("#msg")[0].innerText = '提示: 恭喜您,绑定代理成功,即将跳转到商城!';
          console.log('jump to mall');
          setTimeout(function () {
            window.location = '/mall.html?a=1&token='+params.token+'&t='+params.serverType+'&i='+params.uid+'&s='+params.prod;
          }, 2000);
        } else
          $("#msg")[0].innerText = '提示: 绑定失败,请稍后重试!';
          setTimeout(function () {
            $("#msg")[0].innerHTML = '';
          }, 1000);
      } else if (data.code == 1000) {
        $("#msg")[0].innerText = '提示: 您已经绑定过邀请码,即将跳转到商城!';
        setTimeout(function () {
          window.location = '/mall.html?a=1&token='+params.token+'&t='+params.serverType+'&i='+params.uid+'&s='+params.prod;
        }, 2000);
      } else {
        $("#msg")[0].innerText = '提示:' + data.msg;
        setTimeout(function () {
          $("#msg")[0].innerText = '';
        }, 2000);
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

var gotoMall = function() {
  window.location = '/mall.html?a=1&token='+params.token+'&t='+params.serverType+'&i='+params.uid+'&s='+params.prod;
}

$(document).ready(function () {

});

params.prod = getUrlParam('s');
params.uid = getUrlParam('i');
params.serverType = getUrlParam('t');
params.token = getUrlParam('token');

// localStorage.params = JSON.stringify(params);

if (params.prod == 'jx' || params.prod == 'qwhm' || params.prod == 'whpdk' || params.prod == 'ls')
  $("#tomall").hide();

if (params.prod == 'whpdk') {
  $("#kefu1")[0].innerText = '如果您没有邀请码,请填写公用邀请码: 306525, 如需了解更多优惠活动,请联系客服!';
} else if (params.prod != 'ls') {
  $("#kefu").hide();
}

$("#rewardPercent").hide();

var url = 'http://www.abcd1234.online:'+port(params.prod);
if (params.prod == 'xh')
  url = 'http://backend.xhgame.cc:'+port(params.prod);

$.ajax({
  type: "post",
  url: url + "/settings/load",
  data: params,
  success: function (data) {
    if (data.code == 200) {
      var rewards = data.data.bindAgentReward.split('|');
      $("#rewardNum1")[0].innerText = rewards[0];
      if (rewards.length > 1 && rewards[1] != '0') {
        $("#rewardPercent").show();
        $("#rewardNum2")[0].innerText = rewards[1];
      } else
        $("#rewardPercent").hide();
    }
  }
});
