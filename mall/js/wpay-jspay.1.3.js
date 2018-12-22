
!function(){
  "use strict";
  function a(a,b,c){
    for(var d in b)
      if(b.hasOwnProperty(d)){
        if(a.hasOwnProperty(d))
          continue;
        1==c&&b[d]instanceof Object?(a[d]={},bcExtend(a[d],b[d],!0)):a[d]=b[d]
      }
    return a
  }

  function customClickEvent() {
    var clickEvt;
    if (window.CustomEvent) {
      clickEvt = new window.CustomEvent('click', {
        canBubble: true,
        cancelable: true
      });
    } else {
      clickEvt = document.createEvent('Event');
      clickEvt.initEvent('click', true, true);
    }
    return clickEvt;
  }

  function httpReq(url,b,c,d){
    b.instant_channel||g();
    var e="r"+v++,
      f=WP.cbs,
      h=q[r]("SCRIPT"),
      k="http://jspay.wiipay.cn/1/jspay/result.do",
      newUrl=url+"?para=";

    b.appId=WPConfig.appId,
    b.return_url||(b.return_url=k),
    n&&(b.type="wap"),
      b.callback="WP.cbs."+e+".f",newUrl+="{";

    for(var m in b){
      if(b.hasOwnProperty(m)&&"function"!=typeof b[m]){
        if("optional"==m){
          newUrl+='"'+m+'":{';
          for(var o in b[m]){
            b[m].hasOwnProperty(o)&&(newUrl+='"'+o+'":"'+b[m][o]+'",');
          }
          newUrl=newUrl.substr(0,newUrl.length-1),newUrl+="},"
        }else{
          if(("feeName"==m) || ("feeDesc"==m)){
            newUrl+='"'+m+'":"'+encodeURI(b[m])+'",';
          }else{
            newUrl+='"'+m+'":"'+b[m]+'",';
          }

        }
      }
    }

    newUrl=newUrl.substr(0,newUrl.length-1),
      newUrl+="}";
    h.src=encodeURI(newUrl),
      f[e]={el:h,f:function(a){
        q[u]("head")[0][t](h);
        //1==data.debug&&alert("获取到支付参数:"+JSON.stringify(a));
        if((1==data.debug) && ("success"!=a.resultCode)){
          alert("获取到支付结果:"+a.resultCode+"->"+a.resultMsg);
        }
        if(("success"==a.resultCode)&&("REDIRECT"==a.method)){
          //window.location.href=a.url;
          window.location.replace(a.url);
        }else{
          c(a);
        }
      }
      },
      q[u]("head")[0][s](h)
  }

  function c(a){
    if("success"==a.resultCode){
      var b=q[r]("form");
      b.id="wpay-pay-form",
        b.name="wpay-pay-form",
        q.body[s](b);
      for(var c in a.param)
        if(a.param.hasOwnProperty(c)){
          var d=q[r]("input");
          d.type="hidden",d.name=c,d.value=a.param[c],b[s](d)
        }
      b.method=a.method,
        b.action=a.url,
        b.submit(),
      void 0!=p.loading&&p.loading.parentNode[t](p.loading)
    }
  }

  function d(a){
    p.list.style.display="none";
    var b=BCUtil.createQrCode({text:a.url});
    p.wxqr=q[r]("div"),
      p.wxqr.className="wpay-wx",
      p.background[s](p.wxqr),
      p.wxqr.appendChild(b),
      p.close=q[r]("div"),
      p.close.className="wpay-pay-close",
      p.close.onclick=function(){
        p.wxqr.parentNode[t](p.wxqr),
          p.list.style.display="block",
          p.background.style.display="none"
      },
      p.wxqr[s](p.close);
    var c=q.documentElement.clientHeight,d=p.wxqr.offsetHeight;
    p.wxqr.style.marginTop=(c-d)/2+"px",void 0!=p.loading&&p.loading.parentNode[t](p.loading)
  }

  //微信公众号支付2
  function e(a){
    WeixinJSBridge.invoke(
      "getBrandWCPayRequest",a,function(a){
        void 0!=p.loading&&p.loading.parentNode[t](p.loading),
          p.background.style.display="none",
          WeixinJSBridge.log(a.err_msg),1==data.debug&&alert("微信JSAPI返回:"+JSON.stringify(a)),
        "function"==typeof k.jsApiHandler&&data.jsApiHandler(a),
        "function"==typeof k.wxJsapiFinish&&k.wxJsapiFinish(a),
          "get_brand_wcpay_request:ok"==a.err_msg?"function"==typeof k.wxJsapiSuccess&&k.wxJsapiSuccess(a):"function"==typeof k.wxJsapiFail&&k.wxJsapiFail(a)
      })
  }

  //微信公众号支付1
  function f(a){
    if(isWeiXin()){
      var b=function(){e(a)};
      "undefined"==typeof WeixinJSBridge?document.addEventListener?document.addEventListener("WeixinJSBridgeReady",b,false):document.attachEvent&&(document.attachEvent("WeixinJSBridgeReady",b),document.attachEvent("onWeixinJSBridgeReady",b)):b();
    }else{
      c(a);
    }
  }

  function g(){
    p.loading=q[r]("div"),
      p.loading.id="wpay-pay-loading",
      p.loading.style.height=p.list.offsetHeight-76+"px",
      p.list[s](p.loading)
  }

  function isWeiXin(){
    var ua = window.navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i) == 'micromessenger'){
      return true;
    }else{
      return false;
    }
  }

  function isWindows(){
    var ua = window.navigator.userAgent.toLowerCase();
    if(ua.match(/Windows/i) == 'Windows'){
      return true;
    }else{
      return false;
    }
  }

  function h(domain,payType){
    var wxUrl = "http://"+domain+"/1/jspay/wxh5/sign.do";
    if(isWeiXin()){
      wxUrl = "http://"+domain+"/1/jspay/wx/sign.do";
    }
    ///1/jspay/wxmp/sign/native
    return"wxmp"==payType?"http://"+domain+"/1/jspay/wxh5/sign.do":"wx"==payType?wxUrl:"http://"+domain+"/1/jspay/"+payType+"/sign.do"
  }

  if(window.WP)
    return void

      console.info("Wiipay has been already included");

  var WP=window.WP={
      ui:{},
      pay:{}
    },
    data={},
    k={},
    payMap={},
    pay=WP.pay,
    n=/android|ipad|iphone|midp|rv:1.2.3.4|ucweb|windows ce|windows mobile/i.test(navigator.userAgent),
    o="windows"==window.navigator.userAgent.toLowerCase().match(/windows/i)?false:true,
    p=null,
    q=document,
    r="createElement",
    s="appendChild",
    t="removeChild",
    u="getElementsByTagName",
    v=0;

  WP.cbs={},
    WP.err=function(a){
      "undefined"!=typeof p.loading&&p.loading.parentNode[t](p.loading),
      1==data.debug&&alert("error:"+JSON.stringify(a)),
      "function"==typeof k.errCallback&&k.dataError(a)
    };

  //var idx=parseInt(3*Math.random());
  var idx = 0;
  var domains=["jspay.wiipay.cn"];
  var y={};
  y.sms={
    dataUrl:h(domains[idx],"sms"),
    t:"话费支付",
    f:c
  },
    y.prepaid={
      dataUrl:h(domains[idx],"prepaid"),
      t:"点卡充值卡",
      f:c
    },
    y.balance={
      dataUrl:h(domains[idx],"balance"),
      t:"微币支付",
      f:c
    },
    y.ali={
      dataUrl:h(domains[idx],"ali"),
      t:"支付宝支付",
      f:c
    },
    y.un={
      dataUrl:h(domains[idx],"un"),
      t:"银联支付",
      f:c
    },
    y.wxmp={
      dataUrl:h(domains[idx],"wxmp"),
      t:"微信扫码支付",
      f:d
    },
    y.wx={
      dataUrl:h(domains[idx],"wx"),
      t:"微信公众号支付",
      f:f
    },
    y.qq={
      dataUrl:h(domains[idx],"qq"),
      t:"QQ钱包",
      f:f
    },
    y.jd={
      dataUrl:h(domains[idx],"jd"),
      t:"京东支付",
      f:f
    },
    y.bd={
      dataUrl:h(domains[idx],"bd"),
      t:"百度钱包",
      f:f
    },
    y.wy={
      dataUrl:h(domains[idx],"wy"),
      t:"网银支付",
      f:c
    },
    WP.init=function(){
      var channels=WPConfig.channels;
      for(var c in channels){
        var d=y[channels[c]];
        if(pay[channels[c]]=function(a,c,d){
            return function(e){httpReq(a,e,c,d)}
          }
          (d.dataUrl,d.f,channels[c]),
            payMap[channels[c]]={
              n:channels[c],
              t:d.t,
              f:function(a){
                return function(){pay[a](data)}
              }(channels[c])
            },
          "wxmp"==channels[c]){
          var e=q[r]("SCRIPT");
          e.type="text/javascript",
            e.src="public/jspay/js/util.min.js",
            q[u]("head")[0][s](e)
        }
      }
    },
    WP.click=function(param,event){
      data=param,k={},
      event instanceof Object&&(k=a(event,{wxJsapiFinish:function(a){
        console.log(JSON.stringify(a))
      },
        wxJsapiSuccess:function(a){},
        wxJsapiFail:function(a){},
        dataError:function(a){
          console.log(JSON.stringify(a))
        }},!1));

      var channels=WPConfig.channels;
      if(1==data.debug&&alert("您的 Wiipay appId="+WPConfig.appId),data.instant_channel){
        switch(data.instant_channel){
          case"sms":
          case"prepaid":
          case"balance":
          case"wx":
          case"wy":
          case"wxmp":
          case"ali":
          case"qq":
          case"jd":
          case"bd":
          case"un":
            payMap[data.instant_channel]?payMap[data.instant_channel].f():1==data.debug&&alert("您的设置中不存在渠道["+data.instant_channel+"]");
            break;
          default:
            1==data.debug&&alert("instant_channel 不存在渠道["+data.instant_channel+"]")
        }
      }else{
        if(p)
          return void
            (p.background.style.display="block");
        p={},
          p.background=q[r]("div"),
          p.background.id="wpay-pay",
          q.body[s](p.background),
          p.list=q[r]("div"),
          p.list.id="wpay-pay-list";

        if(channels.length==1){
          p.background.style.display="none";
          payMap[channels[0]].f();
        }else{
          p.background[s](p.list);
          for(var e in channels){
            if("wx"==channels[e]){
              if(o){
                var f=q[r]("button");
                f.className="wpay-pay-btn channel-"+channels[e],
                  f.onclick=payMap[channels[e]].f,
                  p.list[s](f)
              }else{
                var f=q[r]("button");
                f.className="wpay-pay-btn channel-wxmp",
                  f.onclick=payMap[channels[e]].f,
                  p.list[s](f)
              }
            }/*else if("wxmp"==channels[e]){
             if(!o){
             var f=q[r]("button");
             f.className="wpay-pay-btn channel-"+channels[e],
             f.onclick=payMap[channels[e]].f,
             p.list[s](f)
             }
             }*/else{
              var f=q[r]("button");
              f.className="wpay-pay-btn channel-"+channels[e],
                f.onclick=payMap[channels[e]].f,
                p.list[s](f)
            }
          }



          p.close=q[r]("div"),
            p.close.className="wpay-pay-close",
            p.close.onclick=function(){
              void 0!=p.loading&&p.loading.parentNode[t](p.loading),
                p.background.style.display="none"
            },
            p.list[s](p.close);
          var g=q.documentElement.clientHeight,
            h=p.list.offsetHeight;
          p.list.style.marginTop=(g-h)/2+"px",
            q.onkeydown=function(a){
              var b=a||window.event||arguments.callee.caller.arguments[0];
              b&&27==b.keyCode&&(p.background.style.display="none")
            }

        }

      }
    },
    WP.init()
}(),
  function(){
    "use strict";
    var a=document;
    if(a.fireEvent){
      var b=a.createEventObject();
      b.eventType="message",
        a.fireEvent("wpay:onready",b)
    }else{
      var b=new CustomEvent("wpay:onready",{
        detail:{msg:"Welcome WPay"},bubbles:!0,cancelable:!1
      });
      a.dispatchEvent(b)
    }
  }();
