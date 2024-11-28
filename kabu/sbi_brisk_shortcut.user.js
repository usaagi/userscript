// ==UserScript==
// @name        SBI Bisk Shortcut
// @description SBIにログイン時に全板へのリンクを表示しBRISK起動を簡略化します
// @namespace   usaagi
// @match       https://site1.sbisec.co.jp/ETGate/
// @run-at      document-end
// @version     1.0
// ==/UserScript==

'use strict';

// ページ上部にリンクを追加
const link = document.createElement('a');
link.href = "javascript:void(0);";
link.textContent = "全板 (Brisk起動)";
link.style.cssText = 'display: block; margin: 10px; color: blue; text-decoration: none;';
link.onclick = function() {
	JavaScript: openStockFull('/ETGate/?_ControlID=WPLETsmR001Control&_PageID=WPLETsmR001Sdtl12&_DataStoreID=DSWPLETsmR001Control&sw_page=WNS001&sw_param1=domestic&sw_param2=priceboard&sw_param3=full&sw_param6=8306&sw_param7=TKY&getFlg=on');
};

// リンク用のコンテナを作成
const container = document.createElement('div');
container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; background-color: white; z-index: 1000; padding: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);';
container.appendChild(link);

// コンテンツに追加される余白を設定
const body = document.body;
body.style.paddingTop = '60px';  // 固定リンクの高さ分だけ余白を追加

// リンクをページ上部に挿入
body.prepend(container);

