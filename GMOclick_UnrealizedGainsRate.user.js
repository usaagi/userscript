// ==UserScript==
// @name        GMOクリック信用建玉に評価損益率を表示
// @description GMOクリック証券の信用建玉一覧に評価損益率を表示します。(サマリー表示のチェックが付いてると動作しません)
// @namespace   usagi2
// @include     https://kabu.click-sec.com/sec1-1/kabu/tatePositionList.do
// @version     0.1
// @downloadURL https://github.com/usagi2/userscript/raw/master/GMOclick_UnrealizedGainsRate.user.js
// @run-at      document-end
// ==/UserScript==
'use strict';

var rows = document.querySelectorAll('tr[class="odd"], tr[class="even"]');

for each (var row in rows) {
  if (row.cells && row.cells.length == 10) {
    var soneki = parseInt(removeComma(trim(row.cells[8].textContent))); // 損益
    
    if (soneki == 0) {
      contnue;
    }

    var c7 = removeComma(trim(row.cells[7].textContent));         // 建玉代金+諸経費
    var [daikin, other] = c7.replace(/\s+/g, ' ').split(/\s/, 2); // 分離
    var tatekei = parseInt(daikin) + parseInt(other);             // 合計
    var p = (soneki / tatekei * 100).toFixed(2);                  // 損益率
    
    var span = document.createElement('span');
    span.setAttribute("class", 'minus_' + (soneki > 0 ? 'red' : 'blue'));
    span.appendChild(document.createTextNode(p + '%'));
    row.cells[8].appendChild(document.createElement('br'));
    row.cells[8].appendChild(span);
    console.log(row.cells[8].innerHtml);
  }
}

function trim(str) {
  return str.replace(/^\s+/g, '').replace(/\s+$/g, '');
}

function removeComma(str) {
  return str.replace(/,/g, '');
}
