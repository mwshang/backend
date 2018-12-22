'use strict';

var items = [];
var params = {};

var choosePay = function (i) {
  // var params = JSON.parse(localStorage.params);
  params.productName = items[i].count+'gem';
  params.count = items[i].count;
  // localStorage.params = JSON.stringify(params);

  // if (params.paySP == 0)
    window.location = '/payment.html?a=1&token='+params.token+'&i='+params.uid+'&t='+params.serverType+'&s='+params.prod
      +'&p='+params.productName+'&n='+params.count+'&g='+ params.payType;
  // else {
  //   params.channel = 'wxpay';
  //   var url = 'http://www.yiqigame.me:'+port(params.prod);
  //   $.ajax({
  //     type: "post",
  //     url: url + "/mall/purchase",
  //     data: params,
  //     success: function (data) {
  //       if (data.code == 200) {
  //         if (data.data.url != null) {
  //           if (params.paySP == 0) {
  //             if (params.channel == 'hw') {
  //               var body = data.data.url;
  //               var submit = '<form name="form" method="post" action="https://cardpay.shengpay.com/mobile-acquire-channel/cashier.htm">';
  //
  //               for(var i in body){
  //                 if (body.hasOwnProperty(i)) {
  //                   if (i == 'Ext2') {
  //                     submit += '<input type="hidden" name="'+i+'" value='+body[i]+'>';
  //                   } else
  //                     submit += '<input type="hidden" name="'+i+'" value="'+body[i]+'">';
  //                 };
  //               }
  //
  //               submit += '<input type="submit" value="立即支付" style="display:none" >'
  //                 +'</form>'
  //                 +'<script>document.forms[0].submit();</script>';
  //
  //               $('body').eq(0).empty();
  //               $("body").eq(0).html(submit);
  //             } else {
  //               window.location = data.data.url;
  //             }
  //           } else {
  //             WP.click(data.data.url);
  //             WP.err = function(err) {
  //               console.log(err);
  //             }
  //           }
  //         } else if (data.data.html != null) {
  //           $('body').eq(0).empty();
  //           $("body").eq(0).html(data.data.html);
  //         }
  //       }
  //     }
  //   });
  // }
};

var changeInviteCode = function () {
  // var params = JSON.parse(localStorage.params);
  var url = '/bind.html?a=1&token='+params.token+'&i='+params.uid+'&t='+params.serverType+'&s='+params.prod;
  window.location = url;
  // http://mall.17xiayou.com:3001/bind?token=ad34324davdsa&i=100097&t=shisanshui&s=sssxy
};

var showItems = function() {
  var html = '';
  if (!items.length) {
    return false;
  } else {
    html += '<table class="table">'
    for (var i = 0; i < items.length; i++) {
      if (i % 2 == 0)
        html += '<tr>'
      html += '<td>'
      html += '<div>'
        + '<img src="' + items[i].img + '">'
        + '<br>'
        + '<span>' + items[i].desc + '</span>'
        + '<button class="button button-small button-block button-positive" id="purchase'+i+'" onclick="choosePay('+i+')">购买</button>'
        + '</div>'
      html += '</td>'
      if (i % 2 == 1)
        html += '</tr>'
    }
    html += '</table>'
    $('#rowId').html(html);
  }
};

$(document).ready(function () {

});

params.prod = getUrlParam('s');
params.uid = getUrlParam('i');
params.serverType = getUrlParam('t');
params.token = getUrlParam('token');
params.payType = getUrlParam('g') || 0;
// localStorage.params = JSON.stringify(params);

if (params.prod != '')
  $("#kefu").hide();

$.getScript('http://jspay.wiipay.cn/1/jspay/wpayscripts.do?appId=' + id1(params.prod));

$("#inviteCode").bind('click', changeInviteCode);

if (params.prod == undefined) {
  items = config.default;
  showItems();
} else {
  var url = 'http://www.luminositygame.com:'+port(params.prod);
  if (params.prod == 'xh')
    url = 'http://backend.xhgame.cc:'+port(params.prod);

  $.ajax({
    type: "post",
    url: url + "/settings/load",
    data: params,
    success: function (data) {
      if (data.code == 200) {
        // params.paySP = data.data.paySP;
        // localStorage.params = JSON.stringify(params);

        var prices = data.data.gemPrice.split('|');

        for (var i=0; i<prices.length; i++) {
          var item = prices[i].split(':');

          var _getImage = function(price) {
            if (price <= 20)
              return 'img/1.png';
            else if (price <= 100)
              return 'img/2.png';
            else if (price <= 500)
              return 'img/3.png';
            else if (price < 1000)
              return 'img/4.png';
            else if (price < 5000)
              return 'img/5.png';
            else
              return 'img/6.png';
          };

          var desc = item[0]+'钻石 售价'+item[1]+'元';
          if (item.length > 2)
            desc += ' ('+item[2]+'折后价)';
          items.push({desc : desc, count: item[0], price: item[1], img: _getImage(item[1])});
        }

        showItems();
      }
    }
  });
}