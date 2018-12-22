/**
 * Created by bruce.yang on 2017/6/14.
 */

//获取url中的参数
function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数
  if (r != null)
    return unescape(r[2]);
  return null;
}

function StringAs(string) {
  return string.replace(/(\\|\"|\n|\r|\t)/g, "\\$1");
}

// var ports = {'whpdk': 30120, 'wh': 30160, 'ls': 30170, 'lyt': 30190, 'xh': 30010, 'pyh':30220, 'fy':30280,
//               'sxmh':30240, 'lsgs':30260, 'gf':30250, 'lssc':30270, 'h5':30010, 'xj':30230, 'panan':30290};
var ports = {'wh': 30160};
function port(s) {
  return ports[s];
}

var ids = {'whpdk': 'wxe900cd196746cedd', 'wh': 'wxf090cfc27dacb774', 'ls':'wxbd406da17c1f8322', 'nbgsh':'wxb735ef907460b92f',
            'xh':'wx2586d11d3dc1189c', 'pyh':'wx04c3946cc9d68641', 'lyt':'wx81b8250477ffc6f2', 'fy':'wx3cd1315ea07c5a49',
            'sxmh':'wxdcda3280846df88f', 'lsgs':'wxae6680d5dbce6707','gf':'wxe8140f8dfc4418ff','lssc':'wxa700ca172aeed6ae',
            'xj':'wx93d686247835a280','panan':'wxae6680d5dbce6707'};
function id(s) {
  return ids[s];
}

var id1s = { 'wh':'0d472a2905dfd6af83365c5cc8386d0e',
  'whpdk': '0e2e48d837f4c163fa54dc00f9d06f92', 'ls': 'a56cd1cd29ecffad568818148ede1e60', 'nbgsh':'e104e10a404400dc64410fe1d97a1bf3',
  'xh':'7d17e3c2538e59d07182aef3a174bdf5', 'pyh':'ee3e04d6f7c4a59c77a85b6495b725f5','lyt':'23dd4153d0c9b51c73bd6967b74ee972', 'fy':'', 'sxmh':''};
function id1(s) {
  return id1s[s];
}

var urls = { 'wh':'www.luminositygame.com', 'lyt':'laoyoutang.net', 'xh': 'xhgame.cc',
  'whpdk': 'xiaocom.cn', 'ls': 'zhenzhenzhaoming.com', 'nbgsh': 'qp.lezhuogame.com', 'pyh':'xhgame.cc',
  'fy':'huihaikj.com', 'sxmh':'cuihunet.com', 'lsgs':'liandu.lishuihuanletang.com', 'gf':'dysceapp.com',
  'lssc':'suichang.lishuihuanletang.com', 'h5':'yiqigame.me', 'xj':'thunneycomb.com','panan': 'panan.lishuihuanletang.com',};
function _url(s) {
  return urls[s];
}

var apps = {
  "whpdk" : {
    title: '网红牌友圈',
    desc: '网红粉丝专属 好友约局',
    icon: 'http://dl.xiaocom.cn/icon.png',
    preview: 'http://dl.xiaocom.cn/preview.png',
    android: 'http://dl.xiaocom.cn/whpdk.apk',
    android_channels: {
      '360': 'http://dl.xiaocom.cn/whpdk_360.apk',
    },
    ioscert: 'https://dl.xiaocom.cn/whpdk.plist',//这里配置企业证书下载地址
    ios: 'https://itunes.apple.com/app/apple-store/id1257753747?mt=8',//这里配置IOS APP Store 下载地址
    detail1: '上班技痒难耐？还在担心“三缺一”？有朋自远方来却没法一起打牌？',
    detail2: '如果能随时随地好友约局；如果有网红美女陪你打牌；如果能广交牌友切磋牌艺；如果能赢得多，赢得快，赢得爽！《网红牌友圈》，全都满足你！快叫上亲朋好友一起来玩吧！',
  },
  "wh" : {
    title: '武汉麻将',
    desc: '特色武汉麻将 熟人约局',
    icon: 'http://whdl.yiqigame.me/icon.png',
    preview: 'http://whdl.yiqigame.me/preview.png',
    android: 'http://whdl.yiqigame.me/wh.apk',
    ioscert: '',
    ios: 'https://itunes.apple.com/app/apple-store/id1302059015?mt=8',//这里配置IOS APP Store 下载地址
    detail1: '特色武汉麻将游戏，每天每夜玩不停！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战地道麻将，让玩家有身临其境的真实体验',
  },
  "ls" : {
    title: '丽水欢乐堂',
    desc: '丽水特色棋牌 熟人约局',
    icon: 'http://dl.zhenzhenzhaoming.com/icon.png',
    preview: 'http://dl.zhenzhenzhaoming.com/preview.png',
    preview2: 'http://dl.zhenzhenzhaoming.com/preview2.png',
    android: 'http://dl.zhenzhenzhaoming.com/ls.apk',
    ioscert: 'https://dl.zhenzhenzhaoming.com/ls.plist',
    ios: 'https://itunes.apple.com/app/apple-store/id1328963889?mt=8',//这里配置IOS APP Store 下载地址
    detail1: '专业特色丽水地区玩法！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战地道的丽水棋牌，让玩家有身临其境的真实体验',
  },
  "lyt" : {
    title: '老友堂娱乐',
    desc: '湖南特色棋牌 熟人约局',
    icon: 'http://dl.laoyoutang.net/icon.png',
    preview: 'http://dl.laoyoutang.net/preview.png',
    preview2: 'http://dl.laoyoutang.net/preview2.png',
    android: 'http://dl.laoyoutang.net/lyt.apk',
    ioscert: 'https://dl.laoyoutang.net/lyt.plist',
    ios: '',//这里配置IOS APP Store 下载地址
    detail1: '专业特色地区玩法！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战地道的地方棋牌，让玩家有身临其境的真实体验!',
  },
  "nbgsh" : {
    title: '宁波杠上花',
    desc: '宁波特色棋牌 好友约局',
    icon: 'http://dl.qp.lezhuogame.com/icon.png',
    preview: 'http://dl.qp.lezhuogame.com/preview.png',
    android: 'http://dl.qp.lezhuogame.com/nbgsh.apk',
    android_channels: {

    },
    ioscert: 'https://dl.qp.lezhuogame.com/nbgsh.plist',//这里配置企业证书下载地址
    ios: '',//这里配置IOS APP Store 下载地址
    detail1: '宁波杠上花棋牌游戏，地方特色！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战地道的地方棋牌，让玩家有身临其境的真实体验',
  },
  "xh" : {
    title: '星火十三水',
    desc: '余姚特色棋牌 好友约局',
    icon: 'http://dl.xhgame.cc/icon.png',
    preview: 'http://dl.xhgame.cc/preview.png',
    android: 'http://dl.xhgame.cc/xh.apk',
    android_channels: {

    },
    ioscert: 'https://dl.xhgame.cc/xh.plist',//这里配置企业证书下载地址
    ios: '',//这里配置IOS APP Store 下载地址
    detail1: '星火十三水棋牌游戏，地方特色！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战地道的地方棋牌，让玩家有身临其境的真实体验!',
  },
  "pyh" : {
    title: '天天牌友汇',
    desc: '地方特色棋牌 好友约局',
    icon: 'http://dl.xhgame.cc/pyh/icon.png',
    preview: 'http://dl.xhgame.cc/pyh/preview.png',
    preview2: 'http://dl.xhgame.cc/pyh/preview2.png',
    android: 'http://dl.xhgame.cc/pyh/pyh.apk',
    android_channels: {

    },
    ioscert: 'https://dl.xhgame.cc/pyh/pyh.plist',//这里配置企业证书下载地址
    ios: 'https://itunes.apple.com/app/apple-store/id1324009295?mt=8',//这里配置IOS APP Store 下载地址
    detail1: '天天牌友汇棋牌游戏，地方特色！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战地道的地方棋牌，让玩家有身临其境的真实体验!',
  },
  "fy" : {
    title: '阜阳麻将',
    desc: '地方特色棋牌 好友约局',
    icon: 'http://dl.huihaikj.com/icon.png',
    preview: 'http://dl.huihaikj.com/preview.png',
    preview2: 'http://dl.huihaikj.com/preview2.png',
    android: 'http://fuyang-oss-dl.oss-cn-hongkong.aliyuncs.com/fymj.apk',
    android_channels: {

    },
    ioscert: 'https://fuyang-oss-dl.oss-cn-hongkong.aliyuncs.com/fymj.plist',//这里配置企业证书下载地址
    ios: '',//这里配置IOS APP Store 下载地址
    detail1: '阜阳当地麻将，地方特色！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战地道的地方棋牌，让玩家有身临其境的真实体验!',
  },
  "sxmh" : {
    title: '陕西梦幻麻将',
    desc: '地方特色棋牌 好友约局',
    icon: 'http://dl.cuihunet.com/icon.png',
    preview: 'http://dl.cuihunet.com/preview.png',
    preview2: 'http://dl.cuihunet.com/preview2.png',
    android: 'http://dl.cuihunet.com/sxmhmj.apk',
    android_channels: {

    },
    ioscert: 'https://shanxi-dl.oss-cn-shanghai.aliyuncs.com/sxmhmj.plist',//这里配置企业证书下载地址
    ios: '',//这里配置IOS APP Store 下载地址
    detail1: '本地麻将，地方特色！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战地道的地方棋牌，让玩家有身临其境的真实体验!',
  },
  "lsgs" : {
    title: '丽水互乐.莲都',
    desc: '丽水莲都特色棋牌 熟人约局',
    icon: 'http://dl.lishuihuanletang.com/liandu/icon.png',
    preview: 'http://dl.lishuihuanletang.com/liandu/preview.png',
    preview2: 'http://dl.lishuihuanletang.com/liandu/preview2.png',
    android: 'http://dl.zhenzhenzhaoming.com/liandu/lsgs.apk',
    ioscert: 'https://dl.zhenzhenzhaoming.com/liandu/lsgs.plist',
    ios: '',//这里配置IOS APP Store 下载地址
    detail1: '专业特色丽水莲都地区玩法！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战地道的丽水棋牌，让玩家有身临其境的真实体验',
  },
  "lssc" : {
    title: '丽水互乐.遂昌',
    desc: '丽水遂昌特色棋牌 熟人约局',
    icon: 'http://dl.lishuihuanletang.com/suichang/icon.png',
    preview: 'http://dl.lishuihuanletang.com/suichang/preview.png',
    preview2: 'http://dl.lishuihuanletang.com/suichang/preview2.png',
    android: 'http://dl.zhenzhenzhaoming.com/suichang/lssc.apk',
    ioscert: 'https://dl.zhenzhenzhaoming.com/suichang/lssc.plist',
    ios: '',//这里配置IOS APP Store 下载地址
    detail1: '专业特色丽水遂昌地区玩法！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战地道的丽水棋牌，让玩家有身临其境的真实体验',
  },
  "gf" : {
    title: '功夫保定麻将',
    desc: '特色棋牌 熟人约局',
    icon: 'http://dl.dysceapp.com/icon.png',
    preview: 'http://dl.dysceapp.com/preview.png',
    preview2: 'http://dl.dysceapp.com/preview2.png',
    android: 'http://dl.dysceapp.com/gf.apk',
    ioscert: 'https://dl.dysceapp.com/gf.plist',
    ios: '',//这里配置IOS APP Store 下载地址
    detail1: '专业特色地区玩法！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战，让玩家有身临其境的真实体验',
  },
  "xj" : {
    title: '江山牌友乐',
    desc: '特色棋牌 熟人约局',
    icon: 'http://dl.thunneycomb.com/icon.png',
    preview: 'http://dl.thunneycomb.com/preview.png',
    preview2: 'http://dl.thunneycomb.com/preview2.png',
    android: 'http://dl.thunneycomb.com/jspyl.apk',
    ioscert: 'https://dl.thunneycomb.com/jspyl.plist',
    ios: '',//这里配置IOS APP Store 下载地址
    detail1: '专业特色地区玩法！',
    detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战，让玩家有身临其境的真实体验',
  },
    "panan" : {
        title: '磐安麻将',
        desc: '特色棋牌 熟人约局',
        icon: 'http://dl.lishuihuanletang.com/panan/icon.png',
        preview: 'http://dl.lishuihuanletang.com/panan/preview.png',
        preview2: 'http://dl.lishuihuanletang.com/panan/preview2.png',
        android: 'http://dl.zhenzhenzhaoming.com/panan/panan.apk',
        ioscert: 'https://dl.zhenzhenzhaoming.com/panan/panan.plist',
        ios: '',//这里配置IOS APP Store 下载地址
        detail1: '专业特色磐安地区玩法！',
        detail2: '超好玩的社交游戏平台，实时聊天，与好友、牌友约战地道的磐安棋牌，让玩家有身临其境的真实体验',
    },
};
function app(s) {
    return apps[s];
}