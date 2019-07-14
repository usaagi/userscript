// ==UserScript==
// @name        traders_kessan2kabutan
// @description 決算一覧ページのリンクを株探に変更します
// @namespace   usaagi
// @include     https://www.traders.co.jp/domestic_stocks/domestic_market/kessan_s/kessan_s.asp
// @version     0.2
// @run-at      document-end
// ==/UserScript==

'use strict';

let links = document.querySelectorAll('#middle_contents_600 > table:nth-child(3) > tbody > tr > td > table:nth-child(2) > tbody > tr:nth-child(n+2) > td:nth-child(5) > a');
console.info(`項目数: ${links.length}件`);

links.forEach((link) => {
  let url = link.getAttribute('href');
  let code = link.textContent;
  //let url = 'https://www.traders.co.jp/stocks_info/individual_list_top.asp?FLG=0&SC=2354'

  link.setAttribute('href', `https://kabutan.jp/stock/news?code=${code}`)
  link.setAttribute('target', '_blank')
});
