// ==UserScript==
// @name        楽天テレコンをブラウザで見る
// @description 楽天証券のページ下に日経テレコンへのリンクを追加(ログイン直後とトップページのみ)
// @namespace   usaagi
// @include     https://member.rakuten-sec.co.jp/app/home.do;BV_SessionID=*
// @include     https://member.rakuten-sec.co.jp/app/com_page_template.do;BV_SessionID=*
// @version     0.6
// @run-at      document-end
// ==/UserScript==

'use strict';

console.log(`テレコンのリンクを表示 ${location.href}`);

const m = location.href.match(String.raw`/app/.*\.do;BV_SessionID=(.*)\?`);

if (!m) {
	return
}

const sessionId = m[1];

console.log(`session id: ${sessionId}`);

const div = document.createElement('div');
div.innerHTML = `<a href="https://member.rakuten-sec.co.jp/bv/app/info_jp_nikkei_telecom.do;BV_SessionID=${sessionId}?eventType=init&agreeFlg=0" rel="noreferrer" target="_blank">日経テレコンを開く</a>`;
div.style.cssText = 'padding: 5px; width: 100%; text-align: center; font-size: 14px;';

const container = document.createElement('div');
container.style.cssText = 'position: fixed; bottom: 0; left: 0; width: 100%; background-color: white; z-index: 1000; padding: 5px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);';
container.appendChild(div);

document.body.style.paddingBottom = '50px'; // 固定リンクの高さ分だけ余白を追加
document.body.appendChild(container);
