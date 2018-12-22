(function (doc, win) {
    var docEl = doc.documentElement;
    var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
    var recalc = function () {
        var clientWidth = docEl.clientWidth;
        if (!clientWidth) {
            return true;
        }
        docEl.style.fontSize = 20 * (clientWidth / 320) + 'px';
    };
    if (!doc.addEventListener) {
        return true;
    }

    //测试像素比
    var dev = window.devicePixelRatio;
    docEl.setAttribute('dev-pix', dev.toFixed(2));

    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);