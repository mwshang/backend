'use strict';

var params = {};

params.prod = getUrlParam('s');
params.uid = getUrlParam('i');
params.serverType = getUrlParam('t');
params.token = getUrlParam('token');
params.productName = getUrlParam('p');
params.count = getUrlParam('n');
params.payType = getUrlParam('g') == undefined ? 0 : getUrlParam('g');
params.channel = 'wxpay';

var url = 'http://www.abcd1234.online:'+port(params.prod);
if (params.prod == 'xh')
  url = 'http://backend.xhgame.cc:'+port(params.prod);

var WPConfig = {
  "appId": id1(params.prod),
  "channels": ["wx","ali"]
};

$(document).ready(function () {
  $.ajax({
    type: "post",
    url: url + "/settings/load",
    data: params,
    success: function (data) {
      if (data.code == 200) {
        params.paySP = data.data.paySP;
        if (params.paySP == 0)
          window.location = '/pay.html?a=1&token='+params.token+'&i='+params.uid+'&t='+params.serverType+'&s='+params.prod
              +'&p='+params.productName+'&n='+params.count+'&g='+params.payType;
        else {
          $.ajax({
            type: "post",
            url: url + "/mall/purchase",
            data: params,
            success: function (data) {
              if (data.code == 200) {
                console.log(data);
                if (data.data.url != null) {
                  if (WP != undefined && WP != null) {
                    WP.click(data.data.url);
                    WP.err = function (err) {
                      console.log(err);
                    }
                  }
                }
              }
            }
          });
        }
      } else {
        $.ajax({
          type: "post",
          url: url + "/mall/purchase",
          data: params,
          success: function (data) {
            if (data.code == 200) {
              console.log(data);
              if (data.data.url != null) {
                if (WP != undefined && WP != null) {
                  WP.click(data.data.url);
                  WP.err = function (err) {
                    console.log(err);
                  }
                }
              }
            }
          }
        });
      }
    }
  });
});

// $.getScript('http://jspay.wiipay.cn/1/jspay/wpayscripts.do?appId=' + id1(params.prod), function () {
//   $.ajax({
//     type: "post",
//     url: url + "/mall/purchase",
//     data: params,
//     success: function (data) {
//       if (data.code == 200) {
//         console.log(data);
//         if (data.data.url != null) {
//           setTimeout(function () {
//             if (WP != undefined && WP != null) {
//               WP.click(data.data.url);
//               WP.err = function(err) {
//                 console.log(err);
//               }
//             } else { // load WP obejct failed and reload again
//               $.getScript('http://jspay.wiipay.cn/1/jspay/wpayscripts.do?appId=' + id1(params.prod), function () {
//                 setTimeout(function () {
//                   if (WP != undefined && WP != null) {
//                     WP.click(data.data.url);
//                     WP.err = function (err) {
//                       console.log(err);
//                     }
//                   } else { // load WP obejct failed and reload again
//                     $.getScript('http://jspay.wiipay.cn/1/jspay/wpayscripts.do?appId=' + id1(params.prod), function () {
//                       setTimeout(function () {
//                         if (WP != undefined && WP != null) {
//                           WP.click(data.data.url);
//                           WP.err = function (err) {
//                             console.log(err);
//                           }
//                         } else { // load again last time
//                           $.getScript('http://jspay.wiipay.cn/1/jspay/wpayscripts.do?appId=' + id1(params.prod), function () {
//                             setTimeout(function () {
//                               if (WP != undefined && WP != null) {
//                                 WP.click(data.data.url);
//                                 WP.err = function (err) {
//                                   console.log(err);
//                                 }
//                               }
//                             }, 500);
//                           });
//                         }
//                       }, 500);
//                     });
//                   }
//                 }, 500);
//               });
//             }
//           }, 500);
//         }
//       }
//     }
//   });
// });


