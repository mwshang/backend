'use strict';

var params = {};

params.prod = getUrlParam('s');
params.uid = getUrlParam('i');
params.serverType = getUrlParam('t');
params.token = getUrlParam('token');
params.productName = getUrlParam('p');
params.count = getUrlParam('n');
params.payType = getUrlParam('g') || 0;


var purchase = function (type) {
	if (type == 'ali') {
		alert('支付通道维护中，购买请联系游戏客服或代理！');
		return;
	}
	  
    var url = 'http://www.luminositygame.com:'+port(params.prod);
    params.type = type;
    $.ajax({
        type: "post",
        url: url + "/mall_platform/create_order",
        data: params,
        success: function (data) {
            if (data.code != 200) {
                alert(data.msg||'购买请求失败');
                return;
            }
            if (data.data.url != null) {
                if (data.data.payChannel == 'hw') {
                    var body = data.data.url;
                    var submit = '<form name="form" method="post" action="https://cardpay.shengpay.com/mobile-acquire-channel/cashier.htm">';

                    for (var i in body) {
                        if (body.hasOwnProperty(i)) {
                            if (i == 'Ext2') {
                                submit += '<input type="hidden" name="' + i + '" value=' + body[i] + '>';
                            } else {
                                submit += '<input type="hidden" name="' + i + '" value="' + body[i] + '">';
                            }
                        }
                    }
                    submit += '<input type="submit" value="立即支付" style="display:none" >'
                        + '</form>'
                        + '<script>document.forms[0].submit();</script>';

                    $('body').eq(0).empty();
                    $("body").eq(0).html(submit);
                    return;
                }
                window.location = data.data.url;
            }
            else if (data.data.html != null) {
                $('body').eq(0).empty();
                $("body").eq(0).html(data.data.html);
            }
        }
    });
};

