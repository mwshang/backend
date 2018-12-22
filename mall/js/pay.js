'use strict';

var params = {};

params.prod = getUrlParam('s');
params.uid = getUrlParam('i');
params.serverType = getUrlParam('t');
params.token = getUrlParam('token');
params.productName = getUrlParam('p');
params.count = getUrlParam('n');
params.payType = getUrlParam('g') == undefined ? 0 : getUrlParam('g');
params.paySP = 0;

var WPConfig = {
  "appId": id1(params.prod),
  "channels": ["wx","ali"]
};

var purchase = function (type) {
  // var params = JSON.parse(localStorage.params);
  params.channel = type;
  // delete localStorage.params;
  if (params.channel == 'hw') {
      alert('微信支付渠道维护中...');
      return;
  }

  var url = 'http://www.abcd1234.online:'+port(params.prod);
  if (params.prod == 'xh')
    url = 'http://backend.xhgame.cc:'+port(params.prod);

  $.ajax({
    type: "post",
    url: url + "/mall/purchase",
    data: params,
    success: function (data) {
      if (data.code == 200) {
        if (data.data.url != null) {
          if (params.channel == 'hw') {
            var body = data.data.url;
            var submit = '<form name="form" method="post" action="https://cardpay.shengpay.com/mobile-acquire-channel/cashier.htm">';

            for(var i in body){
              if (body.hasOwnProperty(i)) {
                if (i == 'Ext2') {
                  submit += '<input type="hidden" name="'+i+'" value='+body[i]+'>';
                } else
                  submit += '<input type="hidden" name="'+i+'" value="'+body[i]+'">';
              };
            }

            submit += '<input type="submit" value="立即支付" style="display:none" >'
              +'</form>'
              +'<script>document.forms[0].submit();</script>';

            $('body').eq(0).empty();
            $("body").eq(0).html(submit);
          } else {
            window.location = data.data.url;
          }
        } else if (data.data.html != null) {
          $('body').eq(0).empty();
          $("body").eq(0).html(data.data.html);
        }
      }
    }
  });
}

