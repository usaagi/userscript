// ==UserScript==
// @name        GMOクリック信用建玉に評価損益率を表示
// @description GMOクリック証券の信用建玉一覧に評価損益率を表示します。(サマリー表示のチェックが付いてると動作しません)
// @namespace   usagi2
// @include     https://kabu.click-sec.com/sec1-*/kabu/tatePositionList.do
// @version     0.4
// @downloadURL https://github.com/usagi2/userscript/raw/master/GMOclick_UnrealizedGainsRate.user.js
// @grant       none
// @run-at      document-end
// ==/UserScript==

(function () {
'use strict';

var rows = document.querySelectorAll('tr[class="odd"], tr[class="even"]');

for (var i = 0, row; row = rows[i]; i++) {
  if (row.cells && row.cells.length == 10) {
    var soneki = parseInt(removeComma(trim(row.cells[8].textContent))); // 損益
    
    if (soneki === 0) {
      continue;
    }

    var c7 = removeComma(trim(row.cells[7].textContent));         // 建玉代金+諸経費
    var tmp = c7.replace(/\s+/g, ' ').split(/\s/, 2); // 分離
    var tatekei = parseInt(tmp[0]) + parseInt(tmp[1]);             // 合計
    var p = (soneki / tatekei * 100).toFixed(2);                  // 損益率
    
    var span = document.createElement('span');
    span.setAttribute("class", 'minus_' + (soneki > 0 ? 'red' : 'blue'));
    span.appendChild(document.createTextNode(p + '%'));
    row.cells[8].appendChild(document.createElement('br'));
    row.cells[8].appendChild(span);
  }
}

function trim(str) {
  return str.replace(/^\s+/g, '').replace(/\s+$/g, '');
}

function removeComma(str) {
  return str.replace(/,/g, '');
}

})();
