// ==UserScript==
// @name        株探修正幅表示
// @description 株探の業績修正ページでQ毎の業績を計算して表示します。
// @namespace   usaagi
// @include     https://kabutan.jp/stock/news?code=*
// @include     https://kabutan.jp/news/?b=*
// @run-at      document-end
// @version     0.1
// ==/UserScript==

(function() {
    'use strict';
    
    // 一番かんたんなのは imarket を見て修正幅を確認すること!w
    
    

    // 1. 業績修正のページかどうかの判定
    // #finance_box .gyousekishuusei_title があるか
    const is_syuusei_page = document.querySelector('#finance_box .gyousekishuusei_title');

    if (!is_syuusei_page) {
        console.log('このページは業績予想の修正ページではありません!')
        return;
    }

    console.log('このページは業績予想の修正ページです!')

    // <title>からコードを取得
    const title = document.querySelector('title');
    const getCode = (text) => {
        const matches = /\d{4}/.exec(text);
        return matches ? matches[0] : null;// (\d{4}) なら [1]
    };

    const code = getCode(title.textContent)

    if (!code) {
        console.log('codeが見つかりません')
        return;
    }

    console.log(`code: ${code}`)

    /*            
    // 決算ページの取得
    // https://kabutan.jp/stock/finance?code=7928
    GM_xmlhttpRequest({
        method: 'GET',
        url: "https://kabutan.jp/stock/finance?code=" + code,
        onload: function(resp){
        var range = document.createRange();
        range.setStartAfter(document.body);
        var xhr_frag = range.createContextualFragment(resp.responseText);
        var xhr_doc = document.implementation.createDocument(null, 'html', null);
        xhr_doc.adoptNode(xhr_frag);
        xhr_doc.documentElement.appendChild(xhr_frag);
        var node = xhr_doc.evaluate("//span//b[@class='gb1']", xhr_doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        GM_log("node.localName: " + node.localName);
        GM_log("node.textContent: " + node.textContent);
        }
    });
    */


    // 上期か下期どっちの修正か判定
    // 1Q後などに通期経常を修正して上期と下期　両方を修正するパターン https://kabutan.jp/stock/news?code=7928&b=k202004100126

    // 4. 決算ページの業績から計算

    // 5. 表示


})();
