/**
 * Created by bruceyang on 1/5/17.
 */

var model = {
    inited: false,
    db: null
};

model.init = function (db) {
    if (this.inited)
        return;

    this.inited = true;
    this.db = db;

    this.operation = db.define('qp_operationLog', {
        id: {type: 'integer'},
        uid: {type: 'integer'},
        user: {type: 'text'},
        operation: {type: 'text'}
    });

    this.user = db.define('qp_backendUser', {
        id: {type: 'serial', key: true}, // the auto-incrementing primary key
        uid: {type: 'integer'},
        name: {type: 'text'},
        mail: {type: 'text'},
        password: {type: 'text'},
        initPassword: {type: 'text'},
        isAgent: {type: 'integer'},
        level1Agent: {type: 'integer'},
        level2Agent: {type: 'integer'},
        bonusOut: {type: 'number'},
        bonusTotal: {type: 'number'},
        agentId: {type: 'text'},
        rootAgent: {type: 'integer'},
        agentLevel: {type: 'integer'},
        phoneNumber: {type: 'text'},
        bonusPercent: {type: 'integer'},
        extl3Agent: {type: 'integer'},
        extl4Agent: {type: 'integer'},
        extl5Agent: {type: 'integer'},
        extl6Agent: {type: 'integer'},
        extl7Agent: {type: 'integer'},
        extl8Agent: {type: 'integer'},
        extl9Agent: {type: 'integer'}
    });

    this.user1 = db.define('qp_backendUser', {
        id: {type: 'serial', key: true}, // the auto-incrementing primary key
        uid: {type: 'integer'},
        name: {type: 'text'},
        mail: {type: 'text'},
        password: {type: 'text'},
        initPassword: {type: 'text'},
        isAgent: {type: 'integer'},
        level1Agent: {type: 'integer'},
        level2Agent: {type: 'integer'},
        bonusOut: {type: 'number'},
        bonusTotal: {type: 'number'},
        agentId: {type: 'text'},
        rootAgent: {type: 'integer'},
        createdTime: {type: 'date'},
        agentLevel: {type: 'integer'},
        phoneNumber: {type: 'text'},
        bonusPercent: {type: 'integer'},
        extl3Agent: {type: 'integer'},
        extl4Agent: {type: 'integer'},
        extl5Agent: {type: 'integer'},
        extl6Agent: {type: 'integer'},
        extl7Agent: {type: 'integer'},
        extl8Agent: {type: 'integer'},
        extl9Agent: {type: 'integer'},
        updateTime: {type: 'date'}
    });

    this.player = db.define('qp_player', {
        uid: {type: 'serial', key: true}, // the auto-incrementing primary key
        deviceID: {type: 'text'},
        regType: {type: 'integer'},
        userName: {type: 'text'},
        password: {type: 'text'},
        nickName: {type: 'text'},
        userSex: {type: 'text'},
        headUrl: {type: 'text'},
        vipLevel: {type: 'integer'},
        coinNum: {type: 'integer'},
        gemNum: {type: 'integer'},
        scoreNum: {type: 'integer'},
        charm: {type: 'integer'},
        firstPaid: {type: 'integer'},
        phoneNumber: {type: 'text'},
        loginCount: {type: 'integer'},
        registerTime: {type: 'date'},
        playedTime: {type: 'date'},
        clientType: {type: 'integer'},
        GM: {type: 'integer'},
        agentCode: {type: 'text'},
        rootAgent: {type: 'integer'},
        locked: {type: 'integer'}
    });

    this.notice = db.define('qp_notice', {
        id: {type: 'integer'},
        type: {type: 'integer'},
        title: {type: 'text'},
        contents: {type: 'text'},
        uid: {type: 'integer'}
    });

    this.notice1 = db.define('qp_notice', {
        id: {type: 'integer'},
        type: {type: 'integer'},
        title: {type: 'text'},
        contents: {type: 'text'},
        uid: {type: 'integer'},
        createdtime: {type: 'date', time: true},
        startTime: {type: 'date', time: true},
        endTime: {type: 'date', time: true},
        intervalTime: {type: 'date', time: true}
    });

    this.subAgent = db.define('qp_tmpSubAgent', {
        uid: {type: 'integer'},
        subUid: {type: 'integer'}
    });

    this.donates = db.define('qp_fangkaRecord', {
        uid: {type: 'integer'},
        userName: {type: 'text'},
        giveUid: {type: 'integer'},
        giveUserName: {type: 'text'},
        gemNum: {type: 'integer'},
        recordTime: {type: 'date', time: true}
    });

    this.settings = db.define('qp_settings', {
        id: {type: 'integer'},
        key: {type: 'text'},
        value: {type: 'text'}
    });

    this.dailyDataExt = db.define('qp_dailyData_ext', {
        id: {type: 'integer'},
        serverType: {type: 'text'},
        activeUsers: {type: 'integer'},
        usedCards: {type: 'integer'},
        openTables: {type: 'number'}
    });

    this.dailyData = db.define('qp_dailyData', {
        id: {type: 'integer'},
        newUsers: {type: 'integer'},
        activeUsers: {type: 'integer'},
        totalUsers: {type: 'integer'},
        buyCards: {type: 'integer'},
        usedCards: {type: 'integer'},
        incomeTotal: {type: 'number'},
        apBonusIn: {type: 'number'},
        apBonusOut: {type: 'number'},
        leftCards: {type: 'number'},
        openTables: {type: 'number'},
    });

    this.min10Data = db.define('qp_10minData', {
        id: {type: 'integer'},
        newUsers: {type: 'integer'},
        activeUsers: {type: 'integer'},
        buyCards: {type: 'integer'},
        usedCards: {type: 'integer'},
        leftCards: {type: 'number'},
        openTables: {type: 'number'},
    });

    this.fangkaRecordExt = db.define('qp_fangkaRecordExt', {
        id: {type: 'integer'},
        user_origin: {type: 'integer'},
        user_now: {type: 'integer'},
        userGive_origin: {type: 'integer'},
        userGive_now: {type: 'integer'},
        payId: {type: 'integer'}
    });

    this.payRecord = db.define('qp_payRecord', {
        id: {type: 'integer'},
        playerId: {type: 'integer'},
        traceNo: {type: 'text'},
        orderNo: {type: 'text'},
        orderAmount: {type: 'number'},
        payChannel: {type: 'text'},
        productName: {type: 'text'},
        productNum: {type: 'integer'},
        status: {type: 'integer'}
    });

    this.payRecord1 = db.define('qp_payRecord', {
        id: {type: 'integer'},
        playerId: {type: 'integer'},
        traceNo: {type: 'text'},
        orderNo: {type: 'text'},
        orderAmount: {type: 'number'},
        payChannel: {type: 'text'},
        productName: {type: 'text'},
        productNum: {type: 'integer'},
        status: {type: 'integer'},
        orderTime: {type: 'date', time: true},
    });

    this.bonusIn = db.define('qp_fangkaBonusIn', {
        id: {type: 'integer'},
        fkrId: {type: 'integer'},
        l1Agent: {type: 'integer'},
        l1Bonus: {type: 'number'},
        l2Agent: {type: 'integer'},
        l2Bonus: {type: 'number'},
        playerAgent: {type: 'integer'},
        playerBonus: {type: 'number'},
        createTime: {type: 'date', time: true},
        extl3Agent: {type: 'integer'},
        extl3Bonus: {type: 'number'},
        extl4Agent: {type: 'integer'},
        extl4Bonus: {type: 'number'},
        extl5Agent: {type: 'integer'},
        extl5Bonus: {type: 'number'},
        extl6Agent: {type: 'integer'},
        extl6Bonus: {type: 'number'},
        extl7Agent: {type: 'integer'},
        extl7Bonus: {type: 'number'},
        extl8Agent: {type: 'integer'},
        extl8Bonus: {type: 'number'},
        extl9Agent: {type: 'integer'},
        extl9Bonus: {type: 'number'}
    });

    this.bonusOut = db.define('qp_fangkaBonusOut', {
        id: {type: 'integer'},
        uid: {type: 'integer'},
        createTime: {type: 'date', time: true},
        cny: {type: 'number'},
        batchNo: {type: 'text'},
        serialNo: {type: 'text'},
        bankAccount: {type: 'text'},
        bankUserName: {type: 'text'},
        bankName: {type: 'text'},
        status: {type: 'integer'},
        wxCfmUrl: {type: 'text'}
    });

    this.bonusOut1 = db.define('qp_fangkaBonusOut', {
        id: {type: 'integer'},
        uid: {type: 'integer'},
        cny: {type: 'number'},
        batchNo: {type: 'text'},
        serialNo: {type: 'text'},
        bankAccount: {type: 'text'},
        bankUserName: {type: 'text'},
        bankName: {type: 'text'},
        status: {type: 'integer'},
        wxCfmUrl: {type: 'text'}
    });

    this.playData = db.define('qp_playdata', {
        uid1: {type: 'integer'},
        uid2: {type: 'integer'},
        uid3: {type: 'integer'},
        uid4: {type: 'integer'},
        uid5: {type: 'integer'},
        uid6: {type: 'integer'},
        uid7: {type: 'integer'},
        uid8: {type: 'integer'},
        score1: {type: 'integer'},
        score2: {type: 'integer'},
        score3: {type: 'integer'},
        score4: {type: 'integer'},
        score5: {type: 'integer'},
        score6: {type: 'integer'},
        score7: {type: 'integer'},
        score8: {type: 'integer'},
        ratio1: {type: 'number'},
        ratio2: {type: 'number'},
        ratio3: {type: 'number'},
        ratio4: {type: 'number'},
        ratio5: {type: 'number'},
        ratio6: {type: 'number'},
        ratio7: {type: 'number'},
        ratio8: {type: 'number'},
        ownerId: {type: 'integer'},
        tableId: {type: 'integer'},
        serverType: {type: 'text'}
    });

    this.yylDailyData = db.define('qp_yyl_daily_data', {
        id: {type: 'integer'},
        totalExpend: {type: 'integer'},
        gameNum: {type: 'integer'},
        totalReward: {type: 'integer'},
        playerNum: {type: 'integer'},
        time: {type: 'date', time: true},
        createTime: {type: 'date', time: true},
    });
};

module.exports = model;