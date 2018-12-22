/**
 *
 * @authors yangce
 * @date    2017/6/1
 * @version $
 */
(function () {
    var ua = navigator.userAgent.toLocaleLowerCase(),
        hasIos = !!navigator.userAgent.match(/iphone|ipod/ig),
        hasAndroid = !!navigator.userAgent.match(/android/ig);
    var domain = '//static.tcy365.com';
    var domainTest = '//static.tcy365.org:1507';
    var domainDev = '//static.tcy365.org:1506';
    var domainStable = '//static.tcy365.org:1505';
    var domainPre = '//static.tcy365.com:2505';
    var curDomain = '';
    if (window.location.port) {
        if(window.location.port =='1505'){
            curDomain = domainStable
        } else if(window.location.port =='1506'){
            curDomain = domainDev
        } else if(window.location.port == '1507'){
            curDomain = domainTest;
        } else if(window.location.port == '2505') {
            curDomain = domainPre
        }
    } else {
        curDomain = domain;
    }
    function isWeChat() {
        if (!!navigator.userAgent.match(/micromessenger/ig)) {
            $('.down-link').attr('href', 'javascript:;');

            if (hasAndroid) {
                $('.shade img').attr('src', curDomain + '/mobile/sys/sys_tcy/image/' + 'tipAndroid.png');

            }
            if (hasIos) {
                $('.shade img').attr('src', curDomain+'/mobile/sys/sys_tcy/image/' + 'tipIos.png')

            }
            $('.shade').show();
            $('.shade').on('click', function () {
                $('.shade').hide();
            });
        }
    }

    $('.down-link').on('click', function () {
        isWeChat()
    });
    isWeChat();
})();
