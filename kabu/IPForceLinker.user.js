// ==UserScript==
// @name        IPForce Linker
// @description 公報番号をリンクします
// @namespace   usagi2
// @include     http://ipforce.jp/Login/apview1*
// @version     0.1
// @run-at      document-end
// ==/UserScript==

(function () {
'use strict';

let tds = document.getElementById('apviewtbl').querySelectorAll('tbody tr td:nth-child(1)')
console.info(`項目数: ${tds.length}件`)

tds.forEach((td) => {
  
  let span = td.querySelector('span:nth-child(1)')
  let url = 'http://ipforce.jp/patent-jp-'
  let key = span.textContent
  let text = ''
  
  // td内の最初のテキストノードを取り出す
  for (let i = 0; i < td.childNodes.length; ++i) {
    if (td.childNodes[i].nodeType === 3) {
      text = td.childNodes[i].textContent.trim()
      break
    }
  }
  
  switch (text) {
    case '再表':
      url += 'S'
      break
    case '特開':
      url += 'A'
      break
    case '特表':
      url += 'T'
      break
    case '特許':
      url += 'B9'
      break
      
    default:
      console.error(`不明な識別子 ${text}`)
      break
  }

  url += '-' + key
  console.log(`${text} ${key}`)
  span.innerHTML = `<a href="${url}" target="_blank">${key}</a>`
  
  // 再表 http://ipforce.jp/patent-jp-S-2016-207997
  // 特開 http://ipforce.jp/patent-jp-A-2017-115982
})


})();
