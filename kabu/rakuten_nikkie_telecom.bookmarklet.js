// 楽天証券から日経テレコンに移動するブックマークレット
// 楽天証券にログイン後、URLにBV_SessionID=が含まれているページで実行可能
//
// 適当なブックマークを作り編集から以下のコード(1行)に変更。(javascript:からコピー)
// javascript:(function(){var a=location.href.match("\\.do;BV_SessionID=(.*)\\?");a&&(location.href="https://member.rakuten-sec.co.jp/bv/app/info_jp_nikkei_telecom.do;BV_SessionID="+a[1]+"?eventType=init&agreeFlg=0");})();


(function () {
    let m = location.href.match('\\.do;BV_SessionID=(.*)\\?');
    if (m) {
        location.href = 'https://member.rakuten-sec.co.jp/bv/app/info_jp_nikkei_telecom.do;BV_SessionID=' + m[1] + '?eventType=init&agreeFlg=0'
    }
})();
