// ==UserScript==
// @name        楽天
// @description テレコンを普通のブラウザで利用
// @namespace   usagi
// @include     https://member.rakuten-sec.co.jp/app/*.do;BV_SessionID=*
// @version     0.1
// @run-at      document-end
// ==/UserScript==


(function () {
  'use strict';
  
  console.log(`テレコンのリンクを表示 ${location.href}`);
  
  let m = location.href.match(String.raw`/app/.*\.do;BV_SessionID=(.*)\?eventType=`);

  if (!m) {
    return;
  }
  
  let session_id = m[1];
  
  console.log(`session id: ${session_id}`);
//  console.dir(document.getElementById('siteID').getElementsByTagName('a')[0].getAttribute('href'));
       
  let div = document.createElement('div');
  div.innerHTML = `<a href="https://member.rakuten-sec.co.jp/bv/app/info_jp_nikkei_telecom.do;BV_SessionID=${session_id}?eventType=init&agreeFlg=0">日経テレコンへ</a>`;
  div.setAttribute('style', 'padding: 10px;');

  // 上部に表示させるには insertBefore 下部は appendChild
  document.body.appendChild(div, document.body.firstChild);


})();
