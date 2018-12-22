/**
 * Created by bruceyang on 1/5/17.
 */

 var area = {
  local : {
    db : 'mysql://root:douniu@dev1.lekoy.com/majhong',
    host : 'http://localhost:3000',
    gamesrv : 'dev1.lekoy.com',
    id : 'dev',
    port:5001
  },
  cs : {
    db : 'mysql://root:douniu@139.196.167.96/majhong',
    host : 'http://dev2.lekoy.com',
    gamesrv : 'dev2.lekoy.com',
    id : 'cs',
    port:5001
  },
  qg : {
    db : 'mysql://root:douniu@139.196.167.96/majhong',
    host : 'http://dev2.lekoy.com',
    gamesrv : 'dev2.lekoy.com',
    id : 'qg',
    port:5001
  },
  qz : {
    db : 'mysql://root:douniu@139.196.167.96/majhong',
    host : 'http://dev2.lekoy.com',
    gamesrv : 'dev2.lekoy.com',
    id : 'qz',
    port:5001
  },
  dh : {
    db : 'mysql://root:douniu@139.196.167.96/majhong',
    host : 'http://dev2.lekoy.com',
    gamesrv : 'dev2.lekoy.com',
    id : 'dh',
    port:5001
  },
  qd : {
    db : 'mysql://root:douniu@139.196.167.96/majhong',
    host : 'http://dev3.lekoy.com',
    gamesrv : 'dev3.lekoy.com',
    id : 'qd',
    port:5001
  },
  sx : {
    db : {
      host: 'dev1.lekoy.com',
      database: 'majhong',
      user: 'root',
      password: 'douniu',
      protocol: 'mysql',
      port: '3306',
      query: {pool: true, debug: false}
    },
    host : 'http://www.yiqigame.me:3008',
    gamesrv : 'jx.17xiayou.com',
    mallsrv: 'mall.17xiayou.com',
    id : 'sx',
    port:5001,
    srvTypes : [
      {'shanxitdh':'推倒胡'},
      {'shanxikdd':'扣点点'},
      {'shanxiqwhm':'曲沃侯马'}
    ]
  },
  wuhan : {
    db : {
      host: 'rm-bp11mr80z1vr5swtm.mysql.rds.aliyuncs.com',
      database: 'wuhan',
      user: 'lakesi',
      password: 'lakesi1234!',
      protocol: 'mysql',
      port: '3306',
      query: {pool: true, debug: false}
    },
    // host : 'http://www.abcd1234.online:30160',
    host : 'http://www.luminositygame.com:30160',
    gamesrv : '47.96.3.92',
    mall: 'mall.luminositygame.com',
    id : 'wuhan',
    port:3016,//gamesrv port
    srvTypes : [
      {'wuhan':'武汉麻将'}
    ]

  },
  current: function() { return this.wuhan;}
};

module.exports = area;
